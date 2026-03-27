"use client";

import { useState } from "react";
import { Task } from "@/types/plan";

interface TodayTasksProps {
  tasks: Task[];
}

const typeColors: Record<Task["type"], string> = {
  study: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  practice: "bg-green-500/20 text-green-400 border-green-500/30",
};

const typeLabels: Record<Task["type"], string> = {
  study: "학습",
  review: "복습",
  practice: "실습",
};

export default function TodayTasks({ tasks }: TodayTasksProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);
  const completedMinutes = tasks
    .filter((t) => completedIds.has(t.id))
    .reduce((sum, t) => sum + t.duration, 0);
  const progress =
    totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0;

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 ${["일", "월", "화", "수", "목", "금", "토"][today.getDay()]}요일`;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            오늘 할 일
          </h2>
          <span className="text-xs text-gray-500">{dateStr}</span>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          {completedIds.size}/{tasks.length}개 완료 •{" "}
          {Math.floor(totalMinutes / 60)}시간 {totalMinutes % 60}분
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.map((task) => {
          const done = completedIds.has(task.id);
          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                done
                  ? "bg-gray-800/30 border-gray-800 opacity-50"
                  : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    done
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-600"
                  }`}
                >
                  {done && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${done ? "line-through text-gray-500" : "text-white"}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${typeColors[task.type]}`}>
                      {typeLabels[task.type]}
                    </span>
                    <span className="text-xs text-gray-500">{task.subject}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {task.duration >= 60
                        ? `${Math.floor(task.duration / 60)}h ${task.duration % 60 > 0 ? `${task.duration % 60}m` : ""}`
                        : `${task.duration}m`}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
