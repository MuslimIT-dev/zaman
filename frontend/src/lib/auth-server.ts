import 'server-only';

import { cookies } from 'next/headers';
import { userClient } from '@/lib/rpc';
import { ACCESS_COOKIE } from '@/lib/auth-config';
import { normalizeRoles, type User } from '@/lib/types';

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const { user } = await userClient.getMe(
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      emailVerified: user.emailVerified,
      roles: normalizeRoles(user.roles),
    };
  } catch {
    return null;
  }
}