import type { Request, Response } from 'express';

export const AUTH_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Host-tazeen_session'
    : 'tazeen_session';

export function setAuthCookie(
  response: Response,
  token: string,
  expiresAt: Date,
): void {
  response.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });
}

export function clearAuthCookie(response: Response): void {
  response.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

export function getAuthToken(request: Request): string | null {
  const header = request.headers.cookie;

  if (!header) {
    return null;
  }

  const prefix = `${AUTH_COOKIE_NAME}=`;

  for (const part of header.split(';')) {
    const cookie = part.trim();

    if (cookie.startsWith(prefix)) {
      const value = cookie.slice(prefix.length);

      return value ? decodeURIComponent(value) : null;
    }
  }

  return null;
}
