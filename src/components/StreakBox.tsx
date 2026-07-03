'use client';
import { useTodos } from '@/hooks/useTodos';
import { useStreak } from '@/hooks/useStreak';

export function StreakBox() {
  const { todos } = useTodos();
  const { count } = useStreak(todos);

  return (
    <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🔥</span>
        <div>
          <p className="text-sm font-semibold opacity-90">연속 완료</p>
          <p className="text-3xl font-bold">{count}일</p>
        </div>
      </div>
    </div>
  );
}
