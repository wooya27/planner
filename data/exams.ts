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
      { round: "2025년 1회", registrationStart: "2025-01-06", registrationEnd: "2025-01-09", examDate: "2025-02-15", resultDate: "2025-03-19" },
      { round: "2025년 2회", registrationStart: "2025-04-14", registrationEnd: "2025-04-17", examDate: "2025-05-17", resultDate: "2025-06-25" },
      { round: "2025년 3회", registrationStart: "2025-06-23", registrationEnd: "2025-06-26", examDate: "2025-07-26", resultDate: "2025-08-27" },
      { round: "2026년 1회", registrationStart: "2026-01-27", registrationEnd: "2026-01-30", examDate: "2026-02-15", resultDate: "2026-03-18" },
      { round: "2026년 2회", registrationStart: "2026-04-14", registrationEnd: "2026-04-17", examDate: "2026-05-10", resultDate: "2026-06-10" },
      { round: "2026년 3회", registrationStart: "2026-06-16", registrationEnd: "2026-06-19", examDate: "2026-07-12", resultDate: "2026-08-12" },
    ],
  },
  {
    id: "ipc-practical",
    name: "정보처리기사 실기",
    category: "IT",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2025년 1회", registrationStart: "2025-03-17", registrationEnd: "2025-03-20", examDate: "2025-04-19", resultDate: "2025-05-28" },
      { round: "2025년 2회", registrationStart: "2025-06-23", registrationEnd: "2025-06-26", examDate: "2025-07-19", resultDate: "2025-08-27" },
      { round: "2025년 3회", registrationStart: "2025-08-25", registrationEnd: "2025-08-28", examDate: "2025-09-27", resultDate: "2025-11-05" },
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
      { round: "2025년 1회", registrationStart: "2025-01-06", registrationEnd: "2025-01-09", examDate: "2025-02-15", resultDate: "2025-03-19" },
      { round: "2025년 2회", registrationStart: "2025-04-14", registrationEnd: "2025-04-17", examDate: "2025-05-17", resultDate: "2025-06-25" },
      { round: "2025년 3회", registrationStart: "2025-06-23", registrationEnd: "2025-06-26", examDate: "2025-07-26", resultDate: "2025-08-27" },
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
      { round: "2025년 1회", registrationStart: "2025-03-17", registrationEnd: "2025-03-20", examDate: "2025-04-19", resultDate: "2025-05-28" },
      { round: "2025년 2회", registrationStart: "2025-06-23", registrationEnd: "2025-06-26", examDate: "2025-07-19", resultDate: "2025-08-27" },
      { round: "2025년 3회", registrationStart: "2025-08-25", registrationEnd: "2025-08-28", examDate: "2025-09-27", resultDate: "2025-11-05" },
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
      { round: "2025년 11회", registrationStart: "2025-03-24", registrationEnd: "2025-03-28", examDate: "2025-04-26", resultDate: "2025-05-14" },
      { round: "2025년 12회", registrationStart: "2025-08-25", registrationEnd: "2025-08-29", examDate: "2025-09-27", resultDate: "2025-10-15" },
      { round: "2026년 12회", registrationStart: "2026-03-23", registrationEnd: "2026-03-27", examDate: "2026-04-25", resultDate: "2026-05-13" },
      { round: "2026년 13회", registrationStart: "2026-08-24", registrationEnd: "2026-08-28", examDate: "2026-09-26", resultDate: "2026-10-14" },
    ],
  },
  {
    id: "bigdata-practical",
    name: "빅데이터분석기사 실기",
    category: "IT",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [
      { round: "2025년 11회", registrationStart: "2025-05-19", registrationEnd: "2025-05-23", examDate: "2025-06-21", resultDate: "2025-07-09" },
      { round: "2025년 12회", registrationStart: "2025-10-20", registrationEnd: "2025-10-24", examDate: "2025-11-22", resultDate: "2025-12-10" },
      { round: "2026년 12회", registrationStart: "2026-05-18", registrationEnd: "2026-05-22", examDate: "2026-06-20", resultDate: "2026-07-08" },
      { round: "2026년 13회", registrationStart: "2026-10-19", registrationEnd: "2026-10-23", examDate: "2026-11-21", resultDate: "2026-12-09" },
    ],
  },
  {
    id: "cca1",
    name: "컴퓨터활용능력 1급",
    category: "IT",
    organization: "대한상공회의소",
    infoUrl: "https://license.korcham.net",
    schedules: [
      { round: "2025년 상반기", registrationStart: "2025-01-13", registrationEnd: "2025-01-17", examDate: "2025-02-08", resultDate: "2025-02-28" },
      { round: "2025년 2회", registrationStart: "2025-03-10", registrationEnd: "2025-03-14", examDate: "2025-04-05", resultDate: "2025-04-25" },
      { round: "2025년 3회", registrationStart: "2025-05-12", registrationEnd: "2025-05-16", examDate: "2025-06-07", resultDate: "2025-06-27" },
      { round: "2025년 4회", registrationStart: "2025-07-07", registrationEnd: "2025-07-11", examDate: "2025-08-02", resultDate: "2025-08-22" },
      { round: "2025년 5회", registrationStart: "2025-09-01", registrationEnd: "2025-09-05", examDate: "2025-09-27", resultDate: "2025-10-17" },
      { round: "2025년 6회", registrationStart: "2025-10-20", registrationEnd: "2025-10-24", examDate: "2025-11-15", resultDate: "2025-12-05" },
    ],
  },
  {
    id: "cca2",
    name: "컴퓨터활용능력 2급",
    category: "IT",
    organization: "대한상공회의소",
    infoUrl: "https://license.korcham.net",
    schedules: [
      { round: "2025년 1회", registrationStart: "2025-01-13", registrationEnd: "2025-01-17", examDate: "2025-02-08", resultDate: "2025-02-28" },
      { round: "2025년 2회", registrationStart: "2025-03-10", registrationEnd: "2025-03-14", examDate: "2025-04-05", resultDate: "2025-04-25" },
      { round: "2025년 3회", registrationStart: "2025-05-12", registrationEnd: "2025-05-16", examDate: "2025-06-07", resultDate: "2025-06-27" },
      { round: "2025년 4회", registrationStart: "2025-07-07", registrationEnd: "2025-07-11", examDate: "2025-08-02", resultDate: "2025-08-22" },
    ],
  },
  {
    id: "sqld",
    name: "SQLD",
    category: "IT/데이터",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [
      { round: "2025년 53회", registrationStart: "2025-03-10", registrationEnd: "2025-03-21", examDate: "2025-04-12", resultDate: "2025-05-02" },
      { round: "2025년 54회", registrationStart: "2025-06-09", registrationEnd: "2025-06-20", examDate: "2025-07-12", resultDate: "2025-08-01" },
      { round: "2025년 55회", registrationStart: "2025-09-08", registrationEnd: "2025-09-19", examDate: "2025-10-11", resultDate: "2025-10-31" },
      { round: "2025년 56회", registrationStart: "2025-11-10", registrationEnd: "2025-11-21", examDate: "2025-12-13", resultDate: "2026-01-09" },
      { round: "2026년 57회", registrationStart: "2026-03-09", registrationEnd: "2026-03-20", examDate: "2026-04-11", resultDate: "2026-05-08" },
      { round: "2026년 58회", registrationStart: "2026-06-08", registrationEnd: "2026-06-19", examDate: "2026-07-11", resultDate: "2026-07-31" },
      { round: "2026년 59회", registrationStart: "2026-09-07", registrationEnd: "2026-09-18", examDate: "2026-10-10", resultDate: "2026-10-30" },
      { round: "2026년 60회", registrationStart: "2026-11-09", registrationEnd: "2026-11-20", examDate: "2026-12-12", resultDate: "2027-01-08" },
    ],
  },
  {
    id: "sqlp",
    name: "SQLP",
    category: "IT/데이터",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [
      { round: "2025년 1회", registrationStart: "2025-01-06", registrationEnd: "2025-01-17", examDate: "2025-02-22", resultDate: "2025-03-21" },
      { round: "2025년 2회", registrationStart: "2025-05-12", registrationEnd: "2025-05-23", examDate: "2025-06-28", resultDate: "2025-07-25" },
      { round: "2025년 3회", registrationStart: "2025-09-01", registrationEnd: "2025-09-12", examDate: "2025-10-18", resultDate: "2025-11-14" },
    ],
  },
  {
    id: "adsp",
    name: "ADsP",
    category: "IT/데이터",
    organization: "한국데이터산업진흥원",
    infoUrl: "https://www.dataq.or.kr",
    schedules: [
      { round: "2025년 1회", registrationStart: "2025-01-13", registrationEnd: "2025-01-24", examDate: "2025-03-01", resultDate: "2025-03-28" },
      { round: "2025년 2회", registrationStart: "2025-04-07", registrationEnd: "2025-04-18", examDate: "2025-05-24", resultDate: "2025-06-20" },
      { round: "2025년 3회", registrationStart: "2025-07-07", registrationEnd: "2025-07-18", examDate: "2025-08-23", resultDate: "2025-09-19" },
      { round: "2025년 4회", registrationStart: "2025-10-06", registrationEnd: "2025-10-17", examDate: "2025-11-22", resultDate: "2025-12-19" },
      { round: "2026년 1회", registrationStart: "2026-01-12", registrationEnd: "2026-01-23", examDate: "2026-02-28", resultDate: "2026-03-27" },
      { round: "2026년 2회", registrationStart: "2026-04-06", registrationEnd: "2026-04-17", examDate: "2026-05-23", resultDate: "2026-06-19" },
      { round: "2026년 3회", registrationStart: "2026-07-06", registrationEnd: "2026-07-17", examDate: "2026-08-22", resultDate: "2026-09-18" },
      { round: "2026년 4회", registrationStart: "2026-10-05", registrationEnd: "2026-10-16", examDate: "2026-11-21", resultDate: "2026-12-18" },
    ],
  },
  {
    id: "toeic",
    name: "TOEIC",
    category: "어학",
    organization: "YBM",
    infoUrl: "https://www.toeic.co.kr",
    schedules: [
      { round: "2025년 1월", registrationStart: "2024-12-09", registrationEnd: "2024-12-13", examDate: "2025-01-12", resultDate: "2025-01-21" },
      { round: "2025년 2월", registrationStart: "2025-01-06", registrationEnd: "2025-01-10", examDate: "2025-02-16", resultDate: "2025-02-25" },
      { round: "2025년 3월", registrationStart: "2025-02-03", registrationEnd: "2025-02-07", examDate: "2025-03-23", resultDate: "2025-04-01" },
      { round: "2025년 4월", registrationStart: "2025-03-03", registrationEnd: "2025-03-07", examDate: "2025-04-13", resultDate: "2025-04-22" },
      { round: "2025년 5월", registrationStart: "2025-04-07", registrationEnd: "2025-04-11", examDate: "2025-05-18", resultDate: "2025-05-27" },
      { round: "2025년 6월", registrationStart: "2025-05-06", registrationEnd: "2025-05-09", examDate: "2025-06-22", resultDate: "2025-07-01" },
      { round: "2025년 7월", registrationStart: "2025-06-02", registrationEnd: "2025-06-05", examDate: "2025-07-13", resultDate: "2025-07-22" },
      { round: "2025년 8월", registrationStart: "2025-07-07", registrationEnd: "2025-07-11", examDate: "2025-08-17", resultDate: "2025-08-26" },
      { round: "2025년 9월", registrationStart: "2025-08-04", registrationEnd: "2025-08-08", examDate: "2025-09-14", resultDate: "2025-09-23" },
      { round: "2025년 10월", registrationStart: "2025-09-01", registrationEnd: "2025-09-05", examDate: "2025-10-12", resultDate: "2025-10-21" },
      { round: "2025년 11월", registrationStart: "2025-10-06", registrationEnd: "2025-10-10", examDate: "2025-11-16", resultDate: "2025-11-25" },
      { round: "2025년 12월", registrationStart: "2025-11-03", registrationEnd: "2025-11-07", examDate: "2025-12-14", resultDate: "2025-12-23" },
    ],
  },
  {
    id: "koreanhist",
    name: "한국사능력검정시험",
    category: "한국사",
    organization: "국사편찬위원회",
    infoUrl: "https://www.historyexam.go.kr",
    schedules: [
      { round: "2025년 68회", registrationStart: "2025-02-03", registrationEnd: "2025-02-14", examDate: "2025-03-22", resultDate: "2025-04-11" },
      { round: "2025년 69회", registrationStart: "2025-04-07", registrationEnd: "2025-04-18", examDate: "2025-05-17", resultDate: "2025-06-06" },
      { round: "2025년 70회", registrationStart: "2025-06-09", registrationEnd: "2025-06-20", examDate: "2025-07-19", resultDate: "2025-08-08" },
      { round: "2025년 71회", registrationStart: "2025-08-11", registrationEnd: "2025-08-22", examDate: "2025-09-27", resultDate: "2025-10-17" },
      { round: "2025년 72회", registrationStart: "2025-10-13", registrationEnd: "2025-10-24", examDate: "2025-11-22", resultDate: "2025-12-12" },
    ],
  },
  {
    id: "electric",
    name: "전기기사",
    category: "전기",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2025년 1회", registrationStart: "2025-01-06", registrationEnd: "2025-01-09", examDate: "2025-03-01", resultDate: "2025-03-26" },
      { round: "2025년 2회", registrationStart: "2025-04-14", registrationEnd: "2025-04-17", examDate: "2025-05-24", resultDate: "2025-06-25" },
      { round: "2025년 3회", registrationStart: "2025-06-23", registrationEnd: "2025-06-26", examDate: "2025-07-19", resultDate: "2025-08-27" },
    ],
  },
  {
    id: "safety",
    name: "산업안전기사",
    category: "안전",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2025년 1회", registrationStart: "2025-01-06", registrationEnd: "2025-01-09", examDate: "2025-03-01", resultDate: "2025-03-26" },
      { round: "2025년 2회", registrationStart: "2025-04-14", registrationEnd: "2025-04-17", examDate: "2025-05-24", resultDate: "2025-06-25" },
      { round: "2025년 3회", registrationStart: "2025-06-23", registrationEnd: "2025-06-26", examDate: "2025-07-19", resultDate: "2025-08-27" },
    ],
  },
  {
    id: "civil9",
    name: "공무원 9급 (국가직)",
    category: "공무원",
    organization: "인사혁신처",
    infoUrl: "https://www.gosi.kr",
    schedules: [
      { round: "2025년", registrationStart: "2025-01-20", registrationEnd: "2025-01-23", examDate: "2025-04-05", resultDate: "2025-06-04" },
    ],
  },
  {
    id: "civil7",
    name: "공무원 7급 (국가직)",
    category: "공무원",
    organization: "인사혁신처",
    infoUrl: "https://www.gosi.kr",
    schedules: [
      { round: "2025년 1차 (PSAT)", registrationStart: "2025-01-20", registrationEnd: "2025-01-23", examDate: "2025-02-22", resultDate: "2025-03-14" },
      { round: "2025년 2차 (전공)", registrationStart: "2025-01-20", registrationEnd: "2025-01-23", examDate: "2025-07-12", resultDate: "2025-09-12" },
    ],
  },
  {
    id: "cpa",
    name: "공인회계사 (CPA)",
    category: "회계/금융",
    organization: "금융감독원",
    infoUrl: "https://cpa.fss.or.kr",
    schedules: [
      { round: "2025년 1차", registrationStart: "2025-01-02", registrationEnd: "2025-01-10", examDate: "2025-02-22", resultDate: "2025-04-11" },
      { round: "2025년 2차", registrationStart: "2025-04-28", registrationEnd: "2025-05-02", examDate: "2025-06-28", resultDate: "2025-09-05" },
    ],
  },
  {
    id: "aicpa",
    name: "세무사",
    category: "회계/금융",
    organization: "한국세무사회",
    infoUrl: "https://www.kacpta.or.kr",
    schedules: [
      { round: "2025년 1차", registrationStart: "2025-01-13", registrationEnd: "2025-01-17", examDate: "2025-03-01", resultDate: "2025-04-18" },
      { round: "2025년 2차", registrationStart: "2025-05-26", registrationEnd: "2025-05-30", examDate: "2025-07-26", resultDate: "2025-11-07" },
    ],
  },
  {
    id: "iaim",
    name: "투자자산운용사",
    category: "회계/금융",
    organization: "한국금융투자협회 (KOFIA)",
    infoUrl: "https://license.kofia.or.kr",
    schedules: [
      { round: "2025년 1회", registrationStart: "2025-01-06", registrationEnd: "2025-01-10", examDate: "2025-02-15", resultDate: "2025-03-07" },
      { round: "2025년 2회", registrationStart: "2025-04-07", registrationEnd: "2025-04-11", examDate: "2025-05-17", resultDate: "2025-06-06" },
      { round: "2025년 3회", registrationStart: "2025-09-08", registrationEnd: "2025-09-12", examDate: "2025-10-18", resultDate: "2025-11-07" },
      { round: "2026년 1회", registrationStart: "2026-01-05", registrationEnd: "2026-01-09", examDate: "2026-02-14", resultDate: "2026-03-06" },
      { round: "2026년 2회", registrationStart: "2026-04-06", registrationEnd: "2026-04-10", examDate: "2026-05-16", resultDate: "2026-06-05" },
      { round: "2026년 3회", registrationStart: "2026-09-07", registrationEnd: "2026-09-11", examDate: "2026-10-17", resultDate: "2026-11-06" },
    ],
  },
  {
    id: "ssa2",
    name: "사회조사분석사 2급",
    category: "사회/통계",
    organization: "한국산업인력공단 (큐넷)",
    infoUrl: "https://www.q-net.or.kr",
    schedules: [
      { round: "2025년 1회 필기", registrationStart: "2025-01-06", registrationEnd: "2025-01-09", examDate: "2025-02-08", resultDate: "2025-03-05" },
      { round: "2025년 1회 실기", registrationStart: "2025-03-24", registrationEnd: "2025-03-27", examDate: "2025-04-19", resultDate: "2025-05-28" },
      { round: "2025년 2회 필기", registrationStart: "2025-06-23", registrationEnd: "2025-06-26", examDate: "2025-07-19", resultDate: "2025-08-13" },
      { round: "2025년 2회 실기", registrationStart: "2025-08-25", registrationEnd: "2025-08-28", examDate: "2025-09-27", resultDate: "2025-11-05" },
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
    schedules: [
      { round: "상시 응시 가능", registrationStart: "2025-01-01", registrationEnd: "2025-12-31", examDate: "2025-12-31", resultDate: "2025-12-31" },
    ],
  },
  {
    id: "gtq",
    name: "GTQ (그래픽기술자격)",
    category: "디자인",
    organization: "한국생산성본부",
    infoUrl: "https://www.kpc.or.kr",
    schedules: [
      { round: "2025년 1회", registrationStart: "2025-01-13", registrationEnd: "2025-01-17", examDate: "2025-02-08", resultDate: "2025-02-28" },
      { round: "2025년 2회", registrationStart: "2025-03-17", registrationEnd: "2025-03-21", examDate: "2025-04-12", resultDate: "2025-05-02" },
      { round: "2025년 3회", registrationStart: "2025-05-12", registrationEnd: "2025-05-16", examDate: "2025-06-14", resultDate: "2025-07-04" },
      { round: "2025년 4회", registrationStart: "2025-07-14", registrationEnd: "2025-07-18", examDate: "2025-08-09", resultDate: "2025-08-29" },
      { round: "2025년 5회", registrationStart: "2025-09-15", registrationEnd: "2025-09-19", examDate: "2025-10-11", resultDate: "2025-10-31" },
      { round: "2025년 6회", registrationStart: "2025-11-03", registrationEnd: "2025-11-07", examDate: "2025-12-06", resultDate: "2025-12-26" },
    ],
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
