import supabase from './_supabase.js';
import { getSession } from './_auth.js';

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

    const ghRes = await fetch(`https://api.github.com/users/${github_username}`);
    if (!ghRes.ok) return res.status(404).json({ error: 'GitHub user not found' });
    const ghData = await ghRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${github_username}/repos?sort=stars&per_page=6&direction=desc`);
    const repos = reposRes.ok ? await reposRes.json() : [];

    const github_data = {
      login: ghData.login,
      name: ghData.name,
      avatar_url: ghData.avatar_url,
      bio: ghData.bio,
      public_repos: ghData.public_repos,
      followers: ghData.followers,
      following: ghData.following,
      html_url: ghData.html_url,
      company: ghData.company,
      blog: ghData.blog,
      location: ghData.location,
      top_repos: repos.map(r => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        url: r.html_url,
      })),
      synced_at: new Date().toISOString(),
    };

    const updateData = { github_data, github_username };
    if (ghData.avatar_url) updateData.avatar_url = ghData.avatar_url;

    const { data, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', member_id)
      .select()
      .single();
    if (error) throw error;

    return res.status(200).json({ member: data, github_data });
  } catch (err) {
    console.error('GitHub sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}
