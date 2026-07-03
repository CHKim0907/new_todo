'use client';
import { Todo } from '@/types';
import { useTodos } from '@/hooks/useTodos';
import { useState } from 'react';
import { CompletedAnimation } from './CompletedAnimation';
import { ShareButton } from './ShareButton';

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
};

const priorityLabels = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

export function TodoItem({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo } = useTodos();
  const [showAnimation, setShowAnimation] = useState(false);

  const handleToggle = (completed: boolean) => {
    if (completed) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    }
    toggleTodo(todo.id, completed);
  };

  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;
  const daysUntilDue = todo.due_date
    ? Math.ceil((new Date(todo.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getDueLabel = () => {
    if (!daysUntilDue) return null;
    if (daysUntilDue < 0) return '기한 초과';
    if (daysUntilDue === 0) return '오늘';
    if (daysUntilDue === 1) return '내일';
    return `${daysUntilDue}일`;
  };

  return (
    <>
      <CompletedAnimation show={showAnimation} />
      <div
        className={`flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition ${
          isOverdue ? 'border-red-400 bg-red-50' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => handleToggle(e.target.checked)}
          className="w-5 h-5 cursor-pointer"
        />
        <div className="flex-1">
          <span
            className={`block ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}
          >
            {todo.title}
          </span>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded border ${priorityColors[todo.priority]}`}>
              {priorityLabels[todo.priority]}
            </span>
            {isOverdue && <span className="text-xs px-2 py-1 rounded bg-red-200 text-red-700">🔴 {getDueLabel()}</span>}
            {!isOverdue && daysUntilDue !== null && daysUntilDue <= 3 && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-200 text-yellow-700">⏰ {getDueLabel()}</span>
            )}
            {!isOverdue && daysUntilDue && daysUntilDue > 3 && (
              <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">📅 {getDueLabel()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <ShareButton todo={todo} />
          <button
            onClick={() => deleteTodo(todo.id)}
            className="px-2 py-1 text-sm text-red-500 hover:bg-red-100 rounded transition"
          >
            삭제
          </button>
        </div>
      </div>
    </>
  );
}
