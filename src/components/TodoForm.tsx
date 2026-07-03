'use client';
import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';

export function TodoForm() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);
  const { addTodo } = useTodos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTodo(title, priority);
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 할일 추가..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
        >
          ⚙️
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          추가
        </button>
      </div>

      {expanded && (
        <div className="flex gap-2 pt-2 border-t">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">낮음</option>
            <option value="medium">중간</option>
            <option value="high">높음</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </form>
  );
}
