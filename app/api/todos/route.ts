import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET: 현재 사용자의 할일 조회
export async function GET() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

// POST: 새 할일 추가
export async function POST(request: NextRequest) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { title, priority = 'medium', due_date } = await request.json();

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
        due_date: due_date || null,
        completed: false,
        tags: [],
        recurrence: null,
        is_archived: false,
        user_id: session.user.id,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data[0]);
}
