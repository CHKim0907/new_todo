'use client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function AuthButton() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link
          href="/login"
          className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">
        {user.email}
      </span>
      <button
        onClick={() => signOut()}
        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded font-medium"
      >
        로그아웃
      </button>
    </div>
  );
}
