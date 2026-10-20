'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authClient } from '@/lib/rpc';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  DEFAULT_CLIENT_HOME,
  DEFAULT_MASTER_HOME,
  LOGIN_PATH,
} from '@/lib/auth-config';

const isProd = process.env.NODE_ENV === 'production';

export type AuthActionResult = { error: string } | { ok: true };

async function setAuthCookies(access: string, refresh: string) {
  (await cookies()).set(ACCESS_COOKIE, access, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE,
  });
  (await cookies()).set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function loginAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const returnTo = String(formData.get('returnTo') ?? '');

  if (!email || !password) {
    return { error: 'Заполните все поля' };
  }

  try {
    const res = await authClient.login({ email, password });

    if (!res.tokens) {
      return { error: 'Сервер не вернул токены. Попробуйте позже' };
    }
    
    setAuthCookies(res.tokens.accessToken, res.tokens.refreshToken);

    const roles = (res.user?.roles ?? []).map((r) =>
      typeof r === 'number'
        ? ({ 1: 'ROLE_ADMIN', 2: 'ROLE_MASTER', 3: 'ROLE_CLIENT' } as Record<number, string>)[r]
        : r,
    );
    const isMaster = roles.includes('ROLE_MASTER') || roles.includes('ROLE_ADMIN');

    redirect(
      returnTo ||
        (isMaster ? DEFAULT_MASTER_HOME : DEFAULT_CLIENT_HOME),
    );
  } catch (e) {
    return { error: mapAuthError(e) };
  }
}

export async function registerAction(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const roleRaw = String(formData.get('role') ?? 'client');
  const returnTo = String(formData.get('returnTo') ?? '');

  const role = roleRaw === 'master' ? 2 : 3;

  if (!name || !email || !password) {
    return { error: 'Заполните все поля' };
  }

  try {
    const res = await authClient.register({ name, email, password, role });

    if (!res.tokens) {
      return { error: 'Сервер не вернул токены. Попробуйте позже' };
    }
    
    setAuthCookies(res.tokens.accessToken, res.tokens.refreshToken);

    redirect(
      returnTo ||
        (roleRaw === 'master' ? DEFAULT_MASTER_HOME : DEFAULT_CLIENT_HOME),
    );
  } catch (e) {
    return { error: mapAuthError(e) };
  }
}

export async function logoutAction() {
  const refresh = (await cookies()).get(REFRESH_COOKIE)?.value;

  if (refresh) {
    try {
      await authClient.logout({ refreshToken: refresh });
    } catch {
      // игнорируем — всё равно чистим cookie
    }
  }

  (await cookies()).delete(ACCESS_COOKIE);
  (await cookies()).delete(REFRESH_COOKIE);

  redirect(LOGIN_PATH);
}

function mapAuthError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes('email already taken')) return 'Email уже занят';
  if (msg.includes('invalid credentials')) return 'Неверный email или пароль';
  if (msg.includes('password is too weak')) return 'Слишком простой пароль';
  if (msg.includes('password has been exposed'))
    return 'Этот пароль есть в утечках, выберите другой';
  if (msg.includes('invalid role for registration'))
    return 'Недопустимая роль';
  return 'Что-то пошло не так. Попробуйте позже';
}