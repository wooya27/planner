# 스터디 플래너 - 작업 계획

## ✅ 완료된 작업

### 기본 기능
- [x] 대시보드 기본 레이아웃 (비전보드 / 오늘할일 / 위클리플래너 / 목표패널 / 년간플래너)
- [x] OpenAI gpt-4o 연동 - 에빙하우스 복습주기 + 포모도로 플랜 생성
- [x] 비전보드 - 편집 가능한 텍스트 + 배경 이미지 업로드
- [x] 위클리 플래너 - 월~일 레이아웃, 세션 색상 코딩
- [x] 년간 플래너 - 12개월 타임라인, D-Day 카운트다운
- [x] 취업준비 페이지 (/job)
- [x] Google Sheets 저장/불러오기 연동
- [x] 자격증 공부 모드 - 4주 로드맵

### 시험 일정
- [x] 시험 DB 2025년 → 2026년 전면 교체
- [x] SQLD 회차 수정 (57~60회 → 60~63회, 날짜 전면 수정)
- [x] ADsP 회차 수정 (1~4회 → 48~51회, 날짜 전면 수정)
- [x] 빅데이터분석기사 필기/실기 날짜 수정
- [x] 정보처리기사 필기 합격발표일 수정 (14일씩 앞당김)
- [x] 투자자산운용사 44회 추가 (1월), 45~47회 구조 변경
- [x] TESAT(테셋) 신규 추가 (103~110회, 2026년 전체)

### 동기화 & UI
- [x] 시험검색 수동저장 → 추가/삭제 즉시 자동저장
- [x] 비전 텍스트 plan 없어도 Sheets 자동저장
- [x] 년간 플래너 접수일 색상 개선 (text-orange-100, 더 밝게)
- [x] 위클리 플래너 - 이번 주 시험 접수 시작일 요일 카드에 자동 표시
- [x] 오늘 할일 - 접수 기간 중 자동으로 접수 알림 표시

---

## 🔴 1순위 - 배포 환경변수 설정 (사용자 직접)

다른 기기에서 데이터가 안 보이는 근본 원인.

**Vercel → Settings → Environment Variables 에 추가 후 Redeploy:**
```
OPENAI_API_KEY=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=...
```

---

## 🟠 2순위 - 시험 DB 미확인 항목

아래 시험들은 공식 일정 미확인으로 현재 `schedules: []` 상태:

| 시험명 | 확인 필요 |
|---|---|
| 컴퓨터활용능력 1·2급 | 2026년 일정 |
| TOEIC | 2026년 월별 일정 |
| 한국사능력검정시험 | 2026년 68~72회 |
| 전기기사 | 2026년 1~3회 |
| 산업안전기사 | 2026년 1~3회 |
| 공무원 9급·7급 (국가직) | 2026년 일정 |
| 공인회계사 (CPA) | 2026년 1·2차 |
| 세무사 | 2026년 1·2차 |
| SQLP | 2026년 일정 |

또한 **정보처리기사 실기** 접수일·시험일 소스 간 충돌 (pismaker vs rollingseed), q-net 직접 확인 필요.

---

## 🟡 3순위 - 오늘 할일 체크박스 영구 저장

- 현재: 새로고침 시 체크 상태 초기화
- 수정: `TodayTasks.tsx`의 toggle 함수에서 Sheets "오늘할일" 시트 완료 여부 업데이트
- 관련 파일: `components/TodayTasks.tsx`, `app/api/save-plan/route.ts`

---

## 🟡 4순위 - 진행률(%) 실제 계산

- 현재: AI가 항상 0% 반환
- 수정: 플랜 생성일 기준 오늘까지 경과 비율 자동 계산
- 관련 파일: `components/GoalPanel.tsx`

---

## 🟢 5순위 - 모바일 반응형 개선

- 위클리 플래너 모바일 가로 스크롤
- 비전보드 스탯 카드 모바일 레이아웃 조정

---

## 🟢 6순위 - 플랜 히스토리

- 이전 플랜 목록 보기
- Sheets에 여러 플랜 저장 (현재 1개만 덮어씀)

---

## 🗂️ 주요 파일 구조
```
app/
  page.tsx                # 메인 대시보드
  yearly/page.tsx         # 년간 플래너 페이지
  job/page.tsx            # 취업준비 페이지
  api/
    generate-plan/        # OpenAI 플랜 생성
    save-plan/            # Sheets 저장 (plan null이어도 visionText 저장 가능)
    load-plan/            # Sheets 불러오기
    roadmap/              # 4주 로드맵
    exam-search/          # 시험검색 목록 자동저장

components/
  VisionBoard.tsx         # 비전보드 (텍스트 변경 시 자동저장)
  TodayTasks.tsx          # 오늘 할일 + 접수 기간 알림
  WeeklyPlanner.tsx       # 위클리 플래너 + 이번 주 접수 시작일 표시
  GoalPanel.tsx           # 목표 입력 패널
  YearlyPlanner.tsx       # 년간 플래너 (접수/시험/발표 색상 구분)
  ExamSearch.tsx          # 시험 일정 검색 (추가 즉시 자동저장)

data/
  exams.ts                # 자격증 시험 DB (2026년 기준)
lib/
  sheets.ts               # Google Sheets 클라이언트
types/
  plan.ts                 # TypeScript 타입 정의
```
