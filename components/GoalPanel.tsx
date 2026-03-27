"use client";

import { useState, useRef, useEffect } from "react";
import { GoalInfo, PlanRequest } from "@/types/plan";
import { searchExams, getUpcomingSchedule, Exam } from "@/data/exams";

interface GoalPanelProps {
  goalInfo: GoalInfo | null;
  onGenerate: (request: PlanRequest) => void;
  isLoading: boolean;
}

const DAYS = [
  { key: "Monday",    label: "월", short: "Mon" },
  { key: "Tuesday",   label: "화", short: "Tue" },
  { key: "Wednesday", label: "수", short: "Wed" },
  { key: "Thursday",  label: "목", short: "Thu" },
  { key: "Friday",    label: "금", short: "Fri" },
  { key: "Saturday",  label: "토", short: "Sat" },
];

const reviewIntervals = [
  { label: "1일",  retention: 58, color: "bg-red-500" },
  { label: "3일",  retention: 72, color: "bg-orange-500" },
  { label: "7일",  retention: 81, color: "bg-yellow-500" },
  { label: "14일", retention: 88, color: "bg-green-400" },
  { label: "30일", retention: 94, color: "bg-blue-400" },
];

export default function GoalPanel({ goalInfo, onGenerate, isLoading }: GoalPanelProps) {
  const [goal, setGoal]             = useState(goalInfo?.title ?? "");
  const [dailyHours, setDailyHours] = useState(goalInfo ? String(goalInfo.dailyHours) : "");
  const [targetDate, setTargetDate] = useState("");
  const [studyDays, setStudyDays]   = useState<string[]>(["Monday","Tuesday","Wednesday","Thursday","Friday"]);

  const [suggestions, setSuggestions]         = useState<Exam[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedExam, setSelectedExam]       = useState<Exam | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current   && !inputRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleGoalChange = (v: string) => {
    setGoal(v);
    setSelectedExam(null);
    const r = searchExams(v);
    setSuggestions(r);
    setShowSuggestions(r.length > 0 && v.length > 0);
  };

  const handleSelectExam = (exam: Exam) => {
    setGoal(exam.name);
    setSelectedExam(exam);
    setShowSuggestions(false);
    const s = getUpcomingSchedule(exam);
    if (s) setTargetDate(s.examDate);
  };

  const toggleDay = (key: string) =>
    setStudyDays((prev) => prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !dailyHours || studyDays.length === 0) return;
    onGenerate({ goal, dailyHours: Number(dailyHours), studyDays, targetExamDate: targetDate || undefined });
  };

  const upcomingSchedule = selectedExam ? getUpcomingSchedule(selectedExam) : null;
  const endDateStr = goalInfo
    ? (() => { const d = new Date(goalInfo.estimatedEndDate); return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`; })()
    : null;

  const weeklyHours = studyDays.length * Number(dailyHours || 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-full flex flex-col gap-4 overflow-y-auto">

      {/* ── Form ── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">✏️ 플랜 입력</h2>
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Goal */}
          <div className="relative">
            <label className="text-xs text-gray-500 mb-1 block">목표 / 시험명</label>
            <input ref={inputRef} type="text" value={goal}
              onChange={(e) => handleGoalChange(e.target.value)}
              onFocus={() => goal && suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="정보처리기사, TOEIC..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" />
            {showSuggestions && (
              <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-30 overflow-hidden">
                {suggestions.map((exam) => {
                  const s = getUpcomingSchedule(exam);
                  return (
                    <button key={exam.id} type="button" onClick={() => handleSelectExam(exam)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{exam.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">{exam.category}</span>
                      </div>
                      {s && <p className="text-xs text-gray-500 mt-0.5">다음 시험: {s.examDate}</p>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exam schedule auto-fill */}
          {selectedExam && upcomingSchedule && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2.5">
              <p className="text-xs font-semibold text-blue-300 mb-1">📅 {upcomingSchedule.round} 자동입력</p>
              <div className="space-y-0.5 text-xs text-gray-400">
                <p>접수: <span className="text-white">{upcomingSchedule.registrationStart} ~ {upcomingSchedule.registrationEnd}</span></p>
                <p>시험: <span className="text-white">{upcomingSchedule.examDate}</span></p>
                <p>발표: <span className="text-white">{upcomingSchedule.resultDate}</span></p>
              </div>
              {selectedExam.schedules.length > 1 && (
                <div className="mt-2 pt-2 border-t border-blue-500/20 flex flex-wrap gap-1">
                  {selectedExam.schedules.map((s) => (
                    <button key={s.round} type="button" onClick={() => setTargetDate(s.examDate)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                        targetDate === s.examDate
                          ? "bg-blue-500/30 border-blue-500/50 text-blue-300"
                          : "border-gray-700 text-gray-500 hover:border-gray-600"
                      }`}>
                      {s.round.replace(/\d{4}년 /, "")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Study days */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">공부 가능한 요일</label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d) => (
                <button key={d.key} type="button" onClick={() => toggleDay(d.key)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    studyDays.includes(d.key)
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-gray-800 text-gray-600 border border-gray-700 hover:border-gray-600"
                  }`}>
                  {d.label}
                </button>
              ))}
              <div className="py-2 rounded-lg text-xs font-bold bg-purple-600/20 text-purple-400 border border-purple-500/30 text-center" title="피드백의 날">
                일
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 flex justify-between">
              <span>🟣 일요일 = 피드백·평가의 날</span>
              <span className="text-blue-400">주 {studyDays.length}일</span>
            </p>
          </div>

          {/* Daily hours + Exam date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">하루 학습시간</label>
              <div className="relative">
                <input type="number" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)}
                  placeholder="2" min="0.5" step="0.5"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition" />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-600">h</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">시험일</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition" />
            </div>
          </div>

          {weeklyHours > 0 && (
            <p className="text-xs text-gray-600">
              주 {weeklyHours}시간 학습
            </p>
          )}

          <button type="submit"
            disabled={isLoading || !goal || !dailyHours || studyDays.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2">
            {isLoading
              ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />생성 중...</>
              : (goalInfo ? "↺ 다시 생성" : "✨ 플랜 생성")}
          </button>
        </form>
      </div>

      {/* ── Goal Info ── */}
      {goalInfo && (
        <div className="border-t border-gray-800 pt-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📊 목표 현황</h2>
          <div className="space-y-2">
            {[
              { label: "총 학습량", value: `${goalInfo.totalHours}h`, color: "text-white" },
              { label: "하루 목표", value: `${goalInfo.dailyHours}h`, color: "text-blue-400" },
              { label: "목표일",   value: endDateStr ?? "-",           color: "text-purple-400" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-3">
            <div className="relative w-14 h-14">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle cx="28" cy="28" r="22" fill="none" stroke="url(#pg2)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*22}`}
                  strokeDashoffset={`${2*Math.PI*22*(1-goalInfo.progressPercent/100)}`}
                  className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="pg2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-white">{goalInfo.progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Spaced Repetition ── */}
      <div className="border-t border-gray-800 pt-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">🧠 망각곡선 복습주기</h3>
        <div className="space-y-1.5">
          {reviewIntervals.map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-7">{r.label}</span>
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.retention}%` }} />
              </div>
              <span className="text-xs text-gray-600 w-7 text-right">{r.retention}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
