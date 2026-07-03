'use client';
import { useTodos } from '@/hooks/useTodos';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, isLoading } = useTodos();

  if (isLoading) {
    return <div className="text-center text-gray-500 py-8">로딩 중...</div>;
  }

  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        할일이 없습니다. 새로 추가해보세요! ✨
      </div>
    );
  }

  const sortedTodos = [...todos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-2">
      {sortedTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
