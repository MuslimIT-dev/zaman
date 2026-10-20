import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { authClient } from '@/lib/rpc';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  LOGIN_PATH,
} from '@/lib/auth-config';

const isProd = process.env.NODE_ENV === 'production';

export async function GET(req: NextRequest) {
  const refresh = (await cookies()).get(REFRESH_COOKIE)?.value;
  const nextPath = req.nextUrl.searchParams.get('next') ?? '/app';

  if (!refresh) {
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }

  try {
    const res = await authClient.refreshToken({ refreshToken: refresh });

    if (!res.tokens) {
      const fail = NextResponse.redirect(new URL(LOGIN_PATH, req.url));
      fail.cookies.delete(ACCESS_COOKIE);
      fail.cookies.delete(REFRESH_COOKIE);
      return fail;
    }

    const response = NextResponse.redirect(new URL(nextPath, req.url));
    response.cookies.set(ACCESS_COOKIE, res.tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_MAX_AGE,
    });
    response.cookies.set(REFRESH_COOKIE, res.tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_MAX_AGE,
    });
    return response;
  } catch {
    const fail = NextResponse.redirect(new URL(LOGIN_PATH, req.url));
    fail.cookies.delete(ACCESS_COOKIE);
    fail.cookies.delete(REFRESH_COOKIE);
    return fail;
  }
}