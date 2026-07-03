'use client';
import useSWR from 'swr';
import { Todo } from '@/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTodos() {
  const { data: todos = [], mutate, isLoading, error } = useSWR(
    '/api/todos',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const addTodo = async (title: string, priority = 'medium') => {
    const newTodo = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority }),
    }).then((r) => r.json());

    // 낙관적 업데이트
    mutate([newTodo, ...todos], false);
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    mutate();
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    mutate();
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    mutate();
  };

  return {
    todos: todos as Todo[],
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    mutate,
    isLoading,
    error,
  };
}
