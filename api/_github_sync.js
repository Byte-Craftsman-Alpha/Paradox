function normalizeUrl(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeTwitterHandle(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().replace(/^@+/, '');
}

function uniqueStrings(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    if (!value || typeof value !== 'string') continue;
    const normalized = value.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

export async function syncGitHubForMember({ supabase, member_id, github_username, targetMember: providedTargetMember }) {
  if (!github_username) {
    throw new Error('GitHub username required');
  }

  const targetMember = providedTargetMember || (await supabase
    .from('team_members')
    .select('*')
    .eq('id', member_id)
    .single()).data;

  if (!targetMember) {
    throw new Error('Member not found');
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'paradox-profile-sync',
  };

  const ghRes = await fetch(`https://api.github.com/users/${github_username}`, { headers });
  if (!ghRes.ok) throw new Error('GitHub user not found');
  const ghData = await ghRes.json();

  const reposRes = await fetch(`https://api.github.com/users/${github_username}/repos?sort=updated&per_page=100`, { headers });
  const repos = reposRes.ok ? await reposRes.json() : [];
  const socialsRes = await fetch(`https://api.github.com/users/${github_username}/social_accounts?per_page=100`, { headers });
  const socialAccounts = socialsRes.ok ? await socialsRes.json() : [];

  const socials = {
    linkedin_url: '',
    twitter_handle: normalizeTwitterHandle(ghData.twitter_username),
    dribbble_url: '',
    websites: [],
  };

  for (const account of socialAccounts) {
    const provider = String(account.provider || '').toLowerCase();
    const url = normalizeUrl(account.url || '');
    const username = String(account.username || '').trim();
    if (!url && !username) continue;

    if (provider === 'linkedin' && !socials.linkedin_url) {
      socials.linkedin_url = url || (username ? `https://www.linkedin.com/in/${username}` : '');
    } else if ((provider === 'x' || provider === 'twitter') && !socials.twitter_handle) {
      socials.twitter_handle = normalizeTwitterHandle(username || account.url || '');
    } else if (provider === 'dribbble' && !socials.dribbble_url) {
      socials.dribbble_url = url || (username ? `https://dribbble.com/${username}` : '');
    } else if (url) {
      socials.websites.push(url);
    }
  }

  const languageCount = new Map();
  const topicCount = new Map();
  const topRepos = repos
    .slice()
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 8);

  for (const repo of repos) {
    if (repo.language) {
      const lang = String(repo.language).trim();
      languageCount.set(lang, (languageCount.get(lang) || 0) + 1);
    }
    if (Array.isArray(repo.topics)) {
      for (const topic of repo.topics) {
        const cleaned = String(topic || '').trim();
        if (!cleaned) continue;
        topicCount.set(cleaned, (topicCount.get(cleaned) || 0) + 1);
      }
    }
  }

  const topLanguages = [...languageCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);
  const topTopics = [...topicCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name]) => name);

  const github_data = {
    login: ghData.login,
    name: ghData.name,
    node_id: ghData.node_id,
    avatar_url: ghData.avatar_url,
    bio: ghData.bio,
    email: ghData.email,
    blog: ghData.blog,
    twitter_username: ghData.twitter_username,
    company: ghData.company,
    hireable: ghData.hireable,
    public_repos: ghData.public_repos,
    public_gists: ghData.public_gists,
    followers: ghData.followers,
    following: ghData.following,
    html_url: ghData.html_url,
    location: ghData.location,
    social_accounts: socialAccounts,
    top_languages: topLanguages,
    top_topics: topTopics,
    top_repos: topRepos.map((repo) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      topics: repo.topics || [],
      homepage: repo.homepage || '',
      url: repo.html_url,
    })),
    synced_at: new Date().toISOString(),
  };

  const existingSkills = Array.isArray(targetMember.skills) ? targetMember.skills : [];
  const mergedSkills = uniqueStrings([
    ...existingSkills,
    ...topLanguages,
    ...topTopics.map((topic) => topic.replace(/[-_]/g, ' ')),
  ]).slice(0, 30);

  const candidates = uniqueStrings([
    normalizeUrl(ghData.blog),
    ...socials.websites,
    ...topRepos.map((repo) => normalizeUrl(repo.homepage || '')),
  ]);

  const updateData = {
    github_data,
    github_username: ghData.login || github_username,
    full_name: ghData.name || targetMember.full_name,
    title: targetMember.title || (ghData.company ? `${ghData.company}` : targetMember.title),
    bio: ghData.bio || targetMember.bio,
    avatar_url: ghData.avatar_url || targetMember.avatar_url,
    location: ghData.location || targetMember.location,
    website: candidates[0] || targetMember.website,
    linkedin_url: socials.linkedin_url || targetMember.linkedin_url,
    twitter_handle: socials.twitter_handle || targetMember.twitter_handle,
    dribbble_url: socials.dribbble_url || targetMember.dribbble_url,
    phone: targetMember.phone || '',
    skills: mergedSkills,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('team_members')
    .update(updateData)
    .eq('id', member_id)
    .select()
    .single();

  if (error) throw error;

  return { member: data, github_data };
}
