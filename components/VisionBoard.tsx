"use client";

import Link from "next/link";
import { GoalInfo } from "@/types/plan";

interface VisionBoardProps {
  goalInfo: GoalInfo;
  studyTips: string[];
}

const difficultyConfig = {
  초급: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", emoji: "🌱" },
  중급: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", emoji: "🔥" },
  고급: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", emoji: "⚡" },
};

export default function VisionBoard({ goalInfo, studyTips }: VisionBoardProps) {
  const config = difficultyConfig[goalInfo.difficulty];
  const weeksLeft = goalInfo.estimatedWeeks;
  const daysLeft = weeksLeft * 7;

  const endDate = new Date(goalInfo.estimatedEndDate);
  const endDateStr = `${endDate.getFullYear()}년 ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;

  // Random motivational quote for ADHD focus
  const quotes = [
    "지금 이 순간이 기회다 💪",
    "작은 한 걸음이 큰 변화를 만든다 🚀",
    "집중! 지금 해야 할 일을 하자 ⚡",
    "포기하면 그때가 게임 오버 🎯",
    "오늘의 노력이 내일의 나를 만든다 ✨",
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="relative bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative p-5">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Main Vision */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">🎯 나의 비전</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight mb-2">
              {goalInfo.title}
            </h1>
            <p className="text-blue-400 font-semibold text-sm mb-3">{quote}</p>
            <Link
              href="/job"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 hover:border-indigo-400/50 transition-all"
            >
              🚀 취업준비 바로가기
            </Link>

            {/* Subjects */}
            <div className="flex flex-wrap gap-2">
              {goalInfo.subjects.map((subject, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25 font-medium"
                >
                  {subject}
                </span>
              ))}
              <span className={`text-xs px-2.5 py-1 rounded-full ${config.bg} ${config.color} border ${config.border} font-medium`}>
                {config.emoji} {goalInfo.difficulty}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
            {/* D-Day */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center min-w-[90px]">
              <div className="text-2xl font-black text-white">D-{daysLeft}</div>
              <div className="text-xs text-gray-400 mt-0.5">목표까지</div>
            </div>

            {/* Total Hours */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center min-w-[90px]">
              <div className="text-2xl font-black text-amber-400">{goalInfo.totalHours}h</div>
              <div className="text-xs text-gray-400 mt-0.5">총 학습량</div>
            </div>

            {/* Daily Hours */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center min-w-[90px]">
              <div className="text-2xl font-black text-green-400">{goalInfo.dailyHours}h</div>
              <div className="text-xs text-gray-400 mt-0.5">하루 목표</div>
            </div>

            {/* Weeks */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center min-w-[90px]">
              <div className="text-2xl font-black text-purple-400">{weeksLeft}주</div>
              <div className="text-xs text-gray-400 mt-0.5">예상 기간</div>
            </div>
          </div>
        </div>

        {/* Progress bar + End date */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>진행률 {goalInfo.progressPercent}%</span>
            <span>🏁 목표 완성일: {endDateStr}</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.max(goalInfo.progressPercent, 2)}%` }}
            />
          </div>
        </div>

        {/* Study Tips */}
        {studyTips && studyTips.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {studyTips.slice(0, 3).map((tip, i) => (
              <div key={i} className="flex-shrink-0 bg-gray-800/40 border border-gray-700/50 rounded-lg px-3 py-1.5">
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  <span className="text-yellow-400 mr-1">💡</span>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
