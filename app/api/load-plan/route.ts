import { NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID } from "@/lib/sheets";
import { StudyPlan, GoalInfo, Task, WeeklyPlan, DayPlan, Session, YearlyEvent } from "@/types/plan";

export async function GET() {
  try {
    if (!SPREADSHEET_ID) {
      return NextResponse.json({ plan: null, visionText: "" });
    }

    const sheets = getSheetsClient();

    // 4개 시트 동시에 읽기
    const [visionRes, tasksRes, weeklyRes, yearlyRes] = await Promise.allSettled([
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "비전!A1:K2" }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "오늘할일!A1:H200" }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "위클리플래너!A1:I300" }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "년간플래너!A1:G200" }),
    ]);

    // 비전 파싱 (데이터 없으면 null 반환)
    if (visionRes.status === "rejected") return NextResponse.json({ plan: null, visionText: "" });
    const visionRows = visionRes.value.data.values ?? [];
    if (visionRows.length < 2) return NextResponse.json({ plan: null, visionText: "" });

    const vRow = visionRows[1];
    const goalInfo: GoalInfo = {
      title:            vRow[1]  ?? "",
      difficulty:       (vRow[2] ?? "중급") as GoalInfo["difficulty"],
      totalHours:       Number(vRow[3])  || 0,
      dailyHours:       Number(vRow[4])  || 0,
      estimatedWeeks:   Number(vRow[5])  || 0,
      estimatedEndDate: vRow[6]  ?? "",
      progressPercent:  Number(vRow[7])  || 0,
      subjects:         (vRow[8] ?? "").split(", ").filter(Boolean),
    };
    const visionText = vRow[9] ?? "";
    const studyTips  = (vRow[10] ?? "").split(" | ").filter(Boolean);

    // 오늘할일 파싱
    const taskDataRows = tasksRes.status === "fulfilled"
      ? (tasksRes.value.data.values ?? []).slice(1)
      : [];
    const todayTasks: Task[] = taskDataRows.map((r) => ({
      id:        r[2] ?? String(Math.random()),
      title:     r[3] ?? "",
      subject:   r[4] ?? "",
      type:      (r[5] ?? "study") as Task["type"],
      duration:  Number(r[6]) || 25,
      completed: r[7] === "완료",
    }));

    // 위클리플래너 파싱
    const weeklyDataRows = weeklyRes.status === "fulfilled"
      ? (weeklyRes.value.data.values ?? []).slice(1)
      : [];
    const weekNumber = Number(weeklyDataRows[0]?.[1]) || 1;
    const theme      = weeklyDataRows[0]?.[2] ?? "";

    const daysMap = new Map<string, DayPlan>();
    const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    for (const r of weeklyDataRows) {
      const dayKey = r[3] ?? "";
      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, { day: r[3] ?? "", dayKr: r[4] ?? "", sessions: [], totalMinutes: 0 });
      }
      const session: Session = {
        topic:       r[5] ?? "",
        type:        (r[6] ?? "study") as Session["type"],
        duration:    Number(r[7]) || 0,
        description: r[8] ?? "",
      };
      const dayPlan = daysMap.get(dayKey)!;
      dayPlan.sessions.push(session);
      dayPlan.totalMinutes += session.duration;
    }
    const weeklyPlan: WeeklyPlan = {
      weekNumber,
      theme,
      days: DAY_ORDER.map((d) => daysMap.get(d)).filter(Boolean) as DayPlan[],
    };

    // 년간플래너 파싱
    const yearlyDataRows = yearlyRes.status === "fulfilled"
      ? (yearlyRes.value.data.values ?? []).slice(1)
      : [];
    const yearlyEvents: YearlyEvent[] = yearlyDataRows.map((r) => ({
      id:          r[1] ?? "",
      month:       Number(r[2]) || 1,
      day:         Number(r[3]) || 1,
      title:       r[4] ?? "",
      type:        (r[5] ?? "milestone") as YearlyEvent["type"],
      description: r[6] ?? "",
    }));

    const plan: StudyPlan = { goalInfo, todayTasks, weeklyPlan, yearlyEvents, studyTips };

    return NextResponse.json({ plan, visionText });
  } catch (error) {
    console.error("Load plan error:", error);
    return NextResponse.json({ plan: null, visionText: "" });
  }
}
