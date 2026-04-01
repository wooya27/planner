import { NextResponse } from "next/server";
import { getSheetsClient, SPREADSHEET_ID, ensureSheets } from "@/lib/sheets";
import { WeeklyPlan, DayPlan, Session } from "@/types/plan";

const START_DATE = "2026-03-30"; // 1주차 월요일

const WEEK_THEMES = [
  "DevOps 기초 및 환경 격리",
  "SQL 집중 공략",
  "Pandas & ETL 실전",
  "시스템 아키텍처 & 1차 회고",
];

// 4주 로드맵 전체 데이터
// [주차, 날짜, 요일(영), 요일(한), 세션제목, 유형, 시간(분), 설명]
const ROADMAP: (string | number)[][] = [
  // ── 1주차: DevOps 기초 ───────────────────────────────────────────────────
  [1, "2026-03-30", "Monday",    "월요일", "GitHub 계정 생성 및 CLI 기초",           "study",    90,  "cd, ls, mkdir, cp 기초 명령어 숙달"],
  [1, "2026-03-31", "Tuesday",   "화요일", "Docker 설치 및 Python 3.11 환경 격리",   "practice", 90,  "Docker로 Python 3.11 환경 격리 실습"],
  [1, "2026-04-01", "Wednesday", "수요일", "Git 기초 및 .gitignore 설정",            "study",    90,  "add, commit, push 및 .gitignore 숙달"],
  [1, "2026-04-02", "Thursday",  "목요일", "[핵심] GitHub Pages 블로그 개설",        "practice", 120, "Jekyll 또는 Hugo 템플릿 적용"],
  [1, "2026-04-03", "Friday",    "금요일", "마크다운 문법 + 블로그 첫 포스팅",       "practice", 90,  "마크다운 익히기, 인사말 및 로드맵 포스팅"],
  [1, "2026-04-04", "Saturday",  "토요일", "[블로그 포스팅 1] Docker Python 에러 해결기", "practice", 120, "Windows/Mac Docker 환경 에러 해결 포스팅"],
  [1, "2026-04-05", "Sunday",    "일요일", "1주차 복습 및 회고",                     "review",   60,  "주간 피드백 및 자기평가"],

  // ── 2주차: SQL 집중 ──────────────────────────────────────────────────────
  [2, "2026-04-06", "Monday",    "월요일", "기초 Query (SELECT, WHERE, LIKE, IN)",  "study",    90,  "SQL 기본 쿼리 완전 정복"],
  [2, "2026-04-07", "Tuesday",   "화요일", "집계와 그룹화 (GROUP BY, HAVING)",      "study",    90,  "GROUP BY, HAVING, DISTINCT 실습"],
  [2, "2026-04-08", "Wednesday", "수요일", "조인 연산 (INNER, LEFT, SELF JOIN)",    "study",    90,  "조인 시각적 구조 이해 및 실습"],
  [2, "2026-04-09", "Thursday",  "목요일", "서브쿼리 vs CTE (WITH 문) 성능 비교",   "study",    120, "CTE로 복잡한 쿼리 구조화하는 법"],
  [2, "2026-04-10", "Friday",    "금요일", "[심화] Window Functions (RANK, LEAD, LAG)", "study", 120, "토스 단골 문제 Window Functions 마스터"],
  [2, "2026-04-11", "Saturday",  "토요일", "[블로그 포스팅 2] 프로그래머스 SQL Kit 풀이", "practice", 120, "LEVEL 1~3 풀이 및 CTE 구조화 포스팅"],
  [2, "2026-04-12", "Sunday",    "일요일", "2주차 복습 및 SQL 회고",                "review",   60,  "SQL 전체 복습 및 자기평가"],

  // ── 3주차: Pandas & ETL ──────────────────────────────────────────────────
  [3, "2026-04-13", "Monday",    "월요일", "Pandas DataFrame 구조 및 CSV 로딩",     "study",    90,  "DataFrame 기본 구조 이해 및 CSV 로딩"],
  [3, "2026-04-14", "Tuesday",   "화요일", "데이터 전처리 (결측치, map/apply)",     "study",    90,  "결측치 처리, map/apply 함수 활용"],
  [3, "2026-04-15", "Wednesday", "수요일", "[실습] Faker로 100만 건 금융 데이터 생성", "practice", 120, "가상 금융 결제 데이터 100만 건 생성"],
  [3, "2026-04-16", "Thursday",  "목요일", "Docker PostgreSQL에 대량 데이터 적재",  "practice", 120, "to_sql 활용 대량 적재 실습"],
  [3, "2026-04-17", "Friday",    "금요일", "이상 결제 패턴 탐색 분석",              "practice", 120, "Pandas로 이상 결제 패턴 분석"],
  [3, "2026-04-18", "Saturday",  "토요일", "[블로그 포스팅 3] 100만 건 ETL 파이프라인 구축", "practice", 120, "금융 데이터 ETL 파이프라인 포스팅"],
  [3, "2026-04-19", "Sunday",    "일요일", "3주차 복습 및 Pandas/ETL 회고",         "review",   60,  "주간 피드백 및 자기평가"],

  // ── 4주차: 시스템 아키텍처 ──────────────────────────────────────────────
  [4, "2026-04-20", "Monday",    "월요일", "Docker Compose 학습 (YAML 통합 관리)",  "study",    90,  "DB와 Python 앱을 하나의 YAML로 관리"],
  [4, "2026-04-21", "Tuesday",   "화요일", "FastAPI 설치 및 Hello World API",       "practice", 90,  "첫 FastAPI 엔드포인트 띄우기"],
  [4, "2026-04-22", "Wednesday", "수요일", "API 엔드포인트 설계 (DB → JSON 반환)",  "practice", 90,  "DB 데이터를 JSON으로 반환하는 API 설계"],
  [4, "2026-04-23", "Thursday",  "목요일", "[실습] 분석 결과를 API로 서빙",         "practice", 120, "내 분석 결과를 웹에서 볼 수 있게 API 서빙"],
  [4, "2026-04-24", "Friday",    "금요일", "1개월 전체 복습 및 블로그 글 수정",     "review",   90,  "블로그 글 4개 가독성 수정"],
  [4, "2026-04-25", "Saturday",  "토요일", "[블로그 포스팅 4] FastAPI 데이터 서버 아키텍처", "practice", 120, "Docker Compose + FastAPI 아키텍처 포스팅"],
  [4, "2026-04-26", "Sunday",    "일요일", "4주 전체 회고 및 2단계 계획 수립",      "review",   90,  "4주 완료 회고 및 다음 단계 준비"],
];

const DAY_ORDER_GLOBAL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function buildWeeklyPlanFromMemory(week: number): NextResponse {
  const weekRows = ROADMAP.filter((r) => Number(r[0]) === week);
  const daysMap = new Map<string, DayPlan>();
  for (const r of weekRows) {
    const dayKey = r[2] as string;
    if (!daysMap.has(dayKey)) {
      daysMap.set(dayKey, { day: r[2] as string, dayKr: r[3] as string, sessions: [], totalMinutes: 0 });
    }
    const session: Session = {
      topic: r[4] as string,
      type: (r[5] ?? "study") as Session["type"],
      duration: Number(r[6]) || 0,
      description: r[7] as string,
    };
    const dp = daysMap.get(dayKey)!;
    dp.sessions.push(session);
    dp.totalMinutes += session.duration;
  }
  const weeklyPlan: WeeklyPlan = {
    weekNumber: week,
    theme: WEEK_THEMES[week - 1] ?? "",
    days: DAY_ORDER_GLOBAL.map((d) => daysMap.get(d)).filter(Boolean) as DayPlan[],
  };
  return NextResponse.json({ weeklyPlan, currentWeek: week, totalWeeks: 4, startDate: START_DATE });
}

// 현재 주차 계산 (1~4, 범위 초과 시 클램프)
function getCurrentWeek(): number {
  const start = new Date(START_DATE).getTime();
  const now   = new Date().getTime();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), 4);
}

// ── POST: Sheets 로드맵 시트에 저장 ────────────────────────────────────────
export async function POST() {
  try {
    if (!SPREADSHEET_ID) {
      return NextResponse.json({ error: "SPREADSHEET_ID 없음" }, { status: 500 });
    }

    const sheets = getSheetsClient();
    await ensureSheets(sheets, SPREADSHEET_ID, ["로드맵"]);

    const headers = ["주차", "날짜", "요일(영)", "요일(한)", "세션제목", "유형", "시간(분)", "설명", "완료"];
    const rows = ROADMAP.map((r) => [...r, "미완료"]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "로드맵!A1",
      valueInputOption: "RAW",
      requestBody: { values: [headers, ...rows] },
    });

    return NextResponse.json({ ok: true, savedRows: rows.length });
  } catch (error) {
    console.error("Save roadmap error:", error);
    return NextResponse.json({ error: "로드맵 저장 실패" }, { status: 500 });
  }
}

// ── GET: 현재 주차 WeeklyPlan 반환 ─────────────────────────────────────────
export async function GET() {
  const currentWeek = getCurrentWeek();
  try {
    if (!SPREADSHEET_ID) {
      return buildWeeklyPlanFromMemory(currentWeek);
    }

    const sheets = getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "로드맵!A1:I100",
    });

    const allRows = (res.data.values ?? []).slice(1); // 헤더 제거

    // Sheets가 비어있으면 메모리 ROADMAP에서 직접 반환
    if (allRows.length === 0) {
      return buildWeeklyPlanFromMemory(currentWeek);
    }
    const weekRows = allRows.filter((r) => Number(r[0]) === currentWeek);

    const DAY_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysMap = new Map<string, DayPlan>();

    for (const r of weekRows) {
      const dayKey = r[2] as string;
      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, {
          day:          r[2] as string,
          dayKr:        r[3] as string,
          sessions:     [],
          totalMinutes: 0,
        });
      }
      const session: Session = {
        topic:       r[4] as string,
        type:        (r[5] ?? "study") as Session["type"],
        duration:    Number(r[6]) || 0,
        description: r[7] as string,
      };
      const dp = daysMap.get(dayKey)!;
      dp.sessions.push(session);
      dp.totalMinutes += session.duration;
    }

    const weeklyPlan: WeeklyPlan = {
      weekNumber: currentWeek,
      theme:      WEEK_THEMES[currentWeek - 1] ?? "",
      days:       DAY_ORDER.map((d) => daysMap.get(d)).filter(Boolean) as DayPlan[],
    };

    return NextResponse.json({ weeklyPlan, currentWeek, totalWeeks: 4, startDate: START_DATE });
  } catch (error) {
    console.error("Load roadmap error:", error);
    return NextResponse.json({ weeklyPlan: null, currentWeek: 0 });
  }
}
