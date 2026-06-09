import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'zoostamp_session';

export type SessionData = {
  token: string;
  role: 'participant' | 'officer' | 'chief';
};

export async function setSession(token: string, role: 'participant' | 'officer' | 'chief') {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ token, role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session) return null;
  try {
    return JSON.parse(session.value) as SessionData;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
