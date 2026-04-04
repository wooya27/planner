"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { StudyPlan, PlanRequest, WeeklyPlan, DayPlan } from "@/types/plan";
import { EXAM_DB } from "@/data/exams";
import VisionBoard from "@/components/VisionBoard";
import TodayTasks from "@/components/TodayTasks";
import WeeklyPlanner, { ExamRegEvent } from "@/components/WeeklyPlanner";
import GoalPanel from "@/components/GoalPanel";

const DAY_ORDER = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAY_KR_MAP: Record<string,string> = {
  Sunday:"일요일", Monday:"월요일", Tuesday:"화요일", Wednesday:"수요일",
  Thursday:"목요일", Friday:"금요일", Saturday:"토요일",
};

function mergeWeeklyPlans(a: WeeklyPlan, b: WeeklyPlan): WeeklyPlan {
  const merged = new Map<string, DayPlan>();
  for (const dayName of DAY_ORDER) {
    const da = a.days.find((d) => d.day === dayName);
    const db = b.days.find((d) => d.day === dayName);
    const sessions = [...(da?.sessions ?? []), ...(db?.sessions ?? [])];
    if (sessions.length > 0) {
      merged.set(dayName, {
        day: dayName,
        dayKr: da?.dayKr ?? db?.dayKr ?? DAY_KR_MAP[dayName],
        sessions,
        totalMinutes: sessions.reduce((s, sess) => s + sess.duration, 0),
      });
    }
  }
  return {
    weekNumber: a.weekNumber,
    theme: a.theme,
    days: DAY_ORDER.map((d) => merged.get(d)).filter(Boolean) as DayPlan[],
  };
}

export default function Home() {
  const [plan, setPlan]                   = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [isSyncing, setIsSyncing]         = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [syncStatus, setSyncStatus]       = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [now, setNow] = useState(new Date());
  const [roadmapWeek, setRoadmapWeek]       = useState<WeeklyPlan | null>(null);
  const [roadmapWeekNum, setRoadmapWeekNum] = useState(0);
  const [roadmapIniting, setRoadmapIniting] = useState(false);
  const [registrationTasks, setRegistrationTasks] = useState<import("@/types/plan").Task[]>([]);
  const [savedExamItems, setSavedExamItems] = useState<{ examId: string; round: string }[]>([]);

  // 저장된 시험 기준으로 25일 전부터 자동으로 이번 주 시험 준비 세션 생성
  const examWeeklyPlan = useMemo((): WeeklyPlan | null => {
    if (savedExamItems.length === 0) return null;
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const dayNames = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const dayKrs  = ["월요일","화요일","수요일","목요일","금요일","토요일","일요일"];
    const weekDays = dayNames.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { date: d.toLocaleDateString("en-CA"), name, kr: dayKrs[i] };
    });
    const dayPlans = new Map<string, import("@/types/plan").DayPlan>();
    for (const { examId, round } of savedExamItems) {
      const exam = EXAM_DB.find((e) => e.id === examId);
      const schedule = exam?.schedules.find((s) => s.round === round);
      if (!exam || !schedule || schedule.examDate < todayStr) continue;
      const examDate = new Date(schedule.examDate);
      const studyStart = new Date(examDate);
      studyStart.setDate(studyStart.getDate() - 24);
      const studyStartStr = studyStart.toLocaleDateString("en-CA");
      for (const { date, name, kr } of weekDays) {
        if (date < studyStartStr || date > schedule.examDate) continue;
        const daysLeft = Math.ceil((examDate.getTime() - new Date(date).getTime()) / 86400000);
        const daysSinceStart = Math.ceil((new Date(date).getTime() - studyStart.getTime()) / 86400000);
        const type: "study" | "practice" | "review" =
          daysSinceStart <= 8 ? "study" : daysSinceStart <= 18 ? "practice" : "review";
        const session = {
          topic: `[${exam.name}] D-${daysLeft} ${type === "study" ? "핵심 이론" : type === "practice" ? "문제 풀이" : "최종 복습"}`,
          type,
          duration: 45,
          description: `${exam.name} ${schedule.round} 시험까지 ${daysLeft}일`,
        };
        if (!dayPlans.has(name)) {
          dayPlans.set(name, { day: name, dayKr: kr, sessions: [], totalMinutes: 0 });
        }
        const dp = dayPlans.get(name)!;
        dp.sessions.push(session);
        dp.totalMinutes += 45;
      }
    }
    if (dayPlans.size === 0) return null;
    return {
      weekNumber: 0,
      theme: "시험 준비",
      days: DAY_ORDER.map((d) => dayPlans.get(d)).filter(Boolean) as import("@/types/plan").DayPlan[],
    };
  }, [savedExamItems]);

  const displayWeeklyPlan = useMemo(() => {
    const base = (() => {
      if (roadmapWeek && plan?.weeklyPlan) return mergeWeeklyPlans(roadmapWeek, plan.weeklyPlan);
      return roadmapWeek ?? plan?.weeklyPlan ?? null;
    })();
    if (examWeeklyPlan && base) return mergeWeeklyPlans(base, examWeeklyPlan);
    return examWeeklyPlan ?? base;
  }, [roadmapWeek, plan, examWeeklyPlan]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDayName = DAY_ORDER[now.getDay()];

  // 이번 주 시험 접수 시작일 계산
  const weekExamRegistrations = useMemo((): ExamRegEvent[] => {
    if (savedExamItems.length === 0) return [];
    const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }));
    const dow = today.getDay(); // 0=일
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    const weekDateMap: Record<string, string> = {};
    const dayNames = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDateMap[d.toLocaleDateString("en-CA")] = dayNames[i];
    }
    const result: ExamRegEvent[] = [];
    for (const { examId, round } of savedExamItems) {
      const exam = EXAM_DB.find((e) => e.id === examId);
      const schedule = exam?.schedules.find((s) => s.round === round);
      if (!schedule || !exam) continue;
      const dayName = weekDateMap[schedule.registrationStart];
      if (dayName) {
        result.push({ dayName, title: exam.name, endDate: schedule.registrationEnd });
      }
    }
    return result;
  }, [savedExamItems]);

  const todayTasks = useMemo(() => {
    const roadmapTasks = roadmapWeek
      ? (roadmapWeek.days.find((d) => d.day === todayDayName)?.sessions ?? [])
          .filter((s) => s.type !== "rest")
          .map((s, i) => ({
            id: `roadmap-${i}`,
            title: s.topic,
            duration: s.duration,
            completed: false,
            type: s.type as "study" | "review" | "practice",
            subject: "로드맵",
          }))
      : [];
    return [...registrationTasks, ...roadmapTasks, ...(plan?.todayTasks ?? [])];
  }, [roadmapWeek, plan, todayDayName, registrationTasks]);

  // ── 앱 시작 시 Google Sheets에서 플랜 불러오기 ──────────────────────────
  useEffect(() => {
    async function loadFromSheets() {
      try {
        const [planRes, roadmapRes] = await Promise.allSettled([
          fetch("/api/load-plan").then((r) => r.json()),
          fetch("/api/roadmap").then((r) => r.json()),
        ]);

        if (planRes.status === "fulfilled") {
          const data = planRes.value;
          if (data.plan) setPlan(data.plan);
          if (data.visionText && typeof window !== "undefined") {
            const local = localStorage.getItem("visionText");
            if (!local) localStorage.setItem("visionText", data.visionText);
          }
        }

        if (roadmapRes.status === "fulfilled" && roadmapRes.value.weeklyPlan) {
          setRoadmapWeek(roadmapRes.value.weeklyPlan);
          setRoadmapWeekNum(roadmapRes.value.currentWeek);
        }

        // 저장된 시험 접수 기간 체크
        try {
          const examRes = await fetch("/api/exam-search").then((r) => r.json());
          const items: { examId: string; round: string }[] = examRes.items ?? [];
          setSavedExamItems(items);
          const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
          const regTasks: import("@/types/plan").Task[] = [];
          for (const { examId, round } of items) {
            const exam = EXAM_DB.find((e) => e.id === examId);
            const schedule = exam?.schedules.find((s) => s.round === round);
            if (!schedule) continue;
            if (todayStr >= schedule.registrationStart && todayStr <= schedule.registrationEnd) {
              regTasks.push({
                id: `reg-${examId}-${round}`,
                title: `📋 ${exam!.name} ${round.replace(/\d{4}년 /, "")} 원서접수 (~${schedule.registrationEnd})`,
                duration: 30,
                completed: false,
                type: "study",
                subject: "접수",
              });
            }
          }
          if (regTasks.length > 0) setRegistrationTasks(regTasks);
        } catch { /* ignore */ }
      } catch {
        // Sheets 미설정 시 조용히 무시
      } finally {
        setIsInitialLoad(false);
      }
    }
    loadFromSheets();
  }, []);

  // ── Google Sheets에 저장 ─────────────────────────────────────────────────
  async function savePlanToSheets(newPlan: StudyPlan) {
    setIsSyncing(true);
    setSyncStatus("saving");
    try {
      const visionText = typeof window !== "undefined"
        ? localStorage.getItem("visionText") ?? ""
        : "";

      const res = await fetch("/api/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan, visionText }),
      });
      setSyncStatus(res.ok ? "saved" : "error");
    } catch {
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  }

  const handleInitRoadmap = async () => {
    setRoadmapIniting(true);
    try {
      await fetch("/api/roadmap", { method: "POST" });
      const res = await fetch("/api/roadmap");
      const data = await res.json();
      if (data.weeklyPlan) {
        setRoadmapWeek(data.weeklyPlan);
        setRoadmapWeekNum(data.currentWeek);
      }
    } catch { /* ignore */ } finally {
      setRoadmapIniting(false);
    }
  };

const handleGenerate = async (request: PlanRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "서버 오류");
      }
      const data: StudyPlan = await res.json();
      setPlan(data);
      // 생성 후 자동 저장
      await savePlanToSheets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  // ── 초기 로딩 중 스피너 ──────────────────────────────────────────────────
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">플랜 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden text-white">
      <div className="max-w-[1600px] mx-auto px-4 pt-3 pb-4 h-full flex flex-col gap-3">

        {/* Error toast */}
        {error && (
          <div className="bg-red-900/90 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm flex items-center justify-between flex-shrink-0">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-4">✕</button>
          </div>
        )}

        {/* Sync status badge */}
        {syncStatus !== "idle" && (
          <div className={`fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all ${
            syncStatus === "saving" ? "bg-blue-600/90 text-white" :
            syncStatus === "saved"  ? "bg-green-600/90 text-white" :
            "bg-red-600/90 text-white"
          }`}>
            {syncStatus === "saving" && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {syncStatus === "saving" ? "Google Sheets 저장 중..." :
             syncStatus === "saved"  ? "✓ 저장 완료" :
             "⚠ 저장 실패 (로컬에는 보관됨)"}
          </div>
        )}

        {/* 메인: [비전+통계+오늘할일] [위클리플래너] [플랜입력] */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-3 flex-1 min-h-0">

          {/* 좌측: 날짜 → 나의비전 → 통계 → 오늘할일 */}
          <div className="flex flex-col gap-2 min-h-0">
            {/* 날짜 & 시간 */}
            <div className="flex-shrink-0">
              <p className="text-2xl font-medium text-white leading-tight">
                {now.getFullYear()}년 {now.getMonth() + 1}월 {now.getDate()}일&nbsp;
                <span className="text-blue-400">{["일","월","화","수","목","금","토"][now.getDay()]}요일</span>
              </p>
              <p className="text-5xl font-light text-gray-300 tabular-nums tracking-widest mt-1">
                {String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}
                <span className="text-3xl text-gray-500">:{String(now.getSeconds()).padStart(2,"0")}</span>
              </p>
            </div>
            <VisionBoard
              goalInfo={plan?.goalInfo}
              studyTips={plan?.studyTips}
              onVisionTextChange={(text) => {
                fetch("/api/save-plan", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ plan: plan ?? null, visionText: text }),
                }).catch(() => {});
              }}
            />

            {/* 목표 통계 (goalInfo 있을 때) */}
            {plan?.goalInfo && (() => {
              const g = plan.goalInfo!;
              const weeksLeft = g.estimatedWeeks ?? 0;
              const daysLeft = weeksLeft * 7;
              const endDate = g.estimatedEndDate ? new Date(g.estimatedEndDate) : null;
              const endDateStr = endDate
                ? `${endDate.getMonth()+1}/${endDate.getDate()}`
                : "-";
              return (
                <div className="flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl p-2">
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[
                      { value: `D-${daysLeft}`, label: "목표까지", color: "text-white" },
                      { value: `${g.totalHours}h`, label: "총학습량", color: "text-amber-400" },
                      { value: `${g.dailyHours}h`, label: "하루목표", color: "text-green-400" },
                      { value: `${weeksLeft}주`, label: "예상기간", color: "text-purple-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-800/60 border border-gray-700 rounded-lg py-1.5 text-center">
                        <div className={`text-sm font-black ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-600">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.max(g.progressPercent, 2)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{g.progressPercent}% · 🏁{endDateStr}</span>
                  </div>
                </div>
              );
            })()}

            {/* 오늘 할 일 */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {todayTasks.length > 0 ? (
                <TodayTasks tasks={todayTasks} />
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-700 text-xs text-center">플랜 생성 후<br />오늘 할 일이 표시됩니다</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 중앙: 위클리 플래너 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                {roadmapWeek && (
                  <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    📅 로드맵 {roadmapWeekNum}주차
                  </span>
                )}
              </div>
              <button
                onClick={handleInitRoadmap}
                disabled={roadmapIniting}
                className="text-xs font-semibold bg-amber-800 border border-amber-700 text-amber-50 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {roadmapIniting ? "저장 중..." : roadmapWeek ? "🔄 로드맵 갱신" : "📅 4주 로드맵 저장"}
              </button>
            </div>

            {displayWeeklyPlan ? (
              <WeeklyPlanner weeklyPlan={displayWeeklyPlan} examRegistrations={weekExamRegistrations} />
            ) : isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-white text-sm font-semibold">AI가 플랜 작성 중...</p>
                  <p className="text-gray-600 text-xs mt-1">에빙하우스 복습 주기 적용 중</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-700 text-sm text-center">위 버튼으로 로드맵을 저장하거나<br />플랜을 생성하세요</p>
              </div>
            )}
          </div>

          {/* 우측: 네비 버튼 + 플랜 입력 */}
          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/yearly" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-2 py-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition-all">
                📅 년간플래너
              </Link>
              <Link href="/feedback" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-2 py-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition-all">
                📝 피드백
              </Link>
              <Link href="/job" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-2 py-4 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 transition-all">
                🚀 취업준비
              </Link>
            </div>
            <GoalPanel
              goalInfo={plan?.goalInfo ?? null}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
