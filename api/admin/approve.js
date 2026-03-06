import supabase from '../_supabase.js';
import { getSession } from '../_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

    const { member_id, approved } = req.body;
    if (approved) {
      const { data, error } = await supabase
        .from('team_members')
        .update({ is_approved: true })
        .eq('id', member_id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    } else {
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
  } catch (err) {
    console.error('Approve API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
