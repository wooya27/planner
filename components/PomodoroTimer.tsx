"use client";

import { useState, useEffect, useRef } from "react";

const MODES = {
  focus: { label: "집중", minutes: 25, color: "text-blue-400", bar: "bg-blue-500", border: "border-blue-500/30" },
  break: { label: "휴식", minutes: 5,  color: "text-green-400", bar: "bg-green-500", border: "border-green-500/30" },
};

export default function PomodoroTimer() {
  const [mode, setMode]         = useState<"focus" | "break">("focus");
  const [seconds, setSeconds]   = useState(25 * 60);
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cfg       = MODES[mode];
  const totalSecs = cfg.minutes * 60;
  const mins      = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs      = String(seconds % 60).padStart(2, "0");
  const progress  = (seconds / totalSecs) * 100;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "focus") {
              setSessions((s) => s + 1);
              setMode("break");
              return 5 * 60;
            } else {
              setMode("focus");
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const handleSwitch = (m: "focus" | "break") => {
    setRunning(false);
    setMode(m);
    setSeconds(MODES[m].minutes * 60);
  };

  return (
    <div className="flex flex-col gap-2">

      {/* 모드 탭 */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
        {(["focus", "break"] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleSwitch(m)}
            className={`flex-1 text-xs py-3 rounded-md font-semibold transition-all ${
              mode === m ? `bg-gray-700 ${MODES[m].color}` : "text-gray-600 hover:text-gray-400"
            }`}
          >
            {MODES[m].label} {MODES[m].minutes}분
          </button>
        ))}
      </div>

      {/* 사각형 타이머 박스 */}
      <div className={`relative rounded-xl border ${cfg.border} bg-gray-800/60 overflow-hidden`}>
        {/* 진행 배경 */}
        <div
          className={`absolute inset-0 ${cfg.bar} opacity-10 transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
        {/* 시간 표시 */}
        <div className="relative flex flex-col items-center justify-center py-2.5 gap-0.5">
          <span className={`text-2xl font-black tabular-nums tracking-widest ${cfg.color}`}>
            {mins}:{secs}
          </span>
          <span className="text-xs text-gray-600">{cfg.label} 타이머</span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex-1 text-sm font-bold py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 hover:border-gray-500 hover:bg-gray-700 transition-all"
        >
          {running ? "⏸ 일시정지" : "▶ 시작"}
        </button>
        <button
          onClick={() => { setRunning(false); setSeconds(cfg.minutes * 60); }}
          className="text-sm font-bold px-4 py-3 rounded-lg border border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all"
        >
          ↺
        </button>
      </div>

      {/* 세션 도트 */}
      {sessions > 0 && (
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
          ))}
          {sessions > 8 && <span className="text-xs text-gray-600">+{sessions - 8}</span>}
        </div>
      )}
    </div>
  );
}
