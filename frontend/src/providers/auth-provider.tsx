'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isMaster: boolean;
  isAdmin: boolean;
  hasRole: (role: 'ROLE_ADMIN' | 'ROLE_MASTER' | 'ROLE_CLIENT') => boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();

  const hasRole = useCallback(
    (role: 'ROLE_ADMIN' | 'ROLE_MASTER' | 'ROLE_CLIENT') =>
      user?.roles.includes(role) ?? false,
    [user],
  );

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
    router.refresh();
  }, [router]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isMaster: hasRole('ROLE_MASTER') || hasRole('ROLE_ADMIN'),
    isAdmin: hasRole('ROLE_ADMIN'),
    hasRole,
    setUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}