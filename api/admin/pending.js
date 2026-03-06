import supabase from '../_supabase.js';
import { getSession } from '../_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

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

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_approved', false)
      .order('joined_date', { ascending: false });
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error('Pending API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
