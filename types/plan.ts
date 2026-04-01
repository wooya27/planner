export interface Task {
  id: string;
  title: string;
  duration: number; // minutes
  completed: boolean;
  type: "study" | "review" | "practice";
  subject: string;
}

export interface Session {
  topic: string;
  duration: number; // minutes
  type: "study" | "review" | "practice" | "rest";
  description: string;
}

export interface DayPlan {
  day: string;
  dayKr: string;
  sessions: Session[];
  totalMinutes: number;
}

export interface WeeklyPlan {
  weekNumber: number;
  theme: string;
  days: DayPlan[];
}

export interface YearlyEvent {
  id: string;
  month: number;
  day: number;
  title: string;
  type: "registration" | "exam" | "milestone" | "review";
  description: string;
  dDay?: number;
}

export interface GoalInfo {
  title: string;
  totalHours: number;
  dailyHours: number;
  estimatedWeeks: number;
  estimatedEndDate: string;
  progressPercent: number;
  subjects: string[];
  difficulty: "초급" | "중급" | "고급";
}

export interface StudyPlan {
  goalInfo: GoalInfo;
  todayTasks: Task[];
  weeklyPlan: WeeklyPlan;
  yearlyEvents: YearlyEvent[];
  studyTips: string[];
}

export interface PlanRequest {
  goal: string;
  dailyHours: number;
  studyDays: string[];     // e.g. ["Monday","Tuesday","Thursday"]
  targetExamDate?: string;
  studyMode?: "general" | "certification";
}
