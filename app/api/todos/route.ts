import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET: 모든 할일 조회
export async function GET() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

// POST: 새 할일 추가
export async function POST(request: NextRequest) {
  const { title, priority = 'medium' } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json(
      { error: '제목은 필수입니다' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        title,
        priority,
        completed: false,
        tags: [],
        recurrence: null,
        is_archived: false,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data[0]);
}
