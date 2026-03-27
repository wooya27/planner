import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { PlanRequest, StudyPlan } from "@/types/plan";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const today = new Date().toISOString().split("T")[0];

const SYSTEM_PROMPT = `당신은 ADHD 학습자를 위한 전문 스터디 플래너입니다.
에빙하우스 망각곡선과 간격 반복(Spaced Repetition) 원리를 완벽하게 적용한 학습 계획을 세워주세요.

【에빙하우스 망각곡선 기반 복습 주기】
- 1차 복습: 학습 후 1일 (기억 58% → 복습 후 90%+)
- 2차 복습: 학습 후 3일 (기억 40% → 복습 후 85%+)
- 3차 복습: 학습 후 7일 (기억 28% → 복습 후 80%+)
- 4차 복습: 학습 후 14일 (기억 20% → 복습 후 90%+)
- 5차 복습: 학습 후 30일 (장기기억 완전 정착)

【ADHD 최적화 원칙】
- 25분 집중 + 5분 휴식 (포모도로 기법)
- 하루 세션을 2-3개로 분산 (한 번에 너무 길지 않게)
- 각 세션에 명확한 목표 부여
- 복습 세션은 반드시 이전 학습 내용과 연계

반드시 다음 JSON 스키마를 정확하게 따르는 응답을 반환하세요. JSON 외의 텍스트는 절대 포함하지 마세요.

{
  "goalInfo": {
    "title": "목표명(구체적으로)",
    "totalHours": 숫자,
    "dailyHours": 숫자,
    "estimatedWeeks": 숫자,
    "estimatedEndDate": "YYYY-MM-DD",
    "progressPercent": 0,
    "subjects": ["세부과목1", "세부과목2", "세부과목3"],
    "difficulty": "초급|중급|고급"
  },
  "todayTasks": [
    {
      "id": "t1",
      "title": "구체적인 오늘 할 일 (무엇을 몇 페이지까지)",
      "duration": 분(숫자),
      "completed": false,
      "type": "study|review|practice",
      "subject": "과목명"
    }
  ],
  "weeklyPlan": {
    "weekNumber": 1,
    "theme": "1주차: 기초 개념 정립 (구체적 테마)",
    "days": [
      {
        "day": "Monday",
        "dayKr": "월요일",
        "sessions": [
          {
            "topic": "세부 주제",
            "duration": 분(숫자),
            "type": "study|review|practice|rest",
            "description": "구체적인 학습 내용 (예: 1장~3장, OX 문제 50개)"
          }
        ],
        "totalMinutes": 숫자
      }
    ]
  },
  "yearlyEvents": [
    {
      "id": "e1",
      "month": 월(숫자1-12),
      "day": 일(숫자),
      "title": "이벤트명",
      "type": "registration|exam|milestone|review",
      "description": "상세 설명",
      "dDay": 오늘로부터일수(숫자)
    }
  ],
  "studyTips": [
    "ADHD에 맞는 구체적인 학습 팁 1",
    "ADHD에 맞는 구체적인 학습 팁 2",
    "ADHD에 맞는 구체적인 학습 팁 3"
  ]
}

규칙:
- todayTasks: 오늘 당장 시작할 3-5개의 매우 구체적인 과제 (모호하면 안됨)
- weeklyPlan.days: 반드시 7일 모두 포함 (Monday~Sunday), 복습 세션 필수 배치
- 1일차 학습 내용은 2일차에 1차 복습, 4일차에 2차 복습으로 배치
- yearlyEvents: 최소 8개 이상, 자격증이면 접수기간(registration), 시험일(exam) 반드시 포함
- 오늘 날짜: ${today}`;

export async function POST(req: NextRequest) {
  try {
    const body: PlanRequest = await req.json();

    const userMessage = `목표: ${body.goal}
총 필요 학습 시간: ${body.totalHours}시간
하루 투자 가능 시간: ${body.dailyHours}시간/일
${body.targetExamDate ? `목표 시험일: ${body.targetExamDate}` : ""}
오늘 날짜: ${today}

에빙하우스 복습 주기를 위클리 플래너에 반드시 반영해서 완전한 스터디 플랜 JSON을 작성해주세요.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 4000,
    });

    const text = response.choices[0]?.message?.content ?? "";
    if (!text) throw new Error("응답이 비어있습니다");

    const plan: StudyPlan = JSON.parse(text);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { error: "플랜 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
