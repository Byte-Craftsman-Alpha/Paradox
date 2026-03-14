import supabase from './_supabase.js';
import { getSession } from './_auth.js';
import { syncGitHubForMember } from './_github_sync.js';
import { syncAboutMeForMember } from './_aboutme_sync.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { slug, all } = req.query;
      if (slug) {
        const { data: member, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('slug', slug)
          .eq('is_approved', true)
          .single();
        if (error || !member) return res.status(404).json({ error: 'Member not found' });
        return res.status(200).json(member);
      }
      let query = supabase.from('team_members').select('*');
      if (all !== 'true') {
        query = query.eq('is_approved', true);
      } else {
        const session = await getSession(supabase, req);
        if (!session) return res.status(401).json({ error: 'Unauthorized' });
        const { data: adminMember } = await supabase
          .from('team_members')
          .select('role')
          .eq('user_id', session.user_id)
          .single();
        if (!adminMember || adminMember.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access required' });
        }
      }
      const { data, error } = await query.order('is_featured', { ascending: false }).order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const session = await getSession(supabase, req);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });

      const { id, ...updates } = req.body;
      const { data: requester } = await supabase
        .from('team_members')
        .select('role, user_id')
        .eq('user_id', session.user_id)
        .single();

      const { data: target } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!requester || !target) return res.status(404).json({ error: 'Not found' });
      const isAdmin = requester.role === 'admin';
      const isOwner = requester.user_id === target.user_id;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'You can only edit your own profile' });
      }

      if (!isAdmin) {
        delete updates.role;
        delete updates.is_approved;
        delete updates.is_featured;
      }

      updates.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      const { data: landingSettings } = await supabase
        .from('landing_settings')
        .select('*')
        .eq('id', 1)
        .single();

      const profileSyncFields = new Set([
        'full_name',
        'title',
        'bio',
        'avatar_url',
        'location',
        'phone',
        'website',
        'github_username',
        'linkedin_url',
        'twitter_handle',
        'dribbble_url',
        'resume_url',
        'skills',
      ]);
      const touchedProfileDetails = Object.keys(updates).some((key) => profileSyncFields.has(key));
      const shouldAutoSync = Boolean(
        touchedProfileDetails &&
        data?.github_username &&
        landingSettings &&
        (landingSettings.sync_mode === 'automatic' || landingSettings.sync_on_profile_save),
      );

      if (shouldAutoSync) {
        const synced = await syncGitHubForMember({
          supabase,
          member_id: data.id,
          github_username: data.github_username,
          targetMember: data,
        });
        return res.status(200).json(synced.member);
      }

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const session = await getSession(supabase, req);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });

      const { member_id, github_username, aboutme_url, sync_type } = req.body || {};
      const { data: requester } = await supabase
        .from('team_members')
        .select('id, user_id, role')
        .eq('user_id', session.user_id)
        .single();
      if (!requester) return res.status(403).json({ error: 'Profile not found for authenticated user' });

      const targetId = Number(member_id) || requester.id;
      const { data: targetMember } = await supabase.from('team_members').select('*').eq('id', targetId).single();
      if (!targetMember) return res.status(404).json({ error: 'Member not found' });

      const isAdmin = requester.role === 'admin';
      const isOwner = requester.user_id === targetMember.user_id;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'You can only sync your own profile' });
      }

      if (aboutme_url || sync_type === 'aboutme') {
        const normalizedUrl = typeof aboutme_url === 'string' ? aboutme_url.trim() : '';
        if (!normalizedUrl) return res.status(400).json({ error: 'aboutme.json URL is required' });

        const result = await syncAboutMeForMember({
          supabase,
          member_id: targetId,
          aboutme_url: normalizedUrl,
          targetMember,
        });
        return res.status(200).json({ member: result.member });
      }

      if (!github_username) return res.status(400).json({ error: 'GitHub username required' });

      const result = await syncGitHubForMember({
        supabase,
        member_id: targetId,
        github_username,
        targetMember,
      });

      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Members API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
