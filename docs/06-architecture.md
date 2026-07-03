# Phase 6 — 아키텍처 (Architecture)

## 기술 스택 확정

### 선택된 스택

| 영역 | 선택 | 버전 | 이유 |
|------|------|------|------|
| **프레임워크** | Next.js | 14+ | 풀스택 프레임워크, 빠른 API 라우트, 자동 최적화 |
| **언어** | TypeScript | 5.0+ | 타입 안정성, 개발 경험 향상 |
| **스타일** | Tailwind CSS | 3.0+ | 빠른 스타일링, 반응형 유틸리티 |
| **패키지 매니저** | npm | 9.0+ | 표준, 의존성 관리 |
| **데이터베이스** | Supabase | (PostgreSQL) | 오픈소스, 실시간 동기화, JWT 인증 지원 |
| **클라이언트 라이브러리** | @supabase/supabase-js | 2.0+ | Supabase 공식 클라이언트 |
| **상태 관리** | React Hooks + SWR | 2.0+ | 간단함, 데이터 동기화 자동화 |

### 비채택 사항과 이유

| 기술 | 이유 |
|------|------|
| Redux | 상태 복잡도가 낮아 오버킬, SWR로 충분 |
| Firebase | Supabase가 더 투명하고 비용 효율적 |
| Vite | Next.js 자체 빌드 체인이 최적화됨 |
| styled-components | Tailwind가 더 빠르고 번들 크기 작음 |
| localStorage | Supabase로 실시간 동기화 가능 |

---

## 프로젝트 폴더 구조

```
todo/
├── docs/                           # 기획 문서
│   ├── 01-requirements.md
│   ├── 02-personas.md
│   ├── 03-scenarios.md
│   ├── 04-engagement.md
│   ├── 05-design.md
│   └── 06-architecture.md
├── mockups/                        # 디자인 목업
│   └── index.html
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # 메인 페이지
│   ├── globals.css                 # 글로벌 스타일
│   └── api/                        # API 라우트 (필요시 v2)
│       └── todos/
│           ├── route.ts            # GET, POST /api/todos
│           └── [id]/
│               └── route.ts        # PATCH, DELETE /api/todos/[id]
├── src/
│   ├── components/                 # 재사용 컴포넌트
│   │   ├── Header.tsx
│   │   ├── StreakBox.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoForm.tsx
│   │   ├── TabButtons.tsx
│   │   └── CompletedAnimation.tsx
│   ├── hooks/                      # 커스텀 훅
│   │   ├── useTodos.ts
│   │   ├── useStreak.ts
│   │   ├── useTimeMode.ts
│   │   └── useSupabase.ts          # Supabase 클라이언트
│   ├── types/                      # TypeScript 타입
│   │   └── index.ts
│   ├── utils/                      # 유틸리티 함수
│   │   ├── supabase.ts             # Supabase 클라이언트 초기화
│   │   ├── date.ts
│   │   └── formatting.ts
│   └── lib/
│       └── supabase-schema.sql     # Supabase 테이블 스키마
├── public/                         # 정적 파일
│   └── favicon.ico
├── .env.local.example              # 환경 변수 예제
├── .env.local                      # 환경 변수 (git 무시)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 데이터 모델 (TypeScript)

### 타입 정의 (`src/types/index.ts`)

```typescript
// 할일 항목 타입
export type TodoPriority = 'high' | 'medium' | 'low';
export type Recurrence = null | 'daily' | 'weekly' | 'monthly';

export interface Todo {
  id: string;                    // UUID
  title: string;                 // 제목 (필수)
  description?: string;          // 설명 (선택)
  completed: boolean;            // 완료 여부
  priority: TodoPriority;        // 우선순위
  dueDate?: Date | null;         // 마감일 (선택)
  tags: string[];                // 태그 배열
  recurrence: Recurrence;        // 반복 주기
  createdAt: Date;               // 생성 날짜
  completedAt?: Date | null;     // 완료 날짜
  isArchived: boolean;           // 보관 여부
}

export interface AppState {
  todos: Todo[];
  streakCount: number;           // E1: 스트릭 카운트
  lastCompletedDate: Date | null; // 마지막 완료 날짜
  todayCompletedCount: number;   // E2: 오늘 완료 개수
  timeMode: 'morning' | 'afternoon' | 'evening'; // E9: 시간 모드
}
```

### 초기 상태

```typescript
const initialState: AppState = {
  todos: [],
  streakCount: 0,
  lastCompletedDate: null,
  todayCompletedCount: 0,
  timeMode: 'morning',
};
```

---

## Supabase 테이블 스키마

### todos 테이블

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(10) DEFAULT 'medium', -- 'high', 'medium', 'low'
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  recurrence VARCHAR(20), -- 'daily', 'weekly', 'monthly', null
  recurrence_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 마감일 기준 인덱싱 (쿼리 성능)
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_completed ON todos(completed);
```

### 환경 변수 (.env.local)

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase는 public/anon key를 NEXT_PUBLIC_로 노출해도 안전함
# (RLS 보안 규칙으로 보호됨)
```

---

## 커스텀 훅 시그니처

### useTodos (할일 관리 - Supabase)

```typescript
export function useTodos() {
  // SWR로 Supabase에서 자동 동기화
  const { data: todos, mutate, isLoading, error } = useSWR(
    '/api/todos',
    fetcher
  );

  return {
    todos,
    isLoading,
    error,
    addTodo: async (title: string, priority?: TodoPriority) => void,
    updateTodo: async (id: string, updates: Partial<Todo>) => void,
    deleteTodo: async (id: string) => void,
    toggleTodo: async (id: string) => void,
    getTodayTodos: () => Todo[],
    getCompletedTodos: () => Todo[],
    mutate, // 수동 동기화 트리거
  };
}
```

### useStreak (스트릭 관리 - E1)

```typescript
export function useStreak() {
  const { todos } = useTodos();

  return {
    streakCount: calculateStreak(todos),
    lastCompletedDate: getLastCompletedDate(todos),
    // 로컬 계산만 수행 (DB 저장 불필요, 데이터 기반 계산)
  };
}
```

### useTimeMode (시간 모드 - E9)

```typescript
export function useTimeMode() {
  const [mode, setMode] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const updateMode = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) setMode('morning');
      else if (hour >= 12 && hour < 18) setMode('afternoon');
      else setMode('evening');
    };

    updateMode();
    const interval = setInterval(updateMode, 60000); // 1분마다 확인
    return () => clearInterval(interval);
  }, []);

  return { timeMode: mode };
}
```

### useSupabase (Supabase 클라이언트)

```typescript
export function useSupabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return {
    supabase,
    fetchTodos: async () => Todo[],
    addTodo: async (todo: Partial<Todo>) => Todo,
    updateTodo: async (id: string, updates: Partial<Todo>) => Todo,
    deleteTodo: async (id: string) => void,
  };
}
```

---

## 상태 흐름 다이어그램 (Supabase 기반)

```
┌──────────────────────────────────────────────────────────┐
│              page.tsx (Next.js 페이지)                    │
│                                                            │
│  const { todos, mutate } = useTodos()  (SWR로 동기화)   │
│  const { timeMode } = useTimeMode()                      │
└──────────┬───────────────────────────────────────────────┘
           │
           ├─────────────┬───────────────┬──────────────┐
           │             │               │              │
           ▼             ▼               ▼              ▼
      ┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
      │ Header │  │StreakBox │  │ProgressBar │ TabButtons
      │        │  │ (E1)     │  │  (E2)     │  │
      └────────┘  └──────────┘  └──────────┘  └──────────┘
           
           ▼
      ┌──────────────────────────────────────┐
      │  TodoList (timeMode 기반, SWR)       │
      │  (E9: 아침/오후/저녁 모드 표시)      │
      │                                      │
      │  ├─ TodoItem (높음 우선순위)         │
      │  │  ├─ Checkbox [E7: 애니메이션]    │
      │  │  ├─ Title                        │
      │  │  └─ Meta (마감일)                 │
      │  │                                  │
      │  ├─ TodoItem (중간)                 │
      │  └─ TodoItem (낮음)                 │
      │                                      │
      │  + CompletedAnimation [E7: 이모지]  │
      └──────────────────────────────────────┘
           │
           ▼
      ┌──────────────────────────────────────┐
      │  TodoForm (새 할일 추가)              │
      │  (Supabase 저장)                     │
      │                                      │
      │  ├─ 빠른 입력 모드 (제목만)          │
      │  └─ 상세 입력 모드 (확장)            │
      │     ├─ 설명                         │
      │     ├─ 마감일                       │
      │     ├─ 우선순위                     │
      │     └─ 태그                         │
      └──────────────────────────────────────┘
           │
           ▼
      ┌──────────────────────────────────────┐
      │  POST /api/todos (Next.js API)       │
      │                                      │
      │  ├─ Supabase INSERT 실행             │
      │  └─ SWR mutate 트리거 (자동 동기화)  │
      └──────────────────────────────────────┘
           │
           ▼
      ┌──────────────────────────────────────┐
      │  Supabase (PostgreSQL)               │
      │  todos 테이블에 저장                 │
      └──────────────────────────────────────┘
```

### 데이터 흐름 (실시간 동기화)

```
1. 페이지 로드
   ├─ page.tsx 마운트
   ├─ useTodos(): SWR이 /api/todos 호출
   ├─ API 라우트: Supabase에서 todos 조회
   ├─ 클라이언트: todos 상태 자동 업데이트
   ├─ useStreak: todos 기반 스트릭 계산
   └─ useTimeMode: 현재 시간 기반 모드 설정

2. 할일 완료 (E1, E2, E7 발동)
   ├─ TodoItem의 Checkbox 클릭
   ├─ toggleTodo(id) 호출 → PATCH /api/todos/[id]
   ├─ API 라우트: Supabase UPDATE 실행
   ├─ mutate() 트리거: 클라이언트 캐시 동기화
   ├─ useStreak: 스트릭 재계산 (E1)
   ├─ ProgressBar: 진도도 업데이트 (E2)
   ├─ CompletedAnimation 트리거 (E7: 애니메이션 + 이모지)
   └─ 리스트 실시간 업데이트

3. 새 할일 추가
   ├─ TodoForm에서 제목 입력
   ├─ addTodo(title, priority) 호출 → POST /api/todos
   ├─ API 라우트: Supabase INSERT 실행 (UUID 자동 생성)
   ├─ mutate() 자동 호출 (낙관적 업데이트)
   ├─ Supabase RLS: 데이터 접근 권한 검증
   └─ 리스트에 신규 항목 추가

4. 삭제 및 수정
   ├─ TodoItem의 메뉴 클릭
   ├─ deleteTodo(id) 또는 updateTodo(id, updates)
   ├─ DELETE /api/todos/[id] 또는 PATCH /api/todos/[id]
   ├─ API: Supabase 실행
   └─ mutate()로 자동 동기화
```

---

## 컴포넌트 간 통신

### Props Drilling 최소화 전략

```typescript
// ❌ Props Drilling 피하기
// App → Header → StreakBox → ... (많은 단계)

// ✅ 커스텀 훅 사용
// 각 컴포넌트가 필요한 훅만 직접 호출
export function Header() {
  const { streakCount } = useStreak();
  const { todayCompletedCount, getTodayTodos } = useTodos();
  return <h1>🔥 연속 {streakCount}일</h1>;
}
```

### 완료 애니메이션 (E7) 구현

```typescript
// CompletedAnimation.tsx - Portal 패턴 사용
export function CompletedAnimation({ position }) {
  const [emojis] = useState(['🎉', '🎊', '⭐', '🚀', '💪', '✨']);
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  return (
    <div className="absolute animate-float text-2xl">
      {randomEmoji}
    </div>
  );
}

// Tailwind 커스텀 애니메이션
// tailwind.config.js에 추가:
// extend: {
//   animation: {
//     float: 'float 2s ease-out forwards',
//   },
// }
```

---

## Supabase 설정 (v1에 포함)

### Supabase 초기화

```typescript
// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Row Level Security (RLS) 정책

```sql
-- 모든 사용자가 자신의 데이터만 접근 가능 (v2에서 사용자 인증 추가 시)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own todos"
  ON todos FOR SELECT
  USING (true); -- v1: 인증 없이 공개, v2: auth.uid 기반으로 변경
```

### v2에서 추가할 기능

| 기능 | 이유 | 우선순위 |
|------|------|---------|
| 사용자 인증 (Supabase Auth) | 개인 데이터 보호, 다중 기기 동기화 | P1 |
| 팀 공유 (RLS 정책 강화) | 협업 기능, 권한 관리 | P2 |
| 실시간 구독 (Supabase Realtime) | 웹소켓 기반 라이브 동기화 | P2 |
| 푸시 알림 (Supabase Functions) | 마감일 리마인더 | P3 |

### 보안 원칙

```
1. API 키 관리
   - NEXT_PUBLIC_* : 클라이언트 노출 가능 (Anon Key)
   - .env.local : 서버 전용 키 (Service Role Key, git 무시)

2. RLS 정책
   - 테이블 수준: 기본 거부 (DEFAULT DENY)
   - 정책 기반: 명시적 허용만

3. 데이터 검증
   - 클라이언트: 기본 검증 (UX)
   - 서버: API 라우트에서 재검증
   - DB: 제약 조건 (NOT NULL, CHECK)

4. HTTPS 강제
   - 모든 통신 암호화
   - 프로덕션: HSTS 헤더 설정
```

---

## 성능 최적화 전략

### Next.js 자동 최적화

```typescript
// Next.js Image 최적화 (필요시 v2)
import Image from 'next/image';

// 자동 캐싱 & 코드 분할
// - 동적 import로 컴포넌트 분할
// - getStaticProps로 빌드타임 생성 (해당 없음)
// - 자동 모바일 최적화
```

### SWR 캐싱 & 동기화

```typescript
// SWR 설정 (deduplicate, focus revalidate)
import useSWR from 'swr';

const { data, mutate } = useSWR('/api/todos', fetcher, {
  revalidateOnFocus: false,     // 창 포커스 시 재검증 제외
  dedupingInterval: 60000,      // 60초 내 중복 요청 제거
  focusThrottleInterval: 300000, // 5분마다만 포커스 재검증
});

// 낙관적 업데이트
const toggleTodo = async (id: string) => {
  // 즉시 UI 업데이트
  const newTodos = todos.map(t => 
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  mutate(newTodos, false); // revalidate=false로 API 재호출 지연

  // 서버 요청
  await fetch(`/api/todos/${id}`, { method: 'PATCH' });

  // 최종 동기화
  mutate();
};
```

### 데이터베이스 쿼리 최적화

```typescript
// Supabase 쿼리 최적화
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .order('due_date', { ascending: true })
  .order('priority', { ascending: false });

// 인덱스 활용
// - due_date, completed 인덱싱 (필터링/정렬 성능)
// - 복합 인덱스 고려 (v2)
```

### 번들 크기

| 라이브러리 | 크기 | 포함 여부 |
|-----------|------|---------|
| Next.js | ~60KB | ✓ |
| React | 42KB | (Next.js 포함) |
| Tailwind CSS | 15KB | ✓ |
| @supabase/supabase-js | 25KB | ✓ |
| swr | 8KB | ✓ |
| **예상 총 번들** | ~100KB | Gzip (포함 라이브러리) |

---

## 구현 순서 (마일스톤 맵핑)

| M | 구현 항목 | 파일 |
|---|---------|------|
| M1 | Next.js 초기화 + Supabase 연동 | next.config.ts, .env.local, src/utils/supabase.ts |
| M2 | 기본 CRUD + API 라우트 | app/api/todos/route.ts, page.tsx, useTodos.ts |
| M3 | 완료 애니메이션 (E7) | components/CompletedAnimation.tsx |
| M4 | 스트릭 (E1) | hooks/useStreak.ts, components/StreakBox.tsx |
| M5 | 진도바 (E2) | hooks/useProgress.ts, components/ProgressBar.tsx |
| M6 | 마감일 & 우선순위 시각화 | components/TodoItem.tsx, TodoForm.tsx |
| M7 | 반응형 & 배포 | app/globals.css, Vercel 배포 |

---

## 개발 시작 체크리스트

### Supabase 설정
- [ ] Supabase 계정 생성 (https://supabase.com)
- [ ] 새 프로젝트 생성
- [ ] `todos` 테이블 생성 (SQL 스키마 실행)
- [ ] NEXT_PUBLIC_SUPABASE_URL 복사
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY 복사

### Next.js 프로젝트 초기화
- [ ] Next.js 프로젝트 생성 (`npx create-next-app@latest`)
- [ ] TypeScript 설정 확인
- [ ] Tailwind CSS 설치 (create-next-app에 포함)
- [ ] 폴더 구조 생성 (app/, src/components, src/hooks 등)

### 의존성 설치
- [ ] `npm install @supabase/supabase-js swr`
- [ ] `npm install -D tailwindcss postcss autoprefixer` (필요시)

### 환경 변수 설정
- [ ] `.env.local` 생성
- [ ] Supabase 키 입력
- [ ] `.env.local.example` 생성 (git 관리용)

### 초기 파일 작성
- [ ] `src/utils/supabase.ts` - Supabase 클라이언트 초기화
- [ ] `src/types/index.ts` - Todo 타입 정의
- [ ] `src/hooks/useTodos.ts` - 할일 관리 훅
- [ ] `app/page.tsx` - 메인 페이지
- [ ] `app/api/todos/route.ts` - API 라우트 (GET, POST)

### 개발 서버 실행
- [ ] `npm run dev` 실행
- [ ] http://localhost:3000 에서 확인
- [ ] 할일 추가/수정/삭제 테스트
- [ ] Supabase에 데이터 저장 확인
