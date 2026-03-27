"use client";

import { WeeklyPlan } from "@/types/plan";

interface WeeklyPlannerProps {
  weeklyPlan: WeeklyPlan;
}

const sessionTypeConfig = {
  study: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-300",
    dot: "bg-blue-500",
    label: "학습",
  },
  review: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/30",
    text: "text-amber-300",
    dot: "bg-amber-500",
    label: "복습",
  },
  practice: {
    bg: "bg-green-500/20",
    border: "border-green-500/30",
    text: "text-green-300",
    dot: "bg-green-500",
    label: "실습",
  },
  rest: {
    bg: "bg-gray-700/30",
    border: "border-gray-700",
    text: "text-gray-500",
    dot: "bg-gray-600",
    label: "휴식",
  },
};

export default function WeeklyPlanner({ weeklyPlan }: WeeklyPlannerProps) {
  const today = new Date();
  const todayDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today.getDay()];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            위클리 플래너
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{weeklyPlan.weekNumber}주차 · {weeklyPlan.theme}</p>
        </div>
        <div className="flex gap-3 text-xs">
          {Object.entries(sessionTypeConfig).filter(([k]) => k !== "rest").map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className="text-gray-500">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Days Grid */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {weeklyPlan.days.map((day) => {
          const isToday = day.day === todayDay;
          const hours = Math.floor(day.totalMinutes / 60);
          const mins = day.totalMinutes % 60;

          return (
            <div
              key={day.day}
              className={`rounded-lg border transition-all ${
                isToday
                  ? "border-blue-500/50 bg-blue-500/5"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className="flex items-start gap-3 p-3">
                {/* Day label */}
                <div className={`flex-shrink-0 w-12 text-center ${isToday ? "text-blue-400" : "text-gray-500"}`}>
                  <div className={`text-xs font-bold ${isToday ? "text-blue-400" : "text-gray-400"}`}>
                    {day.dayKr.slice(0, 1)}요
                  </div>
                  {isToday && (
                    <div className="text-xs text-blue-400 font-semibold">오늘</div>
                  )}
                  <div className="text-xs text-gray-600 mt-0.5">
                    {hours > 0 ? `${hours}h` : ""}{mins > 0 ? `${mins}m` : ""}
                  </div>
                </div>

                {/* Sessions */}
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {day.sessions.map((session, si) => {
                    const cfg = sessionTypeConfig[session.type] || sessionTypeConfig.study;
                    return (
                      <div
                        key={si}
                        className={`relative group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-all hover:scale-105 cursor-default ${cfg.bg} ${cfg.border}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className={`font-medium ${cfg.text}`}>{session.topic}</span>
                        <span className="text-gray-600">
                          {session.duration >= 60
                            ? `${Math.floor(session.duration / 60)}h${session.duration % 60 > 0 ? `${session.duration % 60}m` : ""}`
                            : `${session.duration}m`}
                        </span>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-48 bg-gray-800 border border-gray-700 rounded-lg p-2.5 shadow-xl">
                          <p className="text-gray-300 text-xs leading-relaxed">{session.description}</p>
                          <div className={`mt-1 text-xs ${cfg.text}`}>{cfg.label}</div>
                        </div>
                      </div>
                    );
                  })}
                  {day.sessions.length === 0 && (
                    <span className="text-xs text-gray-700 italic">휴식일</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
