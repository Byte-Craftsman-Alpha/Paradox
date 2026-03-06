const rawBase = import.meta.env.VITE_API_BASE_URL?.toString().trim() || '/api';

export const API_BASE_URL = rawBase.replace(/\/+$/, '') || '/api';

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/api') return API_BASE_URL;
  if (normalized.startsWith('/api/')) return `${API_BASE_URL}${normalized.slice(4)}`;
  return `${API_BASE_URL}${normalized}`;
}

export async function parseApiPayload(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text.slice(0, 180));
  }
}
