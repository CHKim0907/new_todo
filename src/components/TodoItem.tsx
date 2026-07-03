'use client';
import { Todo } from '@/types';
import { useTodos } from '@/hooks/useTodos';

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500',
};

const priorityLabels = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

export function TodoItem({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => toggleTodo(todo.id, e.target.checked)}
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
        <span className={`text-xs ${priorityColors[todo.priority]}`}>
          {priorityLabels[todo.priority]}
        </span>
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="px-2 py-1 text-sm text-red-500 hover:bg-red-100 rounded transition"
      >
        삭제
      </button>
    </div>
  );
}
