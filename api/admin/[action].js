import supabase from '../_supabase.js';
import { getSession } from '../_auth.js';
import { syncGitHubForMember } from '../_github_sync.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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

async function landing(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('landing_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const allowedFields = [
      'hero_badge',
      'hero_title',
      'hero_tagline',
      'hero_description',
      'about_title',
      'mission_title',
      'mission_description',
      'team_title',
      'team_description',
      'achievements_title',
      'achievements_description',
      'contact_title',
      'contact_description',
      'contact_email',
      'hero_stats',
      'mission_cards',
      'core_stack_items',
      'team_filter_labels',
      'achievement_items',
      'contact_links',
      'sync_mode',
      'sync_on_profile_save',
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key)),
    );
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('landing_settings')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function sync(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!(await requireAdmin(req, res))) return;

  const { member_id } = req.body || {};

  if (member_id) {
    const { data: member, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', member_id)
      .single();
    if (error || !member) return res.status(404).json({ error: 'Member not found' });
    if (!member.github_username) return res.status(400).json({ error: 'Member has no GitHub username' });

    const result = await syncGitHubForMember({
      supabase,
      member_id: member.id,
      github_username: member.github_username,
      targetMember: member,
    });
    return res.status(200).json({
      ok: true,
      synced_count: 1,
      members: [result.member],
    });
  }

  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_approved', true)
    .order('id', { ascending: true });
  if (error) throw error;

  const syncableMembers = (members || []).filter((member) => member.github_username);
  const syncedMembers = [];
  const skipped = [];

  for (const member of syncableMembers) {
    try {
      const result = await syncGitHubForMember({
        supabase,
        member_id: member.id,
        github_username: member.github_username,
        targetMember: member,
      });
      syncedMembers.push(result.member);
    } catch (err) {
      skipped.push({
        member_id: member.id,
        full_name: member.full_name,
        error: err.message,
      });
    }
  }

  return res.status(200).json({
    ok: true,
    synced_count: syncedMembers.length,
    skipped,
    members: syncedMembers,
  });
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const action = req.query?.action;
    if (action === 'pending') return pending(req, res);
    if (action === 'stats') return stats(req, res);
    if (action === 'approve') return approve(req, res);
    if (action === 'landing') return landing(req, res);
    if (action === 'sync') return sync(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Admin API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
