import { authHeaders } from './auth';
import { apiUrl, parseApiPayload } from './http';

async function requestJson(url: string, init?: RequestInit) {
  const res = await fetch(apiUrl(url), init);
  const data = await parseApiPayload(res);
  if (!res.ok) throw new Error((data as any)?.error || 'Request failed');
  return data;
}

export async function fetchMembers(all = false) {
  const url = all ? '/api/members?all=true' : '/api/members';
  return requestJson(url, { headers: authHeaders() });
}

export async function fetchMemberBySlug(slug: string) {
  return requestJson(`/api/members?slug=${slug}`);
}

export async function updateMember(id: number, updates: any) {
  return requestJson('/api/members', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function fetchEducation(memberId: number) {
  return requestJson(`/api/education?member_id=${memberId}`);
}

export async function createEducation(data: any) {
  return requestJson('/api/education', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function deleteEducation(id: number) {
  return requestJson('/api/education', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
}

export async function fetchExperience(memberId: number) {
  return requestJson(`/api/experience?member_id=${memberId}`);
}

export async function createExperience(data: any) {
  return requestJson('/api/experience', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function deleteExperience(id: number) {
  return requestJson('/api/experience', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
}

export async function fetchProjects(memberId: number) {
  return requestJson(`/api/projects?member_id=${memberId}`);
}

export async function createProject(data: any) {
  return requestJson('/api/projects', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: number) {
  return requestJson('/api/projects', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
}

export async function fetchCertificates(memberId: number) {
  return requestJson(`/api/certificates?member_id=${memberId}`);
}

export async function createCertificate(data: any) {
  return requestJson('/api/certificates', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function deleteCertificate(id: number) {
  return requestJson('/api/certificates', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
}

export async function syncGitHub(memberId: number, username: string) {
  return requestJson('/api/github-sync', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ member_id: memberId, github_username: username }),
  });
}

export async function fetchAdminStats() {
  return requestJson('/api/admin/stats', { headers: authHeaders() });
}

export async function fetchPendingMembers() {
  return requestJson('/api/admin/pending', { headers: authHeaders() });
}

export async function approveMember(memberId: number, approved: boolean) {
  return requestJson('/api/admin/approve', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ member_id: memberId, approved }),
  });
}
