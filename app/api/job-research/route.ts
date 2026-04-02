import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSheetsClient, SPREADSHEET_ID, ensureSheets } from "@/lib/sheets";

const START_DATE = "2026-03-30";
const JOB_PREFIX = "[취업]";

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

// 2주치 날짜 생성 (오늘부터 14일, 주말 포함 전체)
function getNext14Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toLocaleDateString("en-CA"));
  }
  return dates;
}

// ── GET: 마지막 업데이트 날짜 확인 ───────────────────────────────────────────
export async function GET() {
  try {
    if (!SPREADSHEET_ID) return NextResponse.json({ updatedAt: null });

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["취업정보"]);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "취업정보!A2:B2",
    });

    const row = (res.data.values ?? [])[0];
    if (!row?.[0]) return NextResponse.json({ updatedAt: null });

    return NextResponse.json({ updatedAt: row[0], data: row[1] ? JSON.parse(row[1] as string) : null });
  } catch {
    return NextResponse.json({ updatedAt: null });
  }
}

// ── POST: 채용 공고 분석 → 로드맵 시트에 구체적 플랜 추가 (Cron 또는 수동) ───
export async function POST() {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY 없음" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // 기존 로드맵 읽기
    let allRows: string[][] = [];
    let headers: string[] = ["주차","날짜","요일(영)","요일(한)","세션제목","유형","시간(분)","설명","완료"];

    if (SPREADSHEET_ID) {
      try {
        const sheets = getSheetsClient();
        await ensureSheets(sheets, SPREADSHEET_ID, ["로드맵", "취업정보"]);
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: "로드맵!A1:I1000",
        });
        const raw = res.data.values ?? [];
        if (raw[0]) headers = raw[0] as string[];
        allRows = raw.slice(1) as string[][];
      } catch { /* ignore */ }
    }

    const existingSummary = allRows
      .map((r) => `${r[1]} ${r[4]}`)
      .join("\n");

    const next14 = getNext14Days();
    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

    // Claude + web_search: 채용 공고 분석 + ADHD 친화 플랜 생성
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8192,
      thinking: { type: "adaptive" },
      tools: [{ type: "web_search_20260209" as "web_search_20260209", name: "web_search" }],
      messages: [{
        role: "user",
        content: `원티드, 사람인, 잡코리아에서 "데이터 엔지니어 신입" "AI 개발자 신입" 채용 공고를 검색해서 분석해주세요.

현재 내 로드맵에 있는 내용:
${existingSummary || "(없음)"}

오늘: ${todayStr}
앞으로 14일 날짜: ${next14.join(", ")}

임무:
1. 채용 공고에서 가장 많이 요구하는 기술/역량 파악
2. 내 로드맵에 없는 것 중 채용에 꼭 필요한 것 식별
3. 아래 날짜들에 구체적인 학습 세션 배정

ADHD 친화 플랜 규칙:
- 세션제목: "[취업] 행동 + 결과물" 형식 (예: "[취업] Pandas groupby 실습 → 분석 함수 3개 완성")
- 설명: "1단계: ... → 2단계: ... → 완료기준: ..." 처럼 단계별로 명확하게
- 한 세션에 한 가지 기술만 집중
- 시간: 45-90분 (ADHD 집중 가능 범위)
- 결과물이 명확한 것만 (블로그 글 1개, 함수 3개, 문제 5개 등)

JSON만 반환:
{
  "analysis": "채용 트렌드 1-2문장 요약",
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "topic": "[취업] 구체적 세션제목",
      "type": "study|practice|review",
      "duration": 60,
      "description": "1단계: ... → 2단계: ... → 완료기준: ..."
    }
  ]
}

sessions는 14일 중 8-10개만, 로드맵에 없는 새 기술 위주로 배정.`,
      }],
    });

    // 마지막 텍스트 블록에서 JSON 추출
    const textBlocks = response.content.filter((b) => b.type === "text");
    const lastText = textBlocks[textBlocks.length - 1]?.text ?? "";
    const jsonMatch = lastText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("응답 파싱 실패");

    const result = JSON.parse(jsonMatch[0]) as {
      analysis: string;
      sessions: Array<{ date: string; topic: string; type: string; duration: number; description: string }>;
    };

    // 기존 [취업] 행 제거 후 새 행 추가
    const baseRows = allRows.filter((r) => !String(r[4] ?? "").startsWith(JOB_PREFIX));

    const newRows = result.sessions.map((s) => {
      const dayInfo = DAY_MAP[new Date(s.date).getDay()];
      return [
        dateToWeekNum(s.date), s.date, dayInfo.en, dayInfo.kr,
        s.topic, s.type, s.duration, s.description, "미완료",
      ];
    });

    const merged = [...baseRows, ...newRows].sort((a, b) =>
      String(a[1] ?? "").localeCompare(String(b[1] ?? ""))
    );

    if (SPREADSHEET_ID) {
      const sheets = getSheetsClient();

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "로드맵!A1",
        valueInputOption: "RAW",
        requestBody: { values: [headers, ...merged] },
      });

      // 업데이트 날짜 기록
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "취업정보!A1",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            ["updatedAt", "analysis"],
            [todayStr, result.analysis],
          ],
        },
      });
    }

    return NextResponse.json({ ok: true, addedRows: newRows.length, analysis: result.analysis });
  } catch (error) {
    console.error("Job research error:", error);
    return NextResponse.json({ error: "채용 분석 실패" }, { status: 500 });
  }
}
