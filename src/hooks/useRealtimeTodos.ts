'use client';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export function useRealtimeTodos(userId: string | undefined, onUpdate: () => void) {
  useEffect(() => {
    if (!userId) return;

    // todos 테이블 변경 리스너
    const todosChannel = supabase
      .channel(`public:todos:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    // todo_shares 테이블 변경 리스너 (공유받은 할일)
    const sharesChannel = supabase
      .channel(`public:todo_shares:shared_with_user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todo_shares',
          filter: `shared_with_user_id=eq.${userId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      todosChannel.unsubscribe();
      sharesChannel.unsubscribe();
    };
  }, [userId, onUpdate]);
}
