# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

**프로젝트명**: 할일 관리 앱 (Todo App)  
**목표**: MVP 1시간 버전으로 기본 CRUD 기능 구현 후 점진적 확장  
**기술 스택**: Next.js 14 + TypeScript + Tailwind CSS + Supabase (PostgreSQL) + SWR  
**배포**: Vercel  

---

## 개발 환경 설정

### 초기화 (최초 1회)

```bash
# 1. Next.js 프로젝트 생성
cd C:\Users\KOSTA
npx create-next-app@latest new_todo --typescript --tailwind --no-eslint --src-dir

# 2. 의존성 설치
cd new_todo
npm install @supabase/supabase-js swr

# 3. 환경 변수 설정
# .env.local 생성 후 다음 입력:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 개발 서버 실행

```bash
npm run dev
# 브라우저: http://localhost:3000
```

### 빌드 & 배포

```bash
npm run build
npm run start

# Vercel 배포
npm install -g vercel
vercel
```

### 테스트 (향후)

```bash
npm run test
npm run test:watch
```

---

## Supabase 설정 체크리스트

### 1단계: 테이블 생성

Supabase SQL 에디터에서 다음 스크립트 실행:

```sql
-- todos 테이블
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

-- 성능 인덱싱
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_completed ON todos(completed);

-- Row Level Security 활성화 (v2: 사용자 인증 추가 시 정책 업데이트)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON todos
  FOR ALL USING (true);
```

### 2단계: 환경 변수 확인

- Supabase 프로젝트 → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` 복사
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 복사
- `.env.local`에 입력

---

## 프로젝트 구조

```
new_todo/
├── docs/                      # 기획 문서 (유지)
│   ├── 01-requirements.md
│   ├── 02-personas.md
│   ├── ... (06-architecture.md, 07-plan.md)
│   └── mockups/index.html
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 메인 페이지 (할일 리스트)
│   ├── globals.css             # 글로벌 스타일
│   └── api/todos/              # API 라우트
│       ├── route.ts            # GET: 모든 할일 조회, POST: 할일 추가
│       └── [id]/
│           └── route.ts        # PATCH: 할일 수정, DELETE: 할일 삭제
├── src/
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── TodoForm.tsx        # 할일 입력 폼
│   │   ├── TodoList.tsx        # 할일 목록 표시
│   │   ├── TodoItem.tsx        # 개별 할일 항목
│   │   ├── Header.tsx          # 헤더 (타이틀, 스트릭 등)
│   │   ├── StreakBox.tsx       # 연속 완료 표시 (v1.1)
│   │   ├── ProgressBar.tsx     # 진도바 (v1.1)
│   │   └── CompletedAnimation.tsx # 완료 애니메이션 (v1.1)
│   ├── hooks/                  # 커스텀 React 훅
│   │   ├── useTodos.ts         # 할일 관리 (CRUD, SWR 동기화)
│   │   ├── useStreak.ts        # 스트릭 계산 (v1.1)
│   │   ├── useTimeMode.ts      # 시간 모드 (아침/오후/저녁) (v1.1)
│   │   └── useSupabase.ts      # Supabase 클라이언트 래퍼
│   ├── types/                  # TypeScript 타입 정의
│   │   └── index.ts            # Todo 인터페이스, enum 등
│   ├── utils/                  # 유틸리티 함수
│   │   ├── supabase.ts         # Supabase 클라이언트 초기화
│   │   ├── date.ts             # 날짜 관련 함수
│   │   └── formatting.ts       # 포맷팅 함수
│   └── lib/
│       └── supabase-schema.sql # 스키마 참고 문서
├── public/                     # 정적 파일
│   └── favicon.ico
├── .env.local                  # 환경 변수 (git 무시)
├── .env.local.example          # 환경 변수 템플릿
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 주요 개발 패턴

### 1. API 라우트 기본 구조

**`app/api/todos/route.ts` 예시:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET: 모든 할일 조회
export async function GET() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// POST: 새 할일 추가
export async function POST(request: NextRequest) {
  const { title, priority = 'medium' } = await request.json();
  
  if (!title?.trim()) {
    return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([{ title, priority, completed: false }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data[0]);
}
```

### 2. 커스텀 훅 (useTodos)

**`src/hooks/useTodos.ts` 예시:**

```typescript
'use client';
import useSWR from 'swr';
import { Todo } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useTodos() {
  const { data: todos = [], mutate, isLoading, error } = useSWR('/api/todos', fetcher);

  const addTodo = async (title: string, priority = 'medium') => {
    const newTodo = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority }),
    }).then(r => r.json());
    
    mutate([newTodo, ...todos], false); // 낙관적 업데이트
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    mutate(); // 서버와 동기화
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    mutate();
  };

  return { todos, addTodo, toggleTodo, deleteTodo, mutate, isLoading, error };
}
```

### 3. 컴포넌트 작성 (Client Component)

**`src/components/TodoForm.tsx` 예시:**

```typescript
'use client'; // 클라이언트 컴포넌트 필수
import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';

export function TodoForm() {
  const [title, setTitle] = useState('');
  const { addTodo } = useTodos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTodo(title);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="새 할일 추가..."
        className="flex-1 px-3 py-2 border rounded"
      />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        추가
      </button>
    </form>
  );
}
```

### 4. 타입 정의

**`src/types/index.ts`:**

```typescript
export type TodoPriority = 'high' | 'medium' | 'low';
export type Recurrence = null | 'daily' | 'weekly' | 'monthly';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  due_date?: string | null;
  tags: string[];
  recurrence: Recurrence;
  recurrence_end_date?: string | null;
  created_at: string;
  completed_at?: string | null;
  is_archived: boolean;
  updated_at: string;
}
```

---

## 마일스톤 (구현 순서)

### M1: Supabase + Next.js 초기화 (20분)
- [ ] Supabase 테이블 생성 (todos)
- [ ] Next.js 프로젝트 생성
- [ ] 환경 변수 설정 (.env.local)
- [ ] Supabase 클라이언트 초기화 (src/utils/supabase.ts)

### M2: 기본 CRUD + API 라우트 (30분)
- [ ] API 라우트: GET, POST /api/todos
- [ ] API 라우트: PATCH, DELETE /api/todos/[id]
- [ ] useTodos 훅 작성
- [ ] TodoForm, TodoList 컴포넌트
- [ ] 브라우저 테스트 (추가/수정/삭제/완료)

### M3: UI 구성 + 배포 (10분)
- [ ] 메인 페이지 레이아웃 (app/page.tsx)
- [ ] Tailwind 기본 스타일링
- [ ] GitHub 업로드
- [ ] Vercel 배포

### v1.1: 추가 기능 (향후)
- [ ] 완료 애니메이션 (E7)
- [ ] 스트릭 기능 (E1)
- [ ] 진도바 (E2)
- [ ] 마감일 시각화
- [ ] 우선순위별 정렬

---

## 주의사항

### 환경 변수
- `.env.local`은 절대 git에 커밋하지 않기 (`.gitignore` 확인)
- `.env.local.example`로 템플릿 제공
- 모든 Supabase 키는 `NEXT_PUBLIC_` 접두사로 클라이언트에 노출 가능 (RLS로 보호됨)

### Supabase 보안
- RLS (Row Level Security) 정책 확인
- v1: 공개 액세스 (테스트용), v2: 사용자 인증 기반 정책으로 업그레이드
- 서버 전용 키(Service Role Key)는 `.env.local`에만 저장, `'use server'` 함수에서만 사용

### Next.js 패턴
- 클라이언트 컴포넌트는 항상 `'use client'` 지시문으로 시작
- API 라우트는 자동으로 서버사이드 (키 노출 안전)
- SWR은 클라이언트에서만 사용 (자동 캐싱 & 동기화)

### 성능
- SWR 설정: `dedupingInterval: 60000`, `revalidateOnFocus: false`로 불필요한 요청 방지
- 낙관적 업데이트(Optimistic Update) 사용: `mutate(newData, false)`
- 100개 할일 이상에서도 1초 이내 렌더링 목표

### 스타일링
- Tailwind CSS 유틸리티 클래스만 사용 (CSS-in-JS 미사용)
- 반응형: 모바일 우선(mobile-first) 설계
  - 모바일 (< 768px): 버튼 >= 44px, 터치 친화적
  - 태블릿 (768~1023px): 단일 컬럼
  - PC (>= 1024px): 여유로운 레이아웃

---

## 문제 해결

### Supabase 연결 안 됨
1. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 테이블 `todos`가 생성되었는지 SQL 에디터에서 확인

### API 404 에러
- 파일 위치 확인: `app/api/todos/route.ts` (정확한 경로 필수)
- 개발 서버 재시작: `npm run dev`

### SWR 데이터 미업데이트
- `mutate()` 호출 확인
- 브라우저 DevTools → Network 탭에서 API 응답 확인

### 환경 변수 로드 안 됨
- `.env.local` 파일 저장 후 개발 서버 재시작
- 변수 이름이 정확한지 확인 (대소문자 구분)

---

## 참고 문서

- **기획 문서**: `docs/` 디렉토리
  - `01-requirements.md`: 요구사항
  - `06-architecture.md`: 상세 아키텍처
  - `07-plan.md`: 구현 계획
- **Next.js 공식 문서**: https://nextjs.org/docs
- **Supabase 공식 문서**: https://supabase.com/docs
- **SWR 문서**: https://swr.vercel.app
- **Tailwind CSS**: https://tailwindcss.com

---

## 코드 컨벤션

- **파일명**: 컴포넌트는 PascalCase (TodoForm.tsx), 유틸은 camelCase (supabase.ts)
- **변수**: camelCase (const addTodo)
- **상수**: UPPER_SNAKE_CASE (const API_URL)
- **타입**: PascalCase (interface Todo, type TodoPriority)
- **주석**: 한국어 권장, WHY가 명확한 경우만 작성
- **import**: 절대 경로 사용 (@/components, @/utils, @/types)
