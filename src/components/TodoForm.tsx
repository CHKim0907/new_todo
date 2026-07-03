'use client';
import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';

export function TodoForm() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const { addTodo } = useTodos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTodo(title, priority);
    setTitle('');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="새 할일 추가..."
        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as any)}
        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="low">낮음</option>
        <option value="medium">중간</option>
        <option value="high">높음</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        추가
      </button>
    </form>
  );
}
