import type { Session } from './types';

const SESSION_KEY = 'loan-booking-session-v3';
const API_URL = 'https://qolltaepagnlajnyofbk.supabase.co/functions/v1/loan-exact-api';

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function storeSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function post<T>(path: string, data: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, data }),
  });

  let response: (T & { error?: string }) | null = null;
  try {
    response = await res.json();
  } catch {
    throw new Error('تعذر قراءة استجابة الخادم المركزي');
  }

  if (!res.ok || (response && typeof response === 'object' && 'error' in response && response.error)) {
    throw new Error(response?.error || 'تعذر الاتصال بالخادم المركزي');
  }
  return response as T;
}

export async function login(username: string, password: string): Promise<Session> {
  return await post<Session>('/api/login', { username, password });
}

export async function appPost<T>(path: string, data: Record<string, unknown> = {}): Promise<T> {
  const session = readSession();
  if (!session) throw new Error('يجب تسجيل الدخول أولاً');
  return await post<T>(path, {
    ...data,
    sessionId: session.sessionId,
    token: session.token,
  });
}
