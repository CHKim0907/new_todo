'use client';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { StreakBox } from '@/components/StreakBox';
import { ProgressBar } from '@/components/ProgressBar';
import { AuthButton } from '@/components/AuthButton';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">📋 할일 관리</h1>
          <p className="text-gray-600 mb-6">로그인하여 할일을 관리하세요</p>
          <AuthButton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-800">📋 오늘의 할일</h1>
              <p className="text-gray-500">새로운 할일을 추가하고 진행 상황을 추적하세요</p>
            </div>
            <AuthButton />
          </div>

          <StreakBox />
          <ProgressBar />

          <TodoForm />
          <TodoList />
        </div>
      </div>
    </main>
  );
}
