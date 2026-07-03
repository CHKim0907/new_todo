'use client';
import { useState } from 'react';
import { Todo } from '@/types';
import { useSharedTodos } from '@/hooks/useSharedTodos';

export function ShareButton({ todo }: { todo: Todo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [isLoading, setIsLoading] = useState(false);
  const { shareWithUser } = useSharedTodos();

  const handleShare = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    await shareWithUser(todo.id, email, permission);
    setEmail('');
    setPermission('read');
    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-sm text-blue-500 hover:bg-blue-100 rounded transition"
      >
        🔗 공유
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">할일 공유</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">권한</label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="read">읽기만</option>
                  <option value="write">읽기/쓰기</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-gray-700 border rounded hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleShare}
                disabled={isLoading || !email.trim()}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '공유 중...' : '공유'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
