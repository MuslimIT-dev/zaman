import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { userClient } from '@/lib/rpc';
import { ACCESS_COOKIE } from '@/lib/auth-config';
import { normalizeRoles } from '@/lib/types';

export async function GET() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { user } = await userClient.getMe(
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        timezone: user.timezone,
        emailVerified: user.emailVerified,
        roles: normalizeRoles(user.roles),
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}