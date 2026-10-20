export type UserRole = 'ROLE_ADMIN' | 'ROLE_MASTER' | 'ROLE_CLIENT';

export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  timezone: string;
  emailVerified: boolean;
  roles: UserRole[];
};

const ROLE_MAP: Record<number, UserRole> = {
  1: 'ROLE_ADMIN',
  2: 'ROLE_MASTER',
  3: 'ROLE_CLIENT',
};

export function normalizeRoles(raw: unknown[]): UserRole[] {
  return raw
    .map((r) => (typeof r === 'number' ? ROLE_MAP[r] : r))
    .filter((r): r is UserRole =>
      r === 'ROLE_ADMIN' || r === 'ROLE_MASTER' || r === 'ROLE_CLIENT',
    );
}

export function isMaster(user: User | null): boolean {
  if (!user) return false;
  return user.roles.includes('ROLE_MASTER') || user.roles.includes('ROLE_ADMIN');
}

export function isAdmin(user: User | null): boolean {
  return user?.roles.includes('ROLE_ADMIN') ?? false;
}