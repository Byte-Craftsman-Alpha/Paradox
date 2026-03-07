import supabase from '../_supabase.js';
import { getSession, hashPassword, verifyPassword, generateToken } from '../_auth.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function login(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const normalizedEmail = email.toLowerCase();
  const adminEmail = (process.env.ADMIN_LOGIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_LOGIN_PASSWORD || '';
  const adminName = (process.env.ADMIN_FULL_NAME || 'Administrator').trim() || 'Administrator';

  if (adminEmail && adminPassword && normalizedEmail === adminEmail) {
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let { data: user } = await supabase
      .from('auth_users')
      .select('id, email')
      .eq('email', adminEmail)
      .single();

    if (!user) {
      const { data: createdUser, error: userError } = await supabase
        .from('auth_users')
        .insert({ email: adminEmail, password_hash: hashPassword(adminPassword) })
        .select('id, email')
        .single();
      if (userError) throw userError;
      user = createdUser;
    }

    let { data: member } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!member) {
      const slugBase = adminName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'admin';
      const { data: createdMember, error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          full_name: adminName,
          slug: `${slugBase}-${user.id}`,
          role: 'admin',
          title: 'Administrator',
          is_approved: true,
        })
        .select()
        .single();
      if (memberError) throw memberError;
      member = createdMember;
    } else if (member.role !== 'admin' || !member.is_approved) {
      const { data: updatedMember, error: updateError } = await supabase
        .from('team_members')
        .update({ role: 'admin', is_approved: true })
        .eq('id', member.id)
        .select()
        .single();
      if (updateError) throw updateError;
      member = updatedMember;
    }

    const token = generateToken();
    await supabase.from('auth_sessions').insert({
      id: token,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return res.status(200).json({
      user: { id: user.id, email: user.email },
      member,
      token,
    });
  }

  const { data: user, error } = await supabase
    .from('auth_users')
    .select('id, email, password_hash')
    .eq('email', normalizedEmail)
    .single();
  if (error || !user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { data: member } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const token = generateToken();
  await supabase.from('auth_sessions').insert({
    id: token,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return res.status(200).json({
    user: { id: user.id, email: user.email },
    member,
    token,
  });
}

async function signup(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password, full_name } = req.body || {};
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }
  const normalizedEmail = email.toLowerCase();
  const adminEmail = (process.env.ADMIN_LOGIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail && normalizedEmail === adminEmail) {
    return res.status(403).json({ error: 'This email is reserved for admin login' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const { data: existing } = await supabase
    .from('auth_users')
    .select('id')
    .eq('email', normalizedEmail)
    .single();
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const password_hash = hashPassword(password);
  const { data: user, error: userError } = await supabase
    .from('auth_users')
    .insert({ email: normalizedEmail, password_hash })
    .select('id, email')
    .single();
  if (userError) throw userError;

  const slug = full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .insert({
      user_id: user.id,
      full_name,
      slug: `${slug}-${user.id}`,
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
}

async function me(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];

  const { data: session } = await supabase
    .from('auth_sessions')
    .select('user_id')
    .eq('id', token)
    .gt('expires_at', new Date().toISOString())
    .single();
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const { data: user } = await supabase
    .from('auth_users')
    .select('id, email')
    .eq('id', session.user_id)
    .single();
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  const { data: member } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return res.status(200).json({ user, member });
}

async function signout(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    await supabase.from('auth_sessions').delete().eq('id', token);
  }
  return res.status(200).json({ ok: true });
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const action = req.query?.action;
    if (action === 'login') return login(req, res);
    if (action === 'signup') return signup(req, res);
    if (action === 'me') return me(req, res);
    if (action === 'signout') return signout(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Auth API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
