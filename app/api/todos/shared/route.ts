import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET: 공유받은 할일 조회
export async function GET(request: NextRequest) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('todo_shares')
    .select(
      `
      *,
      todos (*)
    `
    )
    .eq('shared_with_user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
