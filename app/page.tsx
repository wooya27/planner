"use client";

import { useState, useEffect } from "react";
import { StudyPlan, PlanRequest, YearlyEvent } from "@/types/plan";
import VisionBoard from "@/components/VisionBoard";
import TodayTasks from "@/components/TodayTasks";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import GoalPanel from "@/components/GoalPanel";
import YearlyPlanner from "@/components/YearlyPlanner";
import ExamSearch from "@/components/ExamSearch";

export default function Home() {
  const [plan, setPlan]                   = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [isSyncing, setIsSyncing]         = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [syncStatus, setSyncStatus]       = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [examEvents, setExamEvents]       = useState<YearlyEvent[]>([]);

  // ── 앱 시작 시 Google Sheets에서 플랜 불러오기 ──────────────────────────
  useEffect(() => {
    async function loadFromSheets() {
      try {
        const res = await fetch("/api/load-plan");
        if (!res.ok) return;
        const data = await res.json();

        if (data.plan) {
          setPlan(data.plan);
        }
        // visionText는 Sheets에 저장된 값이 있으면 localStorage를 업데이트
        if (data.visionText && typeof window !== "undefined") {
          const local = localStorage.getItem("visionText");
          if (!local) {
            localStorage.setItem("visionText", data.visionText);
          }
        }
      } catch {
        // Sheets 미설정 시 조용히 무시 (localStorage 폴백)
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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1600px] mx-auto p-4 space-y-4">

        {/* Error toast */}
        {error && (
          <div className="bg-red-900/90 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
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

        {/* TOP: Vision Board */}
        <VisionBoard
          goalInfo={plan?.goalInfo}
          studyTips={plan?.studyTips}
          onVisionTextChange={(text) => {
            // visionText 변경 시 Sheets에도 동기화
            if (plan) {
              fetch("/api/save-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, visionText: text }),
              }).catch(() => {});
            }
          }}
        />

        {/* MIDDLE: Today + Weekly + Input/Goal Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px] gap-4 items-stretch" style={{ minHeight: "420px" }}>

          {/* Left: Today Tasks + Exam Search */}
          <div className="flex flex-col gap-3 h-full">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col flex-1">
              {plan ? (
                <TodayTasks tasks={plan.todayTasks} />
              ) : (
                <div className="flex flex-col">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">오늘 할 일</h2>
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-700 text-sm text-center">플랜 생성 후<br />오늘 할 일이 표시됩니다</p>
                  </div>
                </div>
              )}
            </div>
            <ExamSearch onEventsChange={setExamEvents} />
          </div>

          {/* Center: Weekly Planner */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-full flex flex-col">
            {plan ? (
              <WeeklyPlanner weeklyPlan={plan.weeklyPlan} />
            ) : (
              <div className="flex flex-col h-full">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">위클리 플래너</h2>
                {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin" />
                    <div className="text-center">
                      <p className="text-white text-sm font-semibold">AI가 플랜 작성 중...</p>
                      <p className="text-gray-600 text-xs mt-1">에빙하우스 복습 주기 적용 중</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-700 text-sm text-center">플랜 생성 후<br />위클리 플래너가 표시됩니다</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Input + Goal Panel */}
          <GoalPanel
            goalInfo={plan?.goalInfo ?? null}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        </div>

        {/* BOTTOM: Yearly Planner */}
        {plan ? (
          <YearlyPlanner events={[...plan.yearlyEvents, ...examEvents]} />
        ) : examEvents.length > 0 ? (
          <YearlyPlanner events={examEvents} />
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4" style={{ minHeight: 280 }}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">년간 플래너</h2>
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-700 text-sm">위 시험 검색으로 일정을 추가하거나, 플랜을 생성하세요</p>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-700 pb-2">
          복습 주기: 1일 → 3일 → 7일 → 14일 → 30일 (에빙하우스 망각곡선)
        </div>
      </div>
    </div>
  );
}
