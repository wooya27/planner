"use client";

import { WeeklyPlan } from "@/types/plan";

interface WeeklyPlannerProps {
  weeklyPlan: WeeklyPlan;
}

const sessionTypeConfig = {
  study: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-300", dot: "bg-blue-500", label: "학습" },
  review: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-300", dot: "bg-amber-500", label: "복습" },
  practice: { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-300", dot: "bg-green-500", label: "실습" },
  rest: { bg: "bg-gray-700/20", border: "border-gray-700", text: "text-gray-600", dot: "bg-gray-700", label: "휴식" },
};

// 월요일 기준 정렬
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_KR = ["월", "화", "수", "목", "금", "토", "일"];

export default function WeeklyPlanner({ weeklyPlan }: WeeklyPlannerProps) {
  const today = new Date();
  const todayDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today.getDay()];

  // 월요일부터 정렬
  const sortedDays = DAY_ORDER.map((dayName, i) => {
    const found = weeklyPlan.days.find((d) => d.day === dayName);
    return found ?? { day: dayName, dayKr: DAY_KR[i] + "요일", sessions: [], totalMinutes: 0 };
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">위클리 플래너</h2>
          <p className="text-xs text-gray-600 mt-0.5">{weeklyPlan.weekNumber}주차 · {weeklyPlan.theme}</p>
        </div>
        <div className="flex gap-2 text-xs">
          {(["study","review","practice"] as const).map((type) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${sessionTypeConfig[type].dot}`} />
              <span className="text-gray-600">{sessionTypeConfig[type].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-column grid */}
      <div className="flex-1 grid grid-cols-7 gap-2 overflow-hidden">
        {sortedDays.map((day, i) => {
          const isToday = day.day === todayDay;
          const isWeekend = i >= 5;
          const hours = Math.floor(day.totalMinutes / 60);
          const mins = day.totalMinutes % 60;

          return (
            <div
              key={day.day}
              className={`flex flex-col rounded-lg border overflow-hidden ${
                isToday
                  ? "border-blue-500/50 bg-blue-500/5"
                  : isWeekend
                  ? "border-gray-800/60 bg-gray-900/30"
                  : "border-gray-800 bg-gray-900/50"
              }`}
            >
              {/* Day header */}
              <div className={`px-2 py-1.5 border-b flex flex-col items-center ${
                isToday ? "border-blue-500/20 bg-blue-500/10" : "border-gray-800"
              }`}>
                <span className={`text-sm font-black ${
                  isToday ? "text-blue-400" : isWeekend ? "text-gray-500" : "text-gray-300"
                }`}>
                  {DAY_KR[i]}
                </span>
                {isToday && (
                  <span className="text-xs text-blue-400 font-bold">오늘</span>
                )}
                {day.totalMinutes > 0 && (
                  <span className="text-xs text-gray-600 mt-0.5">
                    {hours > 0 ? `${hours}h` : ""}{mins > 0 ? `${mins}m` : ""}
                  </span>
                )}
              </div>

              {/* Sessions */}
              <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
                {day.sessions.length === 0 ? (
                  <div className="flex items-center justify-center h-full py-4">
                    <span className="text-xs text-gray-700">-</span>
                  </div>
                ) : (
                  day.sessions.map((session, si) => {
                    const cfg = sessionTypeConfig[session.type] ?? sessionTypeConfig.study;
                    const dur = session.duration >= 60
                      ? `${Math.floor(session.duration / 60)}h${session.duration % 60 > 0 ? `${session.duration % 60}m` : ""}`
                      : `${session.duration}m`;

                    return (
                      <div
                        key={si}
                        className={`group relative px-1.5 py-1 rounded border text-xs cursor-default transition-all hover:scale-105 ${cfg.bg} ${cfg.border}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className={`font-semibold truncate text-xs ${cfg.text}`}>
                            {session.topic}
                          </span>
                        </div>
                        <span className="text-gray-600 text-xs">{dur}</span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-20 w-40 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl pointer-events-none">
                          <p className="text-gray-300 text-xs leading-relaxed">{session.description}</p>
                          <span className={`text-xs ${cfg.text}`}>{cfg.label} · {dur}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
