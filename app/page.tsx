"use client";

import { useState } from "react";
import { StudyPlan, PlanRequest } from "@/types/plan";
import InputModal from "@/components/InputModal";
import VisionBoard from "@/components/VisionBoard";
import TodayTasks from "@/components/TodayTasks";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import GoalPanel from "@/components/GoalPanel";
import YearlyPlanner from "@/components/YearlyPlanner";

export default function Home() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (request: PlanRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "서버 오류");
      }

      const data: StudyPlan = await response.json();
      setPlan(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setError(null);
  };

  // Show input screen if no plan
  if (!plan && !isLoading) {
    return (
      <div>
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm shadow-xl">
            ⚠️ {error}
          </div>
        )}
        <InputModal onSubmit={handleSubmit} isLoading={false} />
      </div>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">플랜 생성 중...</h2>
          <p className="text-gray-500 text-sm">AI가 맞춤 학습 계획을 설계하고 있습니다</p>
          <div className="mt-4 flex flex-col gap-1.5 text-xs text-gray-600">
            <p>📚 에빙하우스 망각곡선 적용 중...</p>
            <p>🧠 ADHD 최적화 일정 배분 중...</p>
            <p>📅 년간 마일스톤 계획 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1600px] mx-auto p-4 space-y-4">

        {/* Error toast */}
        {error && (
          <div className="bg-red-900/90 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* TOP: Vision Board */}
        <VisionBoard
          goalInfo={plan.goalInfo}
          studyTips={plan.studyTips}
        />

        {/* MIDDLE: Today Tasks + Weekly Planner + Goal Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px] gap-4" style={{ minHeight: "520px" }}>
          {/* Left: Today Tasks */}
          <TodayTasks tasks={plan.todayTasks} />

          {/* Center: Weekly Planner */}
          <WeeklyPlanner weeklyPlan={plan.weeklyPlan} />

          {/* Right: Goal Info + Spaced Repetition */}
          <GoalPanel goalInfo={plan.goalInfo} onReset={handleReset} />
        </div>

        {/* BOTTOM: Yearly Planner */}
        <YearlyPlanner events={plan.yearlyEvents} />

        {/* Footer */}
        <div className="text-center text-xs text-gray-700 pb-4">
          복습 주기: 1일 → 3일 → 7일 → 14일 → 30일 (에빙하우스 망각곡선)
        </div>
      </div>
    </div>
  );
}
