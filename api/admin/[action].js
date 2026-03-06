import supabase from '../_supabase.js';
import { getSession } from '../_auth.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function requireAdmin(req, res) {
  const session = await getSession(supabase, req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const { data: admin } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', session.user_id)
    .single();
  if (!admin || admin.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return session;
}

async function pending(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requireAdmin(req, res))) return;
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_approved', false)
    .order('joined_date', { ascending: false });
  if (error) throw error;
  return res.status(200).json(data);
}

async function stats(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requireAdmin(req, res))) return;

  const { data: allMembers } = await supabase.from('team_members').select('id, is_approved, is_featured, role');
  const { data: allProjects } = await supabase.from('projects').select('id');
  const { data: allCerts } = await supabase.from('certificates').select('id');
  const { data: pendingMembers } = await supabase.from('team_members').select('id').eq('is_approved', false);

  return res.status(200).json({
    total_members: allMembers ? allMembers.filter((m) => m.is_approved).length : 0,
    pending_approvals: pendingMembers ? pendingMembers.length : 0,
    total_projects: allProjects ? allProjects.length : 0,
    total_certificates: allCerts ? allCerts.length : 0,
    featured_members: allMembers ? allMembers.filter((m) => m.is_featured).length : 0,
  });
}

async function approve(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requireAdmin(req, res))) return;

  const { member_id, approved } = req.body || {};
  if (approved) {
    const { data, error } = await supabase
      .from('team_members')
      .update({ is_approved: true })
      .eq('id', member_id)
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  }

  const { data: member } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('id', member_id)
    .single();
  if (member) {
    await supabase.from('team_members').delete().eq('id', member_id);
    await supabase.from('auth_sessions').delete().eq('user_id', member.user_id);
    await supabase.from('auth_users').delete().eq('id', member.user_id);
  }
  return res.status(200).json({ ok: true, rejected: true });
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const action = req.query?.action;
    if (action === 'pending') return pending(req, res);
    if (action === 'stats') return stats(req, res);
    if (action === 'approve') return approve(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Admin API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
