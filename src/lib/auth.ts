import { apiUrl, parseApiPayload } from './http';

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
  aboutme_url: string;
  skills: string[];
  github_data: any;
  is_approved: boolean;
  is_featured: boolean;
  joined_date: string;
  updated_at: string;
}

export interface CaptchaChallenge {
  prompt: string;
  image_data: string;
  captcha_token: string;
}

export interface SignupOtpResponse {
  ok: boolean;
  requires_verification: boolean;
  email: string;
  message: string;
  expires_in_seconds: number;
  resend_in_seconds: number;
}

export interface AuthState {
  user: User | null;
  member: Member | null;
  token: string | null;
  loading: boolean;
}

const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY?.toString().trim() || 'nexus_token';

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
    const res = await fetch(apiUrl('/api/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      removeToken();
      return null;
    }
    return (await parseApiPayload(res)) as { user: User; member: Member } | null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  const res = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = (await parseApiPayload(res)) as any;
  if (!res.ok) throw new Error(data?.error || 'Login failed');
  if (!data?.token) throw new Error('Login response missing token');
  setToken(data.token);
  return data;
}

export async function signupWithVerification(email: string, password: string, full_name: string, captcha_token: string, captcha_answer: string): Promise<SignupOtpResponse> {
  const res = await fetch(apiUrl('/api/auth/signup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name, captcha_token, captcha_answer }),
  });
  const data = (await parseApiPayload(res)) as any;
  if (!res.ok) throw new Error(data?.error || 'Signup failed');
  return data as SignupOtpResponse;
}

export async function verifySignupOtp(email: string, otp: string) {
  const res = await fetch(apiUrl('/api/auth/verify-otp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const data = (await parseApiPayload(res)) as any;
  if (!res.ok) throw new Error(data?.error || 'OTP verification failed');
  return data;
}

export async function resendSignupOtp(email: string): Promise<SignupOtpResponse> {
  const res = await fetch(apiUrl('/api/auth/resend-otp'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = (await parseApiPayload(res)) as any;
  if (!res.ok) throw new Error(data?.error || 'Failed to resend OTP');
  return data as SignupOtpResponse;
}

export async function fetchCaptchaChallenge(): Promise<CaptchaChallenge> {
  const res = await fetch(apiUrl('/api/auth/captcha'));
  const data = (await parseApiPayload(res)) as CaptchaChallenge | any;
  if (!res.ok) throw new Error((data as any)?.error || 'Failed to load captcha');
  return data as CaptchaChallenge;
}

export async function signout() {
  const token = getToken();
  if (token) {
    await fetch(apiUrl('/api/auth/signout'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  removeToken();
}
