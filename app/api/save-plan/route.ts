import { NextRequest, NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID, ensureSheets } from "@/lib/sheets";
import { StudyPlan } from "@/types/plan";

const SHEET_NAMES = ["비전", "오늘할일", "위클리플래너", "년간플래너"];

export async function POST(req: NextRequest) {
  try {
    const { plan, visionText }: { plan: StudyPlan; visionText?: string } = await req.json();

    if (!SPREADSHEET_ID) {
      return NextResponse.json({ error: "GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다" }, { status: 500 });
    }

    const sheets = getSheetsClient();

    // 없는 시트 자동 생성
    await ensureSheets(sheets, SPREADSHEET_ID, SHEET_NAMES);

    const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });

    // ── 비전 ──────────────────────────────────────────────────────────────────
    const visionValues = [
      ["업데이트시각", "목표", "난이도", "총시간(h)", "일일시간(h)", "예상주수", "예상완료일", "진행률(%)", "과목", "비전텍스트", "학습팁"],
      [
        now,
        plan.goalInfo.title,
        plan.goalInfo.difficulty,
        plan.goalInfo.totalHours,
        plan.goalInfo.dailyHours,
        plan.goalInfo.estimatedWeeks,
        plan.goalInfo.estimatedEndDate,
        plan.goalInfo.progressPercent,
        plan.goalInfo.subjects.join(", "),
        visionText ?? "",
        plan.studyTips.join(" | "),
      ],
    ];

    // ── 오늘할일 ──────────────────────────────────────────────────────────────
    const taskValues = [
      ["날짜", "순번", "id", "제목", "과목", "유형", "시간(분)", "완료"],
      ...plan.todayTasks.map((task, i) => [
        today,
        i + 1,
        task.id,
        task.title,
        task.subject,
        task.type,
        task.duration,
        task.completed ? "완료" : "미완료",
      ]),
    ];

    // ── 위클리플래너 ──────────────────────────────────────────────────────────
    const weeklyRows: (string | number)[][] = [];
    for (const day of plan.weeklyPlan.days) {
      for (const session of day.sessions) {
        weeklyRows.push([
          now,
          plan.weeklyPlan.weekNumber,
          plan.weeklyPlan.theme,
          day.day,
          day.dayKr,
          session.topic,
          session.type,
          session.duration,
          session.description,
        ]);
      }
    }
    const weeklyValues = [
      ["저장일", "주차", "테마", "요일(영)", "요일(한)", "세션제목", "유형", "시간(분)", "설명"],
      ...weeklyRows,
    ];

    // ── 년간플래너 ────────────────────────────────────────────────────────────
    const yearlyValues = [
      ["저장일", "id", "월", "일", "제목", "유형", "설명"],
      ...plan.yearlyEvents.map((event) => [
        now,
        event.id,
        event.month,
        event.day,
        event.title,
        event.type,
        event.description,
      ]),
    ];

    // 4개 시트 동시에 저장
    await Promise.all([
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "비전!A1",
        valueInputOption: "RAW",
        requestBody: { values: visionValues },
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "오늘할일!A1",
        valueInputOption: "RAW",
        requestBody: { values: taskValues },
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "위클리플래너!A1",
        valueInputOption: "RAW",
        requestBody: { values: weeklyValues },
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "년간플래너!A1",
        valueInputOption: "RAW",
        requestBody: { values: yearlyValues },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save plan error:", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }
}
