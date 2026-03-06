export interface User {
  id: number;
  email: string;
}

export interface Member {
  id: number;
  user_id: number;
  full_name: string;
  slug: string;
  title: string;
  role: string;
  bio: string;
  avatar_url: string;
  location: string;
  phone: string;
  website: string;
  github_username: string;
  linkedin_url: string;
  twitter_handle: string;
  dribbble_url: string;
  resume_url: string;
  skills: string[];
  github_data: any;
  is_approved: boolean;
  is_featured: boolean;
  joined_date: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  member: Member | null;
  token: string | null;
  loading: boolean;
}

const TOKEN_KEY = 'nexus_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function fetchMe(): Promise<{ user: User; member: Member } | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      removeToken();
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setToken(data.token);
  return data;
}

export async function signup(email: string, password: string, full_name: string) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  setToken(data.token);
  return data;
}

export async function signout() {
  const token = getToken();
  if (token) {
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  removeToken();
}
