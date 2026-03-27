# 스터디 플래너 - 남은 작업 계획

## ✅ 완료된 작업
- [x] 대시보드 기본 레이아웃 (비전보드 / 오늘할일 / 위클리플래너 / 목표패널 / 년간플래너)
- [x] OpenAI gpt-4o 연동 - 에빙하우스 복습주기 + ADHD 포모도로 플랜 생성
- [x] 비전보드 - 편집 가능한 텍스트 + 배경 이미지 업로드 (localStorage 저장)
- [x] 요일 선택기 - 월~토 토글, 일요일 고정 피드백의 날
- [x] 시험명 자동완성 - 15개+ 한국 자격증 DB (접수일/시험일/발표일 자동입력)
- [x] 위클리 플래너 - 월~일 가로 레이아웃, 세션 색상 코딩
- [x] 년간 플래너 - 12개월 타임라인, D-Day 카운트다운
- [x] 시험 일정 검색 (오늘할일 아래 배치) → 년간 플래너 연동, localStorage 저장
- [x] 취업준비 페이지 (/job) - 13개 취업사이트 + 커스텀 링크 관리
- [x] Google Sheets 저장/불러오기 API 라우트 구현 (환경변수 설정 필요)
- [x] 플랜 생성 시 Sheets 자동 저장 + 앱 시작 시 Sheets에서 불러오기

---

## 🔧 남은 작업

### 1순위 - Google Sheets 연결 (환경변수 설정)
- [ ] 사용자가 `.env.local`에 아래 3개 환경변수 추가 필요:
  ```
  GOOGLE_SERVICE_ACCOUNT_EMAIL=...
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  GOOGLE_SHEETS_SPREADSHEET_ID=...
  ```
- [ ] Vercel 대시보드에도 동일 환경변수 추가 후 재배포
- [ ] 연결 완료 시: 플랜, 비전텍스트가 Sheets에 저장되어 기기/브라우저 관계없이 유지

### 2순위 - 오늘 할일 체크박스 영구 저장
- [ ] 현재 체크박스 상태(completed)는 새로고침 시 초기화됨
- [ ] localStorage 또는 Sheets에 체크 상태 저장 필요
- [ ] `TodayTasks.tsx`의 toggle 함수에 저장 로직 추가

### 3순위 - 시험 DB 업데이트 (2026년 일정)
- [ ] `data/exams.ts`의 스케줄이 2025년 기준
- [ ] 2026년 시험 일정 추가 필요 (정보처리기사, 컴활, SQLD 등)
- [ ] 시험별 공식 사이트에서 확인 후 업데이트

### 4순위 - 진행률(progressPercent) 실제 계산
- [ ] 현재 AI가 항상 0%로 반환
- [ ] 플랜 생성일 기준 오늘까지 경과 비율을 자동 계산하여 표시
- [ ] `GoalPanel`의 progress ring에 실제 값 반영

### 5순위 - 모바일 반응형 개선
- [ ] 위클리 플래너가 모바일에서 가로 스크롤 필요
- [ ] 비전보드 모바일에서 스탯 카드 레이아웃 조정
- [ ] 전체적인 모바일 UX 점검

### 6순위 - 플랜 히스토리
- [ ] 이전에 생성한 플랜 목록 보기 기능
- [ ] Sheets에 여러 플랜 저장 (현재는 1개만 덮어씀)
- [ ] 이전 플랜으로 되돌리기

---

## 🗂️ 주요 파일 구조
```
app/
  page.tsx              # 메인 대시보드
  api/
    generate-plan/      # OpenAI 플랜 생성
    save-plan/          # Google Sheets 저장
    load-plan/          # Google Sheets 불러오기
  job/page.tsx          # 취업준비 페이지

components/
  VisionBoard.tsx       # 상단 비전보드
  TodayTasks.tsx        # 오늘 할일
  WeeklyPlanner.tsx     # 위클리 플래너
  GoalPanel.tsx         # 목표 입력 패널
  YearlyPlanner.tsx     # 년간 플래너
  ExamSearch.tsx        # 시험 일정 검색

data/
  exams.ts              # 자격증 시험 DB
lib/
  sheets.ts             # Google Sheets 클라이언트
types/
  plan.ts               # TypeScript 타입 정의
```
