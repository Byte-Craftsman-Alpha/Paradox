import supabase from './_supabase.js';
import { getSession } from './_auth.js';
import { syncGitHubForMember } from './_github_sync.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(supabase, req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { member_id, github_username } = req.body;
    if (!github_username) return res.status(400).json({ error: 'GitHub username required' });

    const { data: requester } = await supabase
      .from('team_members')
      .select('id, user_id, role')
      .eq('user_id', session.user_id)
      .single();
    if (!requester) return res.status(403).json({ error: 'Profile not found for authenticated user' });

    const { data: targetMember } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', member_id)
      .single();
    if (!targetMember) return res.status(404).json({ error: 'Member not found' });

    const isAdmin = requester.role === 'admin';
    const isOwner = requester.user_id === targetMember.user_id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You can only sync your own profile' });
    }

    const result = await syncGitHubForMember({
      supabase,
      member_id,
      github_username,
      targetMember,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('GitHub sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}
