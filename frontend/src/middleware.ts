import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, isValidLocale } from '@/i18n/config';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  LOGIN_PATH,
  FORBIDDEN_PATH,
} from '@/lib/auth-config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

const PUBLIC_PATHS = ['/', '/masters', '/courses', '/login', '/register', '/forbidden'];

function stripLocale(pathname: string): { path: string; locale: string | null } {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && isValidLocale(parts[0])) {
    return {
      locale: parts[0],
      path: '/' + parts.slice(1).join('/'),
    };
  }
  return { locale: null, path: pathname };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vercel/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(req);
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const { path, locale } = stripLocale(pathname);
  const effectiveLocale = locale ?? defaultLocale;

  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  if (isPublic) {
    if ((path === '/login' || path === '/register') && accessToken && !isJwtExpired(accessToken)) {
      const roles = readRoles(accessToken);
      const home = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MASTER')
        ? '/studio'
        : '/app';
      return NextResponse.redirect(new URL(`/${effectiveLocale}${home}`, req.url));
    }
    return intlResponse;
  }

  if (!accessToken) {
    if (!refreshToken) {
      return NextResponse.redirect(
        new URL(`/${effectiveLocale}${LOGIN_PATH}?returnTo=${encodeURIComponent(path)}`, req.url),
      );
    }
    return NextResponse.redirect(
      new URL(`/api/auth/refresh?next=${encodeURIComponent(`/${effectiveLocale}${path}`)}`, req.url),
    );
  }

  if (isJwtExpired(accessToken)) {
    if (refreshToken) {
      return NextResponse.redirect(
        new URL(`/api/auth/refresh?next=${encodeURIComponent(`/${effectiveLocale}${path}`)}`, req.url),
      );
    }
    return NextResponse.redirect(
      new URL(`/${effectiveLocale}${LOGIN_PATH}?returnTo=${encodeURIComponent(path)}`, req.url),
    );
  }

  if (path.startsWith('/admin')) {
    const roles = readRoles(accessToken);
    if (!roles.includes('ROLE_ADMIN')) {
      return NextResponse.redirect(new URL(`/${effectiveLocale}${FORBIDDEN_PATH}`, req.url));
    }
  }
  if (path.startsWith('/studio')) {
    const roles = readRoles(accessToken);
    if (!roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_MASTER')) {
      return NextResponse.redirect(new URL(`/${effectiveLocale}${FORBIDDEN_PATH}`, req.url));
    }
  }

  return intlResponse;
}

// helpers
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
      1: 'ROLE_ADMIN', 2: 'ROLE_MASTER', 3: 'ROLE_CLIENT',
    };
    return roles.map((r) => (typeof r === 'number' ? map[r] : r)).filter(Boolean);
  } catch {
    return [];
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};