"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { YearlyEvent, StudyPlan } from "@/types/plan";
import YearlyPlanner from "@/components/YearlyPlanner";
import ExamSearch from "@/components/ExamSearch";

export default function YearlyPage() {
  const [examEvents, setExamEvents]   = useState<YearlyEvent[]>([]);
  const [planEvents, setPlanEvents]   = useState<YearlyEvent[]>([]);
  const [isLoading, setIsLoading]     = useState(true);

  // Sheets에서 플랜의 yearlyEvents 불러오기
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/load-plan");
        const data = await res.json();
        if (data.plans?.length) {
          setPlanEvents(data.plans.flatMap((p: StudyPlan) => p.yearlyEvents));
        }
      } catch { /* ignore */ } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const allEvents = [...planEvents, ...examEvents];

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-[1600px] mx-auto p-4 space-y-4">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">년간 플래너</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일&nbsp;
              {["일","월","화","수","목","금","토"][new Date().getDay()]}요일
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            ← 메인으로
          </Link>
        </div>

        {/* 시험 일정 검색 */}
        <ExamSearch onEventsChange={setExamEvents} />

        {/* 년간 플래너 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <YearlyPlanner events={allEvents} />
        )}

      </div>
    </div>
  );
}
