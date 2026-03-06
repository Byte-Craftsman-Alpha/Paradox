import supabase from '../_supabase.js';
import { getSession } from '../_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const session = await getSession(supabase, req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { data: admin } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', session.user_id)
      .single();
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: allMembers } = await supabase.from('team_members').select('id, is_approved, is_featured, role');
    const { data: allProjects } = await supabase.from('projects').select('id');
    const { data: allCerts } = await supabase.from('certificates').select('id');
    const { data: pending } = await supabase.from('team_members').select('id').eq('is_approved', false);

    return res.status(200).json({
      total_members: allMembers ? allMembers.filter(m => m.is_approved).length : 0,
      pending_approvals: pending ? pending.length : 0,
      total_projects: allProjects ? allProjects.length : 0,
      total_certificates: allCerts ? allCerts.length : 0,
      featured_members: allMembers ? allMembers.filter(m => m.is_featured).length : 0,
    });
  } catch (err) {
    console.error('Stats API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
