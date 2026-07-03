'use client';
import { useMemo } from 'react';
import { Todo } from '@/types';

export function useStreak(todos: Todo[]) {
  const streak = useMemo(() => {
    if (todos.length === 0) return { count: 0, lastCompletedDate: null };

    const completedByDate = new Map<string, number>();

    todos.forEach((todo) => {
      if (todo.completed_at) {
        const date = new Date(todo.completed_at).toISOString().split('T')[0];
        completedByDate.set(date, (completedByDate.get(date) || 0) + 1);
      }
    });

    if (completedByDate.size === 0) {
      return { count: 0, lastCompletedDate: null };
    }

    const sortedDates = Array.from(completedByDate.keys()).sort().reverse();
    let count = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (date.toISOString().split('T')[0] === expectedDateStr) {
        count++;
      } else {
        break;
      }
    }

    return {
      count,
      lastCompletedDate: sortedDates[0],
    };
  }, [todos]);

  return streak;
}
