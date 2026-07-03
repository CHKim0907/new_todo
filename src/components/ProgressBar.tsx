'use client';
import { useTodos } from '@/hooks/useTodos';
import { useMemo } from 'react';

export function ProgressBar() {
  const { todos } = useTodos();

  const progress = useMemo(() => {
    if (todos.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const todayTodos = todos.filter((todo) => {
      const createdDate = new Date(todo.created_at).toISOString().split('T')[0];
      return createdDate === today;
    });

    if (todayTodos.length === 0) return 0;

    const completedToday = todayTodos.filter((todo) => todo.completed).length;
    return Math.round((completedToday / todayTodos.length) * 100);
  }, [todos]);

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return todos.filter((todo) => {
      const createdDate = new Date(todo.created_at).toISOString().split('T')[0];
      return createdDate === today && todo.completed;
    }).length;
  }, [todos]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-gray-700">오늘의 진행률</p>
        <p className="text-sm font-bold text-blue-600">{completedToday} 완료 · {progress}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
