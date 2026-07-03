export type TodoPriority = 'high' | 'medium' | 'low';
export type Recurrence = null | 'daily' | 'weekly' | 'monthly';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  due_date?: string | null;
  tags: string[];
  recurrence: Recurrence;
  recurrence_end_date?: string | null;
  created_at: string;
  completed_at?: string | null;
  is_archived: boolean;
  updated_at: string;
}
