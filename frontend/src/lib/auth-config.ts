export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

export const ACCESS_MAX_AGE = 15 * 60;           // 15 mins
export const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export const LOGIN_PATH = '/login';
export const FORBIDDEN_PATH = '/forbidden';
export const DEFAULT_CLIENT_HOME = '/app';
export const DEFAULT_MASTER_HOME = '/studio';

export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/masters',
  '/courses',
  '/forbidden',
];