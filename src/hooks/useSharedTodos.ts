'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSharedTodos() {
  const { data: shares = [], mutate } = useSWR('/api/todos/shared', fetcher);

  const shareWithUser = async (todoId: string, email: string, permission = 'read') => {
    await fetch(`/api/todos/${todoId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, permission }),
    });
    mutate();
  };

  const revokeShare = async (todoId: string, userId: string) => {
    await fetch(`/api/todos/${todoId}/share`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shared_with_user_id: userId }),
    });
    mutate();
  };

  return {
    shares,
    shareWithUser,
    revokeShare,
    mutate,
  };
}
