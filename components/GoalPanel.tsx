"use client";

import { GoalInfo } from "@/types/plan";

interface GoalPanelProps {
  goalInfo: GoalInfo;
  onReset: () => void;
}

export default function GoalPanel({ goalInfo, onReset }: GoalPanelProps) {
  const completedHours = Math.round(goalInfo.totalHours * (goalInfo.progressPercent / 100));
  const remainingHours = goalInfo.totalHours - completedHours;

  const endDate = new Date(goalInfo.estimatedEndDate);
  const endDateStr = `${endDate.getFullYear()}년 ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;

  // Ebbinghaus review intervals visualization
  const reviewIntervals = [
    { day: 1, label: "1일", retention: 58, color: "bg-red-500" },
    { day: 3, label: "3일", retention: 72, color: "bg-orange-500" },
    { day: 7, label: "7일", retention: 81, color: "bg-yellow-500" },
    { day: 14, label: "14일", retention: 88, color: "bg-green-400" },
    { day: 30, label: "30일", retention: 94, color: "bg-blue-400" },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-full flex flex-col gap-4">
      {/* Goal Info */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          목표 현황
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">총 학습량</span>
            <span className="text-sm font-bold text-white">{goalInfo.totalHours}시간</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">하루 목표</span>
            <span className="text-sm font-bold text-blue-400">{goalInfo.dailyHours}시간</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">완료</span>
            <span className="text-sm font-bold text-green-400">{completedHours}시간</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">남은 시간</span>
            <span className="text-sm font-bold text-amber-400">{remainingHours}시간</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">목표일</span>
            <span className="text-sm font-bold text-purple-400 text-right">{endDateStr}</span>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="mt-4 flex items-center justify-center">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="#1f2937"
                strokeWidth="8"
              />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - goalInfo.progressPercent / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{goalInfo.progressPercent}%</span>
              <span className="text-xs text-gray-500">완료</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Guide */}
      <div className="border-t border-gray-800 pt-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          🧠 복습 주기 (망각곡선)
        </h3>
        <div className="space-y-2">
          {reviewIntervals.map((interval) => (
            <div key={interval.day} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">{interval.label}</span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${interval.color} rounded-full transition-all duration-700`}
                  style={{ width: `${interval.retention}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{interval.retention}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">복습 후 기억 보존율</p>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="mt-auto w-full py-2 rounded-lg border border-gray-700 text-xs text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-colors"
      >
        ↺ 새 플랜 만들기
      </button>
    </div>
  );
}
