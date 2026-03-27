"use client";

import { useState, useRef, useEffect } from "react";
import { searchExams, Exam, ExamSchedule } from "@/data/exams";
import { YearlyEvent } from "@/types/plan";

interface ExamSearchProps {
  onEventsChange: (events: YearlyEvent[]) => void;
}

function scheduleToEvents(exam: Exam, schedule: ExamSchedule): YearlyEvent[] {
  const today = new Date();
  const events: YearlyEvent[] = [];

  const toDDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const parseDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return { month: d.getMonth() + 1, day: d.getDate() };
  };

  // 접수 시작
  const regStart = parseDate(schedule.registrationStart);
  events.push({
    id: `${exam.id}-${schedule.round}-reg`,
    ...regStart,
    title: `${exam.name} 접수`,
    type: "registration",
    description: `${schedule.round} 원서접수 (${schedule.registrationStart} ~ ${schedule.registrationEnd})`,
    dDay: Math.max(0, toDDay(schedule.registrationStart)),
  });

  // 시험일
  const examD = parseDate(schedule.examDate);
  events.push({
    id: `${exam.id}-${schedule.round}-exam`,
    ...examD,
    title: `${exam.name} 시험`,
    type: "exam",
    description: `${schedule.round} 시험일 (${schedule.examDate})`,
    dDay: Math.max(0, toDDay(schedule.examDate)),
  });

  // 합격발표
  const resultD = parseDate(schedule.resultDate);
  events.push({
    id: `${exam.id}-${schedule.round}-result`,
    ...resultD,
    title: `${exam.name} 발표`,
    type: "milestone",
    description: `${schedule.round} 합격발표일 (${schedule.resultDate})`,
    dDay: Math.max(0, toDDay(schedule.resultDate)),
  });

  return events;
}

const STORAGE_KEY = "examSearch_addedExams";

export default function ExamSearch({ onEventsChange }: ExamSearchProps) {
  const [query, setQuery]                     = useState("");
  const [suggestions, setSuggestions]         = useState<Exam[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addedExams, setAddedExams] = useState<{ exam: Exam; schedule: ExamSchedule }[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const inputRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current   && !inputRef.current.contains(e.target as Node)
      ) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // addedExams 변경 시 localStorage 저장 + 부모에 이벤트 전달
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addedExams));
    const allEvents = addedExams.flatMap(({ exam, schedule }) =>
      scheduleToEvents(exam, schedule)
    );
    onEventsChange(allEvents);
  }, [addedExams]);

  const handleQuery = (v: string) => {
    setQuery(v);
    const r = searchExams(v);
    setSuggestions(r);
    setShowSuggestions(r.length > 0 && v.length > 0);
  };

  const handleSelectExam = (exam: Exam) => {
    setShowSuggestions(false);
    setQuery("");
    // 가장 가까운 일정 자동 선택
    const today = new Date().toISOString().split("T")[0];
    const upcoming = exam.schedules.find((s) => s.examDate >= today) ?? exam.schedules[exam.schedules.length - 1];

    // 이미 추가된 경우 중복 방지
    const alreadyExists = addedExams.some(
      (a) => a.exam.id === exam.id && a.schedule.round === upcoming.round
    );
    if (!alreadyExists) {
      setAddedExams((prev) => [...prev, { exam, schedule: upcoming }]);
    }
  };

  const handleSelectRound = (examId: string, round: string) => {
    setAddedExams((prev) =>
      prev.map((a) => {
        if (a.exam.id !== examId) return a;
        const newSchedule = a.exam.schedules.find((s) => s.round === round) ?? a.schedule;
        return { ...a, schedule: newSchedule };
      })
    );
  };

  const handleRemove = (examId: string, round: string) => {
    setAddedExams((prev) =>
      prev.filter((a) => !(a.exam.id === examId && a.schedule.round === round))
    );
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">📅 시험 일정 검색</h2>
        {addedExams.length > 0 && (
          <span className="text-xs text-gray-500">{addedExams.length}개 시험 등록됨</span>
        )}
      </div>

      {/* 검색 입력 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          onFocus={() => query && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="시험명 검색 (정보처리기사, TOEIC, 컴활...)"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>

        {/* 자동완성 드롭다운 */}
        {showSuggestions && (
          <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden">
            {suggestions.map((exam) => {
              const today = new Date().toISOString().split("T")[0];
              const upcoming = exam.schedules.find((s) => s.examDate >= today);
              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => handleSelectExam(exam)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{exam.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">{exam.category}</span>
                  </div>
                  {upcoming && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      다음 시험: <span className="text-blue-400">{upcoming.examDate}</span>
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 추가된 시험 카드 목록 */}
      {addedExams.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {addedExams.map(({ exam, schedule }) => (
            <div
              key={`${exam.id}-${schedule.round}`}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 w-full"
            >
              {/* 시험명 + 삭제 */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-bold text-white">{exam.name}</span>
                  <span className="ml-2 text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">{exam.category}</span>
                </div>
                <button
                  onClick={() => handleRemove(exam.id, schedule.round)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>

              {/* 회차 선택 */}
              {exam.schedules.length > 1 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {exam.schedules.map((s) => (
                    <button
                      key={s.round}
                      onClick={() => handleSelectRound(exam.id, s.round)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                        schedule.round === s.round
                          ? "bg-blue-500/30 border-blue-500/50 text-blue-300"
                          : "border-gray-700 text-gray-500 hover:border-gray-600"
                      }`}
                    >
                      {s.round.replace(/\d{4}년 /, "")}
                    </button>
                  ))}
                </div>
              )}

              {/* 일정 상세 */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">📋</span>
                  <span className="text-gray-400">접수</span>
                  <span className="text-white">{schedule.registrationStart} ~ {schedule.registrationEnd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">📝</span>
                  <span className="text-gray-400">시험</span>
                  <span className="text-white font-semibold">{schedule.examDate}</span>
                  {(() => {
                    const d = Math.ceil((new Date(schedule.examDate).getTime() - Date.now()) / 86400000);
                    return d >= 0 ? <span className="text-amber-400 font-bold">D-{d}</span> : <span className="text-gray-600">종료</span>;
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">🎯</span>
                  <span className="text-gray-400">발표</span>
                  <span className="text-white">{schedule.resultDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
