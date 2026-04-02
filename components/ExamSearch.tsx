"use client";

import { useState, useRef, useEffect } from "react";
import { searchExams, EXAM_DB, Exam, ExamSchedule } from "@/data/exams";
import { YearlyEvent } from "@/types/plan";

interface ExamSearchProps {
  onEventsChange: (events: YearlyEvent[]) => void;
}

function getTodayKST(): Date {
  return new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }));
}

function scheduleToEvents(exam: Exam, schedule: ExamSchedule): YearlyEvent[] {
  const today = getTodayKST();
  const toDDay = (dateStr: string) =>
    Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const parseDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return { month: d.getMonth() + 1, day: d.getDate() };
  };

  return [
    {
      id: `${exam.id}-${schedule.round}-reg`,
      ...parseDate(schedule.registrationStart),
      title: `${exam.name} 접수`,
      type: "registration" as const,
      description: `${schedule.round} 원서접수 (${schedule.registrationStart} ~ ${schedule.registrationEnd})`,
      dDay: Math.max(0, toDDay(schedule.registrationStart)),
    },
    {
      id: `${exam.id}-${schedule.round}-exam`,
      ...parseDate(schedule.examDate),
      title: `${exam.name} 시험`,
      type: "exam" as const,
      description: `${schedule.round} 시험일 (${schedule.examDate})`,
      dDay: Math.max(0, toDDay(schedule.examDate)),
    },
    {
      id: `${exam.id}-${schedule.round}-result`,
      ...parseDate(schedule.resultDate),
      title: `${exam.name} 발표`,
      type: "milestone" as const,
      description: `${schedule.round} 합격발표일 (${schedule.resultDate})`,
      dDay: Math.max(0, toDDay(schedule.resultDate)),
    },
  ];
}

const STORAGE_KEY = "examSearch_addedExams";

export default function ExamSearch({ onEventsChange }: ExamSearchProps) {
  const [query, setQuery]                     = useState("");
  const [suggestions, setSuggestions]         = useState<Exam[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addedExams, setAddedExams]           = useState<{ exam: Exam; schedule: ExamSchedule }[]>([]);
  const [loaded, setLoaded]                   = useState(false);
  const [saveStatus, setSaveStatus]           = useState<"idle" | "saving" | "saved">("idle");
  const inputRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 마운트 시 Sheets → localStorage 순으로 불러오기
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/exam-search");
        const data = await res.json();
        if (data.items?.length > 0) {
          const restored = data.items
            .map(({ examId, round }: { examId: string; round: string }) => {
              const exam = EXAM_DB.find((e) => e.id === examId);
              if (!exam) return null;
              const schedule = exam.schedules.find((s) => s.round === round) ?? exam.schedules[0];
              return { exam, schedule };
            })
            .filter(Boolean) as { exam: Exam; schedule: ExamSchedule }[];
          setAddedExams(restored);
          setLoaded(true);
          return;
        }
      } catch { /* Sheets 미설정 시 localStorage 폴백 */ }

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setAddedExams(JSON.parse(saved));
      } catch { /* ignore */ }
      setLoaded(true);
    }
    load();
  }, []);

  // addedExams 변경 시 로컬 저장 + Sheets 자동저장 + 부모 이벤트 전달
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addedExams));
    onEventsChange(addedExams.flatMap(({ exam, schedule }) => scheduleToEvents(exam, schedule)));

    // Sheets 자동저장 (실패해도 조용히 무시)
    setSaveStatus("saving");
    fetch("/api/exam-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: addedExams.map((a) => ({ examId: a.exam.id, round: a.schedule.round })) }),
    })
      .then(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      })
      .catch(() => setSaveStatus("idle"));
  }, [addedExams, loaded]);

  const handleClearAll = () => {
    setAddedExams([]);
  };

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

  const handleQuery = (v: string) => {
    setQuery(v);
    // 2026년 이후 일정이 있는 시험만 표시
    const r = searchExams(v).filter((exam) =>
      exam.schedules.some((s) => s.examDate >= "2026-01-01")
    );
    setSuggestions(r);
    setShowSuggestions(r.length > 0 && v.length > 0);
  };

  const handleSelectExam = (exam: Exam) => {
    setShowSuggestions(false);
    setQuery("");
    // 2026년 이후 가장 가까운 일정 선택
    const upcoming =
      exam.schedules.find((s) => s.examDate >= "2026-01-01" && s.examDate >= new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" })) ??
      exam.schedules.find((s) => s.examDate >= "2026-01-01") ??
      exam.schedules[exam.schedules.length - 1];

    const alreadyExists = addedExams.some(
      (a) => a.exam.id === exam.id && a.schedule.round === upcoming.round
    );
    if (!alreadyExists) {
      setAddedExams((prev) => [...prev, { exam, schedule: upcoming }]);
    }
  };

  const handleRemove = (examId: string, round: string) => {
    setAddedExams((prev) => prev.filter((a) => !(a.exam.id === examId && a.schedule.round === round)));
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

        {showSuggestions && (
          <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden max-h-80 overflow-y-auto">
            {suggestions.map((exam) => {
              const rounds2026 = exam.schedules.filter((s) => s.examDate >= "2026-01-01");
              if (rounds2026.length === 0) return null;
              return (
                <div key={exam.id} className="border-b border-gray-700/50 last:border-0">
                  <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{exam.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">{exam.category}</span>
                  </div>
                  {rounds2026.map((schedule) => (
                    <button
                      key={schedule.round}
                      type="button"
                      onClick={() => {
                        setShowSuggestions(false);
                        setQuery("");
                        const alreadyExists = addedExams.some((a) => a.exam.id === exam.id && a.schedule.round === schedule.round);
                        if (!alreadyExists) setAddedExams((prev) => [...prev, { exam, schedule }]);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-blue-300">{schedule.round.replace(/\d{4}년 /, "")}</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-0.5">
                        <p>접수: <span className="text-gray-300">{schedule.registrationStart} ~ {schedule.registrationEnd}</span></p>
                        <p>시험: <span className="text-white font-semibold">{schedule.examDate}</span></p>
                        <p>발표: <span className="text-gray-300">{schedule.resultDate}</span></p>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 등록된 시험 태그 + 저장/전체삭제 버튼 */}
      {addedExams.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            {addedExams.map(({ exam, schedule }) => (
              <span key={`${exam.id}-${schedule.round}`} className="inline-flex items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-full">
                {exam.name} <span className="text-gray-500">{schedule.round.replace(/\d{4}년 /, "")}</span>
                <button onClick={() => handleRemove(exam.id, schedule.round)} className="text-gray-600 hover:text-red-400 transition-colors">✕</button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs transition-all ${
              saveStatus === "saving" ? "text-gray-500" :
              saveStatus === "saved"  ? "text-green-500" : "text-transparent"
            }`}>
              {saveStatus === "saving" ? "저장 중..." : "✓ 저장됨"}
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold bg-gray-800 border border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              🗑 전체삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
