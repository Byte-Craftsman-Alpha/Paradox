import supabase from '../_supabase.js';
import { hashPassword, generateToken } from '../_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { data: existing } = await supabase
      .from('auth_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const password_hash = hashPassword(password);
    const { data: user, error: userError } = await supabase
      .from('auth_users')
      .insert({ email: email.toLowerCase(), password_hash })
      .select('id, email')
      .single();
    if (userError) throw userError;

    const slug = full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        user_id: user.id,
        full_name,
        slug: slug + '-' + user.id,
        role: 'member',
        is_approved: false,
      })
      .select()
      .single();
    if (memberError) throw memberError;

    const token = generateToken();
    await supabase.from('auth_sessions').insert({
      id: token,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return res.status(201).json({ user: { id: user.id, email: user.email }, member, token });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message });
  }
}
