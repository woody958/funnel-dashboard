# 퍼널별 미션 & KPI 대시보드 — 설계 명세서

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| State | React Context + localStorage |
| Deployment | Vercel |

---

## 2. TypeScript 데이터 타입

```ts
// 드롭다운 옵션 단위
interface DropdownOption {
  id: string;     // 고유 식별자
  label: string;  // 표시 텍스트
  color: string;  // HEX 색상 (#RRGGBB)
}

// 4개 카테고리 드롭다운 옵션 집합
interface DashboardOptions {
  importance: DropdownOption[];  // 중요도
  status:     DropdownOption[];  // 진행 상태
  assignees:  DropdownOption[];  // 담당자
  funnels:    DropdownOption[];  // 퍼널
}

// 업무(Task) 단일 레코드
interface Task {
  id:          string;  // 자동 생성 UUID-like
  content:     string;  // 업무 내용
  importanceId: string; // → DashboardOptions.importance[].id
  statusId:    string;  // → DashboardOptions.status[].id
  assigneeId:  string;  // → DashboardOptions.assignees[].id
  comment:     string;  // 관련 코멘트
  startDate:   string;  // ISO date (YYYY-MM-DD)
  dueDate:     string;  // ISO date
  funnelId:    string;  // → DashboardOptions.funnels[].id
  createdAt:   string;  // ISO date
}

// Gantt 그룹핑 기준
type GanttGroupBy = 'importance' | 'assignee' | 'funnel';

// Todo 아이템
interface TodoItem {
  id:           string;
  text:         string;
  completed:    boolean;
  priority:     'high' | 'medium' | 'low';
  relatedStage: string;
}
```

---

## 3. 컴포넌트 계층 구조

```
app/page.tsx
└── DashboardProvider (context/DashboardContext.tsx)
    └── Dashboard (components/Dashboard.tsx)
        ├── Header (탭 전환 + 설정 버튼)
        ├── DataTab (components/data-tab/DataTab.tsx)
        │   ├── KPICards          — 종합 KPI 요약 카드 6개
        │   ├── FunnelChart       — 퍼널 단계별 바 차트 (CSS)
        │   ├── BottleneckAnalysis — 병목 구간 분석 카드 목록
        │   └── TodoList          — 개선 To-Do (추가/완료/삭제)
        ├── MissionTab (components/mission-tab/MissionTab.tsx)
        │   ├── TaskReport        — 업무 CRUD 테이블
        │   ├── GanttChart        — CSS 기반 타임라인 (그룹핑 필터)
        │   └── KanbanBoard       — @dnd-kit 드래그 & 드롭 칸반
        └── SettingsModal         — 드롭다운 옵션 관리 모달
```

---

## 4. 상태 관리 설계

### DashboardContext (context/DashboardContext.tsx)

| 상태 | 타입 | 설명 |
|------|------|------|
| `options` | `DashboardOptions` | 4개 카테고리 드롭다운 옵션 |
| `tasks` | `Task[]` | 전체 업무 목록 |
| `todos` | `TodoItem[]` | 병목 개선 To-Do |

### 제공 함수

| 함수 | 동작 |
|------|------|
| `addTask(task)` | 새 업무 추가 (id/createdAt 자동 생성) |
| `updateTask(id, updates)` | 부분 업데이트 |
| `deleteTask(id)` | 삭제 |
| `addOption(category, label, color)` | 드롭다운 항목 추가 |
| `updateOption(category, id, label, color)` | 드롭다운 항목 수정 |
| `deleteOption(category, id)` | 드롭다운 항목 삭제 |
| `addTodo / toggleTodo / deleteTodo` | To-Do CRUD |

### 영속성
- 모든 상태는 `localStorage`에 JSON 직렬화하여 저장
- SSR 안전: `useEffect + hydrated` 플래그로 클라이언트에서만 load/save

---

## 5. 핵심 기능 동작 원리

### Kanban ↔ TaskReport 실시간 동기화
- 공유 Context의 `tasks` 배열을 단일 진실 소스(Single Source of Truth)로 사용
- Kanban에서 카드를 다른 컬럼으로 드래그 → `DragOverEvent`에서 `updateTask({ statusId: newCol })` 즉시 호출
- TaskReport는 동일 Context를 구독하므로 자동 반영

### Gantt Chart 렌더링
```
timelineStart = today - 30일
timelineEnd   = today + 90일
totalDays     = 121일
DAY_WIDTH     = 28px
totalWidth    = 121 × 28 = 3388px (가로 스크롤)

task.barLeft  = daysBetween(timelineStart, task.startDate) × DAY_WIDTH
task.barWidth = daysBetween(task.startDate, task.dueDate)  × DAY_WIDTH
```

### Kanban DnD (@dnd-kit)
```
DndContext
├── sensors: PointerSensor (drag threshold 5px)
├── collision: closestCorners
├── onDragOver → 다른 컬럼으로 이동 시 updateTask(statusId) 즉시 호출
└── DragOverlay → 드래그 중 카드 고스트 렌더

SortableContext (per column)
└── useSortable hook per card
```

---

## 6. Mock 데이터 구성

### 기본 드롭다운 옵션
| 카테고리 | 기본값 |
|----------|--------|
| 중요도 | 높음(빨강), 중간(노랑), 낮음(초록) |
| 진행 상태 | 대기(회색), 진행중(파랑), 완료(초록), 보류(주황) |
| 담당자 | 김민준, 이서연, 박지호, 최유진, 정다은 |
| 퍼널 | Top-Funnel, Mid-Funnel, Bottom-Funnel |

### 샘플 업무 (12건)
- 다양한 상태/담당자/퍼널/중요도 조합
- 시작일/마감일이 현재 날짜 기준 -40일 ~ +50일로 분산
- Gantt, Kanban 양쪽에서 즉시 시각화 가능

### KPI 데이터 (데이터 탭)
| 지표 | 값 |
|------|-----|
| 누적 유입 | 128,540명 (+12.3%) |
| 최종 전환율 | 3.2% (+0.4%p) |
| CAC | ₩24,500 (-8.2%) |
| ROAS | 320% (+15.5%) |
| 신규 가입자 | 8,420명 (+5.7%) |
| 평균 주문금액 | ₩67,800 (+3.1%) |

---

## 7. 폴더 구조

```
funnel-dashboard/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx
│   ├── SettingsModal.tsx
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── FormField.tsx     (Input, Textarea, Select, Button)
│   ├── data-tab/
│   │   ├── DataTab.tsx
│   │   ├── KPICards.tsx
│   │   ├── FunnelChart.tsx
│   │   ├── BottleneckAnalysis.tsx
│   │   └── TodoList.tsx
│   └── mission-tab/
│       ├── MissionTab.tsx
│       ├── TaskReport.tsx
│       ├── GanttChart.tsx
│       └── KanbanBoard.tsx
├── context/
│   └── DashboardContext.tsx
├── lib/
│   ├── types.ts
│   ├── mockData.ts
│   └── utils.ts
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── dashboard_spec.md
```

---

## 8. GitHub → Vercel 배포 가이드

### Step 1: 의존성 설치 및 로컬 테스트
```bash
cd funnel-dashboard
npm install
npm run dev
# http://localhost:3000 에서 확인
```

### Step 2: GitHub 업로드
```bash
git init
git add .
git commit -m "feat: 퍼널 미션 KPI 대시보드 초기 구현"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Step 3: Vercel 연동
1. https://vercel.com → New Project
2. GitHub 저장소 Import
3. Framework: **Next.js** (자동 감지)
4. Build Command: `next build` (기본값)
5. Deploy 클릭

### 환경 변수
현재 버전은 외부 API 없이 localStorage + Mock Data로 동작하므로 별도 환경 변수 불필요.

---

## 9. 기능 검증 체크리스트

- [ ] **데이터 탭**: KPI 카드 6개 표시, 퍼널 차트 단계별 이탈율 계산 정확
- [ ] **병목 분석**: 4개 이슈 카드, impact 뱃지 색상 구분
- [ ] **To-Do**: 추가/완료 체크/삭제 동작, 진행률 바 업데이트
- [ ] **업무 리포트**: 추가/수정/삭제 모달, 검색·필터 동작
- [ ] **Gantt Chart**: 3가지 그룹핑 전환, 오늘 마커, 바 위치 정확
- [ ] **Kanban**: 드래그 앤 드롭으로 컬럼 이동 → 업무 리포트 즉시 반영
- [ ] **칸반 상세 모달**: 클릭 시 모든 필드 표시 및 편집 저장
- [ ] **설정 모달**: 4가지 카테고리 옵션 추가/수정/삭제, 드롭다운 즉시 반영
- [ ] **localStorage**: 새로고침 후 데이터 유지
