import supabase from './_supabase.js';
import { getSession } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { member_id } = req.query;
      let query = supabase.from('experience').select('*');
      if (member_id) query = query.eq('member_id', parseInt(member_id));
      const { data, error } = await query.order('is_current', { ascending: false }).order('start_date', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    const session = await getSession(supabase, req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const { data, error } = await supabase.from('experience').insert(req.body).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      const { data, error } = await supabase.from('experience').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('experience').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Experience API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
