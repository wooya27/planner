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

  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }));
  const month = today.getMonth() + 1;
  const date  = today.getDate();
  const dayKr = ["일", "월", "화", "수", "목", "금", "토"][today.getDay()];
  const year  = today.getFullYear();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col lg:flex-1 lg:min-h-0 lg:h-full">
      {/* 진행 현황 */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-800">
        <p className="text-sm font-bold text-white">오늘 할 일</p>
        <p className="text-xs text-gray-400">
          {completedIds.size}/{tasks.length}개 •{" "}
          {Math.floor(totalMinutes / 60) > 0 ? `${Math.floor(totalMinutes / 60)}h ` : ""}
          {totalMinutes % 60 > 0 ? `${totalMinutes % 60}m` : ""}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-3 flex-shrink-0">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Tasks */}
      <div className="space-y-2 lg:flex-1 lg:overflow-y-auto">
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
                  <p className={`text-xs font-semibold leading-tight ${done ? "line-through text-gray-500" : "text-white"}`}>
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
