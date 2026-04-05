"use client";

import { WeeklyPlan, DayPlan } from "@/types/plan";

export interface ExamRegEvent {
  dayName: string;
  title: string;
  endDate: string;
}

interface PlanInfo { id: string; title: string; }

interface WeeklyPlannerProps {
  weeklyPlan: WeeklyPlan;
  examRegistrations?: ExamRegEvent[];
  plans?: PlanInfo[];
}

// 플랜별 색상 팔레트
const PLAN_PALETTE = [
  { bg: "bg-blue-500/20",   border: "border-blue-500/40",   text: "text-blue-300",   dot: "bg-blue-400" },
  { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-300", dot: "bg-purple-400" },
  { bg: "bg-emerald-500/20",border: "border-emerald-500/40",text: "text-emerald-300",dot: "bg-emerald-400" },
  { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-300", dot: "bg-orange-400" },
  { bg: "bg-pink-500/20",   border: "border-pink-500/40",   text: "text-pink-300",   dot: "bg-pink-400" },
  { bg: "bg-cyan-500/20",   border: "border-cyan-500/40",   text: "text-cyan-300",   dot: "bg-cyan-400" },
  { bg: "bg-rose-500/20",   border: "border-rose-500/40",   text: "text-rose-300",   dot: "bg-rose-400" },
  { bg: "bg-lime-500/20",   border: "border-lime-500/40",   text: "text-lime-300",   dot: "bg-lime-400" },
];
const ROADMAP_COLOR = { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-300", dot: "bg-amber-400" };
const EXAM_COLOR    = { bg: "bg-red-500/20",   border: "border-red-500/40",   text: "text-red-300",   dot: "bg-red-400" };
const DEFAULT_COLOR = { bg: "bg-gray-700/20",  border: "border-gray-700",     text: "text-gray-400",  dot: "bg-gray-500" };

// 월~토 2행 3열 + 일요일 마지막 행
const ROW1 = ["Monday",    "Tuesday",  "Wednesday"];
const ROW2 = ["Thursday",  "Friday",   "Saturday"];
const ROW3 = ["Sunday"];

const DAY_KR: Record<string, string> = {
  Monday: "월", Tuesday: "화", Wednesday: "수",
  Thursday: "목", Friday: "금", Saturday: "토", Sunday: "일",
};

function DayCard({ day, isToday, isSunday, examReg, colorMap }: {
  day: DayPlan; isToday: boolean; isSunday?: boolean;
  examReg?: { title: string; endDate: string }[];
  colorMap: Map<string, typeof DEFAULT_COLOR>;
}) {
  const hours = Math.floor(day.totalMinutes / 60);
  const mins  = day.totalMinutes % 60;

  return (
    <div className={`flex flex-col rounded-lg border overflow-hidden ${
      isToday   ? "border-blue-500/50 bg-blue-500/5"
      : isSunday ? "border-amber-800/40 bg-amber-900/10"
      : "border-gray-800 bg-gray-900/50"
    }`}>
      {/* Day header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between ${
        isToday ? "border-blue-500/20 bg-blue-500/10" : "border-gray-800"
      }`}>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-black ${
            isToday ? "text-blue-400" : isSunday ? "text-amber-500" : "text-gray-300"
          }`}>
            {DAY_KR[day.day]}요일
          </span>
          {isToday && <span className="text-xs text-blue-400 font-bold bg-blue-500/20 px-1.5 rounded">오늘</span>}
          {isSunday && <span className="text-xs text-amber-600">피드백·회고</span>}
        </div>
        {day.totalMinutes > 0 && (
          <span className="text-xs text-gray-600">
            {hours > 0 ? `${hours}h ` : ""}{mins > 0 ? `${mins}m` : ""}
          </span>
        )}
      </div>

      {/* 시험 접수 시작 알림 */}
      {examReg && examReg.length > 0 && (
        <div className="px-2 pt-2 space-y-1">
          {examReg.map((reg, i) => (
            <div key={i} className="flex items-start gap-1 px-2 py-1.5 rounded border bg-orange-500/20 border-orange-400/50">
              <span className="text-xs">📋</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-orange-100 leading-tight break-words">{reg.title} 접수 시작</p>
                <p className="text-xs text-orange-300/70 mt-0.5">~{reg.endDate}까지</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sessions */}
      <div className={`p-2 space-y-1.5 overflow-y-auto ${isSunday ? "grid grid-cols-3 gap-2 space-y-0" : ""}`}>
        {day.sessions.length === 0 ? (
          <div className="flex items-center justify-center py-4 col-span-3">
            <span className="text-xs text-gray-700">-</span>
          </div>
        ) : (
          day.sessions.map((session, si) => {
            const cfg = session.planId ? (colorMap.get(session.planId) ?? DEFAULT_COLOR) : DEFAULT_COLOR;
            const dur = session.duration >= 60
              ? `${Math.floor(session.duration / 60)}h${session.duration % 60 > 0 ? `${session.duration % 60}m` : ""}`
              : `${session.duration}m`;

            return (
              <div
                key={si}
                className={`group relative px-2 py-1.5 rounded border text-xs cursor-default ${cfg.bg} ${cfg.border}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className={`font-semibold text-xs leading-tight break-words ${cfg.text}`}>
                    {session.topic}
                  </span>
                </div>
                <span className="text-gray-600 text-xs">{dur}</span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-20 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl pointer-events-none"
                  style={{ width: "max-content", maxWidth: "200px" }}>
                  <p className="text-gray-300 text-xs leading-relaxed">{session.description}</p>
                  <span className={`text-xs ${cfg.text}`}>{session.type} · {dur}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function WeeklyPlanner({ weeklyPlan, examRegistrations = [], plans = [] }: WeeklyPlannerProps) {
  const today    = new Date();
  const todayDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today.getDay()];

  // planId → color 맵 빌드
  const colorMap = new Map<string, typeof DEFAULT_COLOR>();
  plans.forEach((p, i) => colorMap.set(p.id, PLAN_PALETTE[i % PLAN_PALETTE.length]));
  colorMap.set("__roadmap__", ROADMAP_COLOR);
  colorMap.set("__exam__",    EXAM_COLOR);

  const getDay = (dayName: string): DayPlan =>
    weeklyPlan.days.find((d) => d.day === dayName) ??
    { day: dayName, dayKr: DAY_KR[dayName] + "요일", sessions: [], totalMinutes: 0 };

  const getExamReg = (dayName: string) =>
    examRegistrations.filter((e) => e.dayName === dayName).map(({ title, endDate }) => ({ title, endDate }));

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-1">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">위클리 플래너</h2>
          <p className="text-xs text-gray-600 mt-0.5">{weeklyPlan.weekNumber}주차 · {weeklyPlan.theme}</p>
        </div>
        {/* 플랜별 색상 범례 */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
          {plans.map((p, i) => {
            const c = PLAN_PALETTE[i % PLAN_PALETTE.length];
            return (
              <div key={p.id} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className="text-gray-500 truncate max-w-[80px]">{p.title}</span>
              </div>
            );
          })}
          {colorMap.has("__roadmap__") && weeklyPlan.days.some(d => d.sessions.some(s => s.planId === "__roadmap__")) && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${ROADMAP_COLOR.dot}`} />
              <span className="text-gray-500">로드맵</span>
            </div>
          )}
          {colorMap.has("__exam__") && weeklyPlan.days.some(d => d.sessions.some(s => s.planId === "__exam__")) && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${EXAM_COLOR.dot}`} />
              <span className="text-gray-500">시험준비</span>
            </div>
          )}
        </div>
      </div>

      {/* 1행: 월 화 수 */}
      <div className="grid grid-cols-3 gap-2 lg:flex-1">
        {ROW1.map((dayName) => (
          <DayCard key={dayName} day={getDay(dayName)} isToday={todayDay === dayName} examReg={getExamReg(dayName)} colorMap={colorMap} />
        ))}
      </div>

      {/* 2행: 목 금 토 */}
      <div className="grid grid-cols-3 gap-2 lg:flex-1">
        {ROW2.map((dayName) => (
          <DayCard key={dayName} day={getDay(dayName)} isToday={todayDay === dayName} examReg={getExamReg(dayName)} colorMap={colorMap} />
        ))}
      </div>

      {/* 3행: 일요일 + 따야할 자격증 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <DayCard day={getDay("Sunday")} isToday={todayDay === "Sunday"} isSunday examReg={getExamReg("Sunday")} colorMap={colorMap} />
        </div>
        <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
          <p className="text-xs font-semibold text-gray-400 mb-2">🎯 따야할 자격증</p>
          <div className="grid grid-cols-2 gap-1">
            {["정보처리기사","빅데이터분석기사","SQLD","ADSP","사회조사분석사","투자자산운용사"].map((cert) => (
              <div key={cert} className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/60 border border-gray-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-xs text-gray-300 truncate">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
