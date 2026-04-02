import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSheetsClient, SPREADSHEET_ID, ensureSheets } from "@/lib/sheets";
import { EXAM_DB } from "@/data/exams";

const START_DATE = "2026-03-30";

function dateToWeekNum(dateStr: string): number {
  const start = new Date(START_DATE).getTime();
  const d = new Date(dateStr).getTime();
  return Math.max(Math.floor((d - start) / (1000 * 60 * 60 * 24 * 7)) + 1, 1);
}

const DAY_MAP: Record<number, { en: string; kr: string }> = {
  0: { en: "Sunday",    kr: "일요일" },
  1: { en: "Monday",    kr: "월요일" },
  2: { en: "Tuesday",   kr: "화요일" },
  3: { en: "Wednesday", kr: "수요일" },
  4: { en: "Thursday",  kr: "목요일" },
  5: { en: "Friday",    kr: "금요일" },
  6: { en: "Saturday",  kr: "토요일" },
};

// ── POST: 시험 25일 학습 플랜 생성 → 로드맵 시트에 병합 ──────────────────────
export async function POST() {
  try {
    if (!SPREADSHEET_ID) {
      return NextResponse.json({ error: "SPREADSHEET_ID 없음" }, { status: 500 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY 없음" }, { status: 500 });
    }

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["시험검색", "로드맵"]);

    // 저장된 시험 목록
    const examSearchRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "시험검색!A1:B100",
    });
    const savedItems = (examSearchRes.data.values ?? [])
      .slice(1)
      .filter((r) => r[0] && r[1])
      .map((r) => ({ examId: r[0] as string, round: r[1] as string }));

    if (savedItems.length === 0) {
      return NextResponse.json({ ok: true, message: "저장된 시험 없음", addedRows: 0 });
    }

    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const examNames = savedItems
      .map(({ examId }) => EXAM_DB.find((e) => e.id === examId)?.name)
      .filter(Boolean) as string[];

    // 기존 로드맵 읽기
    const roadmapRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "로드맵!A1:I1000",
    });
    const allRows = roadmapRes.data.values ?? [];
    const headers = allRows[0] ?? ["주차","날짜","요일(영)","요일(한)","세션제목","유형","시간(분)","설명","완료"];

    // 기존 [시험] 자동생성 행 제거 (재생성 시 교체)
    const baseRows = allRows.slice(1).filter((r) => {
      const topic = String(r[4] ?? "");
      return !examNames.some((name) => topic.startsWith(`[${name}]`));
    });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // 각 시험에 대해 병렬로 플랜 생성
    const rowGroups = await Promise.all(
      savedItems.map(async ({ examId, round }) => {
        const exam = EXAM_DB.find((e) => e.id === examId);
        const schedule = exam?.schedules.find((s) => s.round === round);
        if (!exam || !schedule || schedule.examDate < todayStr) return [];

        const examDate = new Date(schedule.examDate);
        const studyStart = new Date(examDate);
        studyStart.setDate(studyStart.getDate() - 24);

        const studyDates: string[] = [];
        for (let i = 0; i < 25; i++) {
          const d = new Date(studyStart);
          d.setDate(studyStart.getDate() + i);
          studyDates.push(d.toLocaleDateString("en-CA"));
        }

        const prompt = `당신은 ${exam.name} 자격증 학습 전문가입니다.

시험명: ${exam.name}
시험일: ${schedule.examDate}
학습 기간: ${studyDates[0]} ~ ${studyDates[24]} (25일)

아래 25개 날짜 각각에 학습 세션 1개씩 생성해주세요:
${studyDates.join(", ")}

규칙:
- 1-8일: 핵심 이론 (study)
- 9-18일: 문제 풀이 (practice)
- 19-25일: 복습·모의고사 (review)
- 시간(분): 평일 60-90, 주말 90-120
- 세션제목: "[${exam.name}] 내용" 형식

JSON 배열만:
[{"date":"YYYY-MM-DD","topic":"세션제목","type":"study","duration":90,"description":"설명"}]`;

        try {
          const res = await anthropic.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }],
          });
          const text = res.content.find((b) => b.type === "text")?.text ?? "";
          const match = text.match(/\[[\s\S]*\]/);
          if (!match) return [];

          const sessions = JSON.parse(match[0]) as Array<{
            date: string; topic: string; type: string; duration: number; description: string;
          }>;

          return sessions.map((s) => {
            const dayInfo = DAY_MAP[new Date(s.date).getDay()];
            return [
              dateToWeekNum(s.date), s.date, dayInfo.en, dayInfo.kr,
              s.topic, s.type, s.duration, s.description, "미완료",
            ];
          });
        } catch (e) {
          console.error(`Exam plan error for ${exam.name}:`, e);
          return [];
        }
      })
    );

    const newExamRows = rowGroups.flat();

    // 기존 행 + 새 시험 행 합쳐서 날짜순 정렬
    const merged = [...baseRows, ...newExamRows].sort((a, b) =>
      String(a[1] ?? "").localeCompare(String(b[1] ?? ""))
    );

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "로드맵!A1",
      valueInputOption: "RAW",
      requestBody: { values: [headers, ...merged] },
    });

    return NextResponse.json({ ok: true, addedRows: newExamRows.length });
  } catch (error) {
    console.error("Exam roadmap POST error:", error);
    return NextResponse.json({ error: "시험 플랜 생성 실패" }, { status: 500 });
  }
}

// ── GET: 현재 상태 확인 ───────────────────────────────────────────────────────
export async function GET() {
  try {
    if (!SPREADSHEET_ID) return NextResponse.json({ count: 0 });

    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "로드맵!E2:E1000",
    });
    const examRows = (res.data.values ?? []).filter(
      (r) => String(r[0] ?? "").match(/^\[.+\]/)
    );
    return NextResponse.json({ count: examRows.length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
