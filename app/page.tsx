'use client';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { StreakBox } from '@/components/StreakBox';
import { ProgressBar } from '@/components/ProgressBar';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">📋 오늘의 할일</h1>
          <p className="text-gray-500 mb-6">새로운 할일을 추가하고 진행 상황을 추적하세요</p>

          <StreakBox />
          <ProgressBar />

          <TodoForm />
          <TodoList />
        </div>
      </div>
    </main>
  );
}
