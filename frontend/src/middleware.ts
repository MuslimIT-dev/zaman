import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  PUBLIC_PATHS,
  LOGIN_PATH,
  FORBIDDEN_PATH,
} from '@/lib/auth-config';

const REFRESH_PATH = '/api/auth/refresh';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isPublic) {
    if (
      (pathname === LOGIN_PATH || pathname === '/register') &&
      accessToken &&
      !isJwtExpired(accessToken)
    ) {
      const roles = readRoles(accessToken);
      const home = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MASTER')
        ? '/studio'
        : '/app';
      return NextResponse.redirect(new URL(home, req.url));
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    if (!refreshToken) {
      return redirectToLogin(req, pathname + search);
    }
    return redirectToRefresh(req, pathname + search);
  }

  if (isJwtExpired(accessToken)) {
    if (refreshToken) {
      return redirectToRefresh(req, pathname + search);
    }
    return redirectToLogin(req, pathname + search);
  }

  if (pathname.startsWith('/admin')) {
    const roles = readRoles(accessToken);
    if (!roles.includes('ROLE_ADMIN')) {
      return NextResponse.redirect(new URL(FORBIDDEN_PATH, req.url));
    }
  }
  if (pathname.startsWith('/studio')) {
    const roles = readRoles(accessToken);
    if (!roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_MASTER')) {
      return NextResponse.redirect(new URL(FORBIDDEN_PATH, req.url));
    }
  }

  return NextResponse.next();
}

// ─── helpers ────────────────────────────────────────
function isJwtExpired(jwt: string): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const exp = typeof payload.exp === 'number' ? payload.exp : 0;
    return Date.now() >= exp * 1000 - 30_000;
  } catch {
    return true;
  }
}

function readRoles(jwt: string): string[] {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const roles = payload.roles;
    if (!Array.isArray(roles)) return [];
    const map: Record<number, string> = {
      1: 'ROLE_ADMIN',
      2: 'ROLE_MASTER',
      3: 'ROLE_CLIENT',
    };
    return roles
      .map((r) => (typeof r === 'number' ? map[r] : r))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function redirectToLogin(req: NextRequest, returnTo: string) {
  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = '';
  url.searchParams.set('returnTo', returnTo);
  return NextResponse.redirect(url);
}

function redirectToRefresh(req: NextRequest, returnTo: string) {
  const url = req.nextUrl.clone();
  url.pathname = REFRESH_PATH;
  url.search = '';
  url.searchParams.set('next', returnTo);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};