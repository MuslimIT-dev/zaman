'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { isMaster } from '@/lib/types';

export function UserMenu() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex gap-3">
        <Link href="/login" className="text-sm hover:text-blue-600">
          Войти
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Регистрация
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isMaster(user) && (
        <Link
          href="/studio"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Studio →
        </Link>
      )}
      <Link
        href="/app"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        {user.name}
      </Link>
    </div>
  );
}