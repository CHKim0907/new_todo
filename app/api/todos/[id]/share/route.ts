import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// POST: 할일 공유
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { email, permission = 'read' } = await request.json();

  if (!email) {
    return NextResponse.json({ error: '이메일 필수' }, { status: 400 });
  }

  // 사용자 조회
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  const targetUser = userData?.users.find((u) => u.email === email);

  if (!targetUser) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
  }

  // 공유 생성
  const { data, error } = await supabase
    .from('todo_shares')
    .insert([
      {
        todo_id: id,
        owner_id: session.user.id,
        shared_with_user_id: targetUser.id,
        permission,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data[0]);
}

// DELETE: 공유 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { shared_with_user_id } = await request.json();

  const { error } = await supabase
    .from('todo_shares')
    .delete()
    .eq('todo_id', id)
    .eq('owner_id', session.user.id)
    .eq('shared_with_user_id', shared_with_user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
