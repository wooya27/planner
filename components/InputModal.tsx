"use client";

import { useState } from "react";
import { PlanRequest } from "@/types/plan";

interface InputModalProps {
  onSubmit: (request: PlanRequest) => void;
  isLoading: boolean;
}

export default function InputModal({ onSubmit, isLoading }: InputModalProps) {
  const [goal, setGoal] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [targetExamDate, setTargetExamDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !totalHours || !dailyHours) return;
    onSubmit({
      goal,
      totalHours: Number(totalHours),
      dailyHours: Number(dailyHours),
      targetExamDate: targetExamDate || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h1 className="text-2xl font-bold text-white">스터디 플래너</h1>
          <p className="text-gray-400 mt-2 text-sm">
            목표를 입력하면 AI가 맞춤 학습 계획을 세워드립니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🎯 학습 목표
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 정보처리기사 자격증 취득, TOEIC 900점, 파이썬 기초 완성"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              required
            />
          </div>

          {/* Total Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ⏱ 총 필요 학습 시간 (시간)
            </label>
            <input
              type="number"
              value={totalHours}
              onChange={(e) => setTotalHours(e.target.value)}
              placeholder="예: 200"
              min="1"
              max="10000"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              required
            />
          </div>

          {/* Daily Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📅 하루 투자 가능 시간 (시간)
            </label>
            <input
              type="number"
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              placeholder="예: 3"
              min="0.5"
              max="24"
              step="0.5"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              required
            />
          </div>

          {/* Target Exam Date (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📝 목표 시험일 <span className="text-gray-500">(선택)</span>
            </label>
            <input
              type="date"
              value={targetExamDate}
              onChange={(e) => setTargetExamDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* Estimated info */}
          {totalHours && dailyHours && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <p className="text-gray-400 text-sm">
                예상 완성 기간:{" "}
                <span className="text-blue-400 font-semibold">
                  약{" "}
                  {Math.ceil(
                    Number(totalHours) / Number(dailyHours)
                  ).toLocaleString()}
                  일 (
                  {Math.ceil(
                    Number(totalHours) / (Number(dailyHours) * 7)
                  )}{" "}
                  주)
                </span>
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !goal || !totalHours || !dailyHours}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI가 플랜을 작성중...
              </>
            ) : (
              <>
                ✨ 스터디 플랜 생성하기
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
