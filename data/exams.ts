export interface ExamSchedule {
  round: string;        // 회차
  registrationStart: string;  // 접수 시작
  registrationEnd: string;    // 접수 마감
  examDate: string;           // 시험일
  resultDate: string;         // 합격발표
}

export interface Exam {
  id: string;
  name: string;
  category: string;
  organization: string;
  schedules: ExamSchedule[];
  infoUrl: string;
}

export const EXAM_DB: Exam[] = [
  {
    id: "ipc",
    name: "정보처리기사 필기",
    category: "IT",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2026년 1회", registrationStart: "2026-01-27", registrationEnd: "2026-01-30", examDate: "2026-02-15", resultDate: "2026-03-04" },
      { round: "2026년 2회", registrationStart: "2026-04-14", registrationEnd: "2026-04-17", examDate: "2026-05-10", resultDate: "2026-05-27" },
      { round: "2026년 3회", registrationStart: "2026-06-16", registrationEnd: "2026-06-19", examDate: "2026-07-12", resultDate: "2026-07-29" },
    ],
  },
  {
    id: "ipc-practical",
    name: "정보처리기사 실기",
    category: "IT",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2026년 1회", registrationStart: "2026-03-23", registrationEnd: "2026-03-26", examDate: "2026-04-18", resultDate: "2026-06-05" },
      { round: "2026년 2회", registrationStart: "2026-06-22", registrationEnd: "2026-06-25", examDate: "2026-07-18", resultDate: "2026-09-04" },
      { round: "2026년 3회", registrationStart: "2026-09-21", registrationEnd: "2026-09-28", examDate: "2026-10-24", resultDate: "2026-12-11" },
    ],
  },
  {
    id: "ica-written",
    name: "정보처리산업기사 필기",
    category: "IT",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2026년 1회", registrationStart: "2026-01-05", registrationEnd: "2026-01-08", examDate: "2026-02-14", resultDate: "2026-03-18" },
      { round: "2026년 2회", registrationStart: "2026-04-13", registrationEnd: "2026-04-16", examDate: "2026-05-09", resultDate: "2026-06-10" },
      { round: "2026년 3회", registrationStart: "2026-06-22", registrationEnd: "2026-06-25", examDate: "2026-07-18", resultDate: "2026-08-19" },
    ],
  },
  {
    id: "ica-practical",
    name: "정보처리산업기사 실기",
    category: "IT",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2026년 1회", registrationStart: "2026-03-23", registrationEnd: "2026-03-26", examDate: "2026-04-25", resultDate: "2026-06-03" },
      { round: "2026년 2회", registrationStart: "2026-06-22", registrationEnd: "2026-06-25", examDate: "2026-07-18", resultDate: "2026-08-26" },
      { round: "2026년 3회", registrationStart: "2026-08-24", registrationEnd: "2026-08-27", examDate: "2026-09-26", resultDate: "2026-11-04" },
    ],
  },
  {
    id: "bigdata-written",
    name: "빅데이터분석기사 필기",
    category: "IT",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [
      { round: "2026년 12회", registrationStart: "2026-03-03", registrationEnd: "2026-03-09", examDate: "2026-04-04", resultDate: "2026-04-24" },
      { round: "2026년 13회", registrationStart: "2026-08-03", registrationEnd: "2026-08-07", examDate: "2026-09-05", resultDate: "2026-09-23" },
    ],
  },
  {
    id: "bigdata-practical",
    name: "빅데이터분석기사 실기",
    category: "IT",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [
      { round: "2026년 12회", registrationStart: "2026-05-18", registrationEnd: "2026-05-22", examDate: "2026-06-20", resultDate: "2026-07-10" },
      { round: "2026년 13회", registrationStart: "2026-10-26", registrationEnd: "2026-10-30", examDate: "2026-11-28", resultDate: "2026-12-18" },
    ],
  },
  {
    id: "cca1",
    name: "컴퓨터활용능력 1급",
    category: "IT",
    organization: "대한상공회의소",
    infoUrl: "https://license.korcham.net",
    schedules: [],
  },
  {
    id: "cca2",
    name: "컴퓨터활용능력 2급",
    category: "IT",
    organization: "대한상공회의소",
    infoUrl: "https://license.korcham.net",
    schedules: [],
  },
  {
    id: "sqld",
    name: "SQLD",
    category: "IT/데이터",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [
      { round: "2026년 60회", registrationStart: "2026-02-02", registrationEnd: "2026-02-06", examDate: "2026-03-07", resultDate: "2026-03-27" },
      { round: "2026년 61회", registrationStart: "2026-04-27", registrationEnd: "2026-05-01", examDate: "2026-05-31", resultDate: "2026-06-19" },
      { round: "2026년 62회", registrationStart: "2026-07-20", registrationEnd: "2026-07-24", examDate: "2026-08-22", resultDate: "2026-09-11" },
      { round: "2026년 63회", registrationStart: "2026-10-12", registrationEnd: "2026-10-16", examDate: "2026-11-14", resultDate: "2026-12-04" },
    ],
  },
  {
    id: "sqlp",
    name: "SQLP",
    category: "IT/데이터",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [],
  },
  {
    id: "adsp",
    name: "ADsP",
    category: "IT/데이터",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [
      { round: "2026년 48회", registrationStart: "2026-01-05", registrationEnd: "2026-01-09", examDate: "2026-02-07", resultDate: "2026-03-06" },
      { round: "2026년 49회", registrationStart: "2026-04-13", registrationEnd: "2026-04-17", examDate: "2026-05-17", resultDate: "2026-06-05" },
      { round: "2026년 50회", registrationStart: "2026-07-06", registrationEnd: "2026-07-10", examDate: "2026-08-08", resultDate: "2026-08-28" },
      { round: "2026년 51회", registrationStart: "2026-09-28", registrationEnd: "2026-10-02", examDate: "2026-10-31", resultDate: "2026-11-20" },
    ],
  },
  {
    id: "toeic",
    name: "TOEIC",
    category: "어학",
    organization: "YBM",
    infoUrl: "https://www.toeic.co.kr",
    schedules: [],
  },
  {
    id: "tesat",
    name: "TESAT (테셋)",
    category: "경제",
    organization: "한국경제신문",
    infoUrl: "https://www.tesat.or.kr",
    schedules: [
      { round: "2026년 103회", registrationStart: "2025-12-30", registrationEnd: "2026-01-26", examDate: "2026-02-07", resultDate: "2026-02-13" },
      { round: "2026년 104회", registrationStart: "2026-02-10", registrationEnd: "2026-03-09", examDate: "2026-03-21", resultDate: "2026-03-27" },
      { round: "2026년 105회", registrationStart: "2026-03-24", registrationEnd: "2026-05-04", examDate: "2026-05-16", resultDate: "2026-05-22" },
      { round: "2026년 106회", registrationStart: "2026-05-19", registrationEnd: "2026-06-15", examDate: "2026-06-27", resultDate: "2026-07-03" },
      { round: "2026년 107회", registrationStart: "2026-06-30", registrationEnd: "2026-07-27", examDate: "2026-08-08", resultDate: "2026-08-14" },
      { round: "2026년 108회", registrationStart: "2026-08-11", registrationEnd: "2026-09-07", examDate: "2026-09-19", resultDate: "2026-09-23" },
      { round: "2026년 109회", registrationStart: "2026-09-22", registrationEnd: "2026-10-26", examDate: "2026-11-07", resultDate: "2026-11-13" },
      { round: "2026년 110회", registrationStart: "2026-11-10", registrationEnd: "2026-12-07", examDate: "2026-12-19", resultDate: "2026-12-24" },
    ],
  },
  {
    id: "koreanhist",
    name: "한국사능력검정시험",
    category: "한국사",
    organization: "국사편찬위원회",
    infoUrl: "https://www.historyexam.go.kr",
    schedules: [],
  },
  {
    id: "electric",
    name: "전기기사",
    category: "전기",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [],
  },
  {
    id: "safety",
    name: "산업안전기사",
    category: "안전",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [],
  },
  {
    id: "civil9",
    name: "공무원 9급 (국가직)",
    category: "공무원",
    organization: "인사혁신처",
    infoUrl: "https://www.gosi.kr",
    schedules: [],
  },
  {
    id: "civil7",
    name: "공무원 7급 (국가직)",
    category: "공무원",
    organization: "인사혁신처",
    infoUrl: "https://www.gosi.kr",
    schedules: [],
  },
  {
    id: "cpa",
    name: "공인회계사 (CPA)",
    category: "회계/금융",
    organization: "금융감독원",
    infoUrl: "https://cpa.fss.or.kr",
    schedules: [],
  },
  {
    id: "aicpa",
    name: "세무사",
    category: "회계/금융",
    organization: "한국세무사회",
    infoUrl: "https://www.kacpta.or.kr",
    schedules: [],
  },
  {
    id: "iaim",
    name: "투자자산운용사",
    category: "회계/금융",
    organization: "한국금융투자협회 (KOFIA)",
    infoUrl: "https://license.kofia.or.kr",
    schedules: [
      { round: "2026년 44회", registrationStart: "2025-12-22", registrationEnd: "2025-12-26", examDate: "2026-01-18", resultDate: "2026-01-29" },
      { round: "2026년 45회", registrationStart: "2026-03-09", registrationEnd: "2026-03-13", examDate: "2026-04-19", resultDate: "2026-05-01" },
      { round: "2026년 46회", registrationStart: "2026-06-08", registrationEnd: "2026-06-12", examDate: "2026-07-19", resultDate: "2026-07-31" },
      { round: "2026년 47회", registrationStart: "2026-09-07", registrationEnd: "2026-09-11", examDate: "2026-10-18", resultDate: "2026-10-30" },
    ],
  },
  {
    id: "ssa2",
    name: "사회조사분석사 2급",
    category: "사회/통계",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2026년 1회 필기", registrationStart: "2026-01-05", registrationEnd: "2026-01-08", examDate: "2026-02-07", resultDate: "2026-03-04" },
      { round: "2026년 1회 실기", registrationStart: "2026-03-23", registrationEnd: "2026-03-26", examDate: "2026-04-18", resultDate: "2026-05-27" },
      { round: "2026년 2회 필기", registrationStart: "2026-06-22", registrationEnd: "2026-06-25", examDate: "2026-07-18", resultDate: "2026-08-12" },
      { round: "2026년 2회 실기", registrationStart: "2026-08-24", registrationEnd: "2026-08-27", examDate: "2026-09-26", resultDate: "2026-11-04" },
    ],
  },
  {
    id: "aws-saa",
    name: "AWS SAA (Solutions Architect)",
    category: "클라우드",
    organization: "Amazon Web Services",
    infoUrl: "https://aws.amazon.com/certification",
    schedules: [],
  },
  {
    id: "gtq",
    name: "GTQ (그래픽기술자격)",
    category: "디자인",
    organization: "한국생산성본부",
    infoUrl: "https://www.kpc.or.kr",
    schedules: [],
  },
];

export function searchExams(query: string): Exam[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().replace(/\s/g, "");
  return EXAM_DB.filter((e) =>
    e.name.toLowerCase().replace(/\s/g, "").includes(q) ||
    e.category.toLowerCase().includes(q) ||
    e.id.toLowerCase().includes(q)
  ).slice(0, 6);
}

// 오늘 이후 가장 가까운 시험 일정 반환
export function getUpcomingSchedule(exam: Exam): ExamSchedule | null {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = exam.schedules.filter((s) => s.examDate >= today);
  return upcoming.length > 0 ? upcoming[0] : exam.schedules[exam.schedules.length - 1];
}
