# Phase 7 — 구현 계획 (Implementation Plan)

## 프로젝트 개요 (MVP - 1시간 버전)

- **시간 예산**: 1시간 (빠른 MVP)
- **기술 스택**: Next.js 14 + Supabase (PostgreSQL) + Tailwind CSS
- **MVP 목표**: 할일 추가/목록/완료/삭제 + 배포
- **v1.1 미룸**: 애니메이션, 스트릭, 진도바, 마감일 시각화
- **v2 미룸**: 사용자 인증, 팀 공유, 실시간 동기화

---

## 마일스톤 요약 (MVP)

| M | 이름 | 목표 | 예상 시간 | 우선순위 |
|---|------|------|---------|--------|
| M1 | Supabase + Next.js 초기화 | 환경 세팅, 테이블 생성 | 20분 | P0 |
| M2 | 기본 CRUD + API 라우트 | 할일 추가/목록/완료/삭제 | 30분 | P0 |
| M3 | UI 기본 구성 + 배포 | 레이아웃, Vercel 배포 | 10분 | P0 |
| **합계** | | | **60분** | |

---

## M1: Supabase + Next.js 초기화 (20분)

### 1. Supabase 테이블 생성 (5분)

```sql
-- Supabase SQL 에디터에서 실행
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(10) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
```

### 2. Next.js 프로젝트 생성 (10분)

```bash
# new_todo 폴더에 직접 설치 (또는 new_todo_app 사용)
cd C:\Users\KOSTA
npx create-next-app@latest new_todo --typescript --tailwind --no-eslint --src-dir
cd new_todo
npm install @supabase/supabase-js swr
```

### 3. 환경 변수 설정 (5분)

**`.env.local` 생성:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**검증:**
- ✅ Supabase 테이블 todos 생성됨
- ✅ .env.local 파일 생성됨
- ✅ `npm run dev` 실행 → http://localhost:3000

---

## M2: 기본 CRUD + API 라우트 (30분)

### 1. Supabase 클라이언트 초기화 (3분)

**`src/lib/supabase.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 2. 타입 정의 (2분)

**`src/types/index.ts`:**
```typescript
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  created_at: string;
  updated_at: string;
}
```

### 3. API 라우트 (15분)

**`app/api/todos/route.ts` (GET, POST):**
```typescript
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

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
  const { title, priority } = await request.json();
  
  const { data, error } = await supabase
    .from('todos')
    .insert([{ title, priority, completed: false }])
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data[0]);
}
```

**`app/api/todos/[id]/route.ts` (PATCH, DELETE):**
```typescript
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// PATCH: 할일 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const updates = await request.json();
  
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', params.id)
    .select();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data[0]);
}

// DELETE: 할일 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', params.id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
```

### 4. 커스텀 훅 (10분)

**`src/hooks/useTodos.ts`:**
```typescript
import useSWR from 'swr';
import { Todo } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useTodos() {
  const { data: todos = [], mutate } = useSWR('/api/todos', fetcher);

  const addTodo = async (title: string, priority = 'medium') => {
    const newTodo = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority }),
    }).then(r => r.json());
    
    mutate([newTodo, ...todos], false);
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    
    mutate();
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    mutate();
  };

  return { todos, addTodo, toggleTodo, deleteTodo, mutate };
}
```

### 5. 컴포넌트 (작게 유지!) (5분)

**`src/components/TodoForm.tsx`:**
```typescript
'use client';
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
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        추가
      </button>
    </form>
  );
}
```

**`src/components/TodoList.tsx`:**
```typescript
'use client';
import { useTodos } from '@/hooks/useTodos';

export function TodoList() {
  const { todos, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center gap-3 p-3 border rounded bg-white"
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => toggleTodo(todo.id, e.target.checked)}
            className="w-5 h-5"
          />
          <span className={todo.completed ? 'line-through text-gray-400' : ''}>
            {todo.title}
          </span>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 검증

- ✅ 할일 추가 (제목만 입력)
- ✅ 할일 목록 표시
- ✅ 체크박스로 완료 토글
- ✅ 삭제 버튼 작동
- ✅ Supabase에 데이터 저장됨

---

## M3: UI 기본 구성 + 배포 (10분)

### 1. 페이지 레이아웃 (5분)

**`app/page.tsx`:**
```typescript
'use client';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">📋 오늘의 할일</h1>
      <TodoForm />
      <TodoList />
    </main>
  );
}
```

### 2. Vercel 배포 (5분)

```bash
# GitHub 업로드
git init
git add .
git commit -m "초기 커밋: MVP 완성"
git remote add origin <your-repo-url>
git push -u origin main

# Vercel 배포
npm install -g vercel
vercel
```

### 배포 확인

- ✅ Vercel 배포 성공
- ✅ 라이브 URL에서 할일 추가/완료/삭제 작동
- ✅ Supabase에 데이터 저장됨

---

## v1.1 로드맵 (다음 세션)

| 기능 | 예상 시간 |
|------|---------|
| 완료 애니메이션 (E7) | 30분 |
| 스트릭 (E1) | 30분 |
| 진도바 (E2) | 30분 |
| 마감일 & 우선순위 시각화 | 1시간 |
| **소계** | **2.5시간** |

---

## 개발 시작 체크리스트

### 준비 (5분)
- [ ] Supabase 계정 생성 (https://supabase.com)
- [ ] 새 프로젝트 생성
- [ ] SQL 스키마 실행 (위의 CREATE TABLE)
- [ ] NEXT_PUBLIC_SUPABASE_URL, ANON_KEY 복사

### M1 (20분)
- [ ] Next.js 프로젝트 생성
- [ ] .env.local 작성
- [ ] `npm run dev` 실행 확인

### M2 (30분)
- [ ] src/lib/supabase.ts
- [ ] src/types/index.ts
- [ ] app/api/todos/route.ts
- [ ] app/api/todos/[id]/route.ts
- [ ] src/hooks/useTodos.ts
- [ ] src/components/TodoForm.tsx
- [ ] src/components/TodoList.tsx
- [ ] 브라우저 테스트

### M3 (10분)
- [ ] app/page.tsx 작성
- [ ] GitHub 업로드
- [ ] Vercel 배포
- [ ] 라이브 URL 테스트

---

## 시간 절감 팁

1. **컴포넌트 최소화**: 디자인은 나중에, 기능 우선plu
2. **에러 처리 생략**: MVP에서는 필수 기능만
3. **타입 단순화**: 필요한 필드만
4. **테일윈드 기본값**: 커스텀 스타일 최소화
5. **배포 자동화**: Vercel 기본 설정 사용

---

## 완료 기준

- ✅ 할일 추가 가능
- ✅ 할일 목록 표시
- ✅ 체크박스로 완료/미완료 토글
- ✅ 삭제 버튼 작동
- ✅ Vercel에 배포됨
- ✅ 모든 데이터 Supabase에 저장됨
