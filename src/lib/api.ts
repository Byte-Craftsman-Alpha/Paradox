import { authHeaders } from './auth';

export async function fetchMembers(all = false) {
  const url = all ? '/api/members?all=true' : '/api/members';
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch members');
  return res.json();
}

export async function fetchMemberBySlug(slug: string) {
  const res = await fetch(`/api/members?slug=${slug}`);
  if (!res.ok) throw new Error('Member not found');
  return res.json();
}

export async function updateMember(id: number, updates: any) {
  const res = await fetch('/api/members', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error('Failed to update member');
  return res.json();
}

export async function fetchEducation(memberId: number) {
  const res = await fetch(`/api/education?member_id=${memberId}`);
  if (!res.ok) throw new Error('Failed to fetch education');
  return res.json();
}

export async function createEducation(data: any) {
  const res = await fetch('/api/education', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create education');
  return res.json();
}

export async function deleteEducation(id: number) {
  const res = await fetch('/api/education', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete education');
  return res.json();
}

export async function fetchExperience(memberId: number) {
  const res = await fetch(`/api/experience?member_id=${memberId}`);
  if (!res.ok) throw new Error('Failed to fetch experience');
  return res.json();
}

export async function createExperience(data: any) {
  const res = await fetch('/api/experience', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create experience');
  return res.json();
}

export async function deleteExperience(id: number) {
  const res = await fetch('/api/experience', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete experience');
  return res.json();
}

export async function fetchProjects(memberId: number) {
  const res = await fetch(`/api/projects?member_id=${memberId}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createProject(data: any) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function deleteProject(id: number) {
  const res = await fetch('/api/projects', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return res.json();
}

export async function fetchCertificates(memberId: number) {
  const res = await fetch(`/api/certificates?member_id=${memberId}`);
  if (!res.ok) throw new Error('Failed to fetch certificates');
  return res.json();
}

export async function createCertificate(data: any) {
  const res = await fetch('/api/certificates', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create certificate');
  return res.json();
}

export async function deleteCertificate(id: number) {
  const res = await fetch('/api/certificates', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete certificate');
  return res.json();
}

export async function syncGitHub(memberId: number, username: string) {
  const res = await fetch('/api/github-sync', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ member_id: memberId, github_username: username }),
  });
  if (!res.ok) throw new Error('GitHub sync failed');
  return res.json();
}

export async function fetchAdminStats() {
  const res = await fetch('/api/admin/stats', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchPendingMembers() {
  const res = await fetch('/api/admin/pending', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch pending');
  return res.json();
}

export async function approveMember(memberId: number, approved: boolean) {
  const res = await fetch('/api/admin/approve', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ member_id: memberId, approved }),
  });
  if (!res.ok) throw new Error('Failed to process approval');
  return res.json();
}
