"use client";

import { YearlyEvent } from "@/types/plan";

interface YearlyPlannerProps {
  events: YearlyEvent[];
}

const eventTypeConfig = {
  registration: {
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    text: "text-orange-300",
    dot: "bg-orange-500",
    label: "접수",
    emoji: "📋",
  },
  exam: {
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    text: "text-red-300",
    dot: "bg-red-500",
    label: "시험",
    emoji: "📝",
  },
  milestone: {
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    text: "text-blue-300",
    dot: "bg-blue-500",
    label: "목표",
    emoji: "🎯",
  },
  review: {
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    text: "text-purple-300",
    dot: "bg-purple-500",
    label: "복습",
    emoji: "🔄",
  },
};

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export default function YearlyPlanner({ events }: YearlyPlannerProps) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  // Group events by month
  const eventsByMonth: Record<number, YearlyEvent[]> = {};
  events.forEach((event) => {
    if (!eventsByMonth[event.month]) {
      eventsByMonth[event.month] = [];
    }
    eventsByMonth[event.month].push(event);
  });

  // Get all months with events, starting from current
  const activeMonths = Object.keys(eventsByMonth).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4" style={{ minHeight: 280 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            년간 플래너
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{today.getFullYear()}년 학습 로드맵</p>
        </div>
        <div className="flex gap-3">
          {Object.entries(eventTypeConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-xs">{cfg.emoji}</span>
              <span className="text-xs text-gray-500 hidden sm:inline">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-2">
          {MONTHS.map((monthLabel, i) => {
            const month = i + 1;
            const monthEvents = eventsByMonth[month] || [];
            const isPast = month < currentMonth;
            const isCurrent = month === currentMonth;

            return (
              <div
                key={month}
                className={`flex-shrink-0 w-36 rounded-lg border transition-all ${
                  isCurrent
                    ? "border-blue-500/40 bg-blue-500/5"
                    : isPast
                    ? "border-gray-800/50 opacity-50"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                {/* Month header */}
                <div className={`px-3 py-2 border-b flex items-center justify-between ${
                  isCurrent ? "border-blue-500/20" : "border-gray-800"
                }`}>
                  <span className={`text-sm font-bold ${isCurrent ? "text-blue-400" : "text-gray-400"}`}>
                    {monthLabel}
                  </span>
                  {isCurrent && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-medium">
                      NOW
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="p-2 space-y-1.5 min-h-[160px]">
                  {monthEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[120px] gap-1">
                      <div className="w-6 h-px bg-gray-800" />
                      <span className="text-xs text-gray-700">일정 없음</span>
                    </div>
                  ) : (
                    monthEvents.map((event) => {
                      const cfg = eventTypeConfig[event.type];
                      return (
                        <div
                          key={event.id}
                          className={`group relative px-2 py-1.5 rounded border text-xs transition-all hover:scale-105 cursor-default ${cfg.bg} ${cfg.border}`}
                        >
                          <div className="flex items-center gap-1">
                            <span>{cfg.emoji}</span>
                            <span className={`font-medium truncate ${cfg.text}`}>{event.title}</span>
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5">
                            {event.month}월 {event.day}일
                            {event.dDay !== undefined && event.dDay >= 0 && (
                              <span className="ml-1 text-amber-400">D-{event.dDay}</span>
                            )}
                          </div>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 w-48 bg-gray-800 border border-gray-700 rounded-lg p-2.5 shadow-xl">
                            <p className="text-gray-300 text-xs leading-relaxed">{event.description}</p>
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
    </div>
  );
}
