import supabase from './_supabase.js';

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data: settings, error: settingsError } = await supabase
      .from('landing_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (settingsError) throw settingsError;

    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })
      .order('joined_date', { ascending: false });
    if (membersError) throw membersError;

    const approvedMembers = Array.isArray(members) ? members : [];
    const approvedMemberIds = new Set(approvedMembers.map((member) => member.id));

    const { data: certificates, error: certificatesError } = await supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false });
    if (certificatesError) throw certificatesError;

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (projectsError) throw projectsError;

    const memberLookup = new Map(approvedMembers.map((member) => [member.id, member]));
    const filteredCertificates = (certificates || []).filter((certificate) => approvedMemberIds.has(certificate.member_id));
    const filteredProjects = (projects || []).filter((project) => approvedMemberIds.has(project.member_id));

    const totalRepos = approvedMembers.reduce(
      (sum, member) => sum + toNumber(member.github_data?.public_repos),
      0,
    );
    const totalCommits = approvedMembers.reduce((sum, member) => {
      const gh = member.github_data || {};
      return sum + toNumber(gh.total_commits ?? gh.commit_count ?? gh.commits);
    }, 0);
    const githubProfiles = approvedMembers.filter((member) => member.github_data?.login || member.github_username).length;

    const topRepos = approvedMembers
      .flatMap((member) => {
        const repos = Array.isArray(member.github_data?.top_repos) ? member.github_data.top_repos : [];
        return repos.map((repo) => ({
          ...repo,
          member_id: member.id,
          member_name: member.full_name,
          member_slug: member.slug,
          member_avatar_url: member.avatar_url,
          member_github_username: member.github_username,
        }));
      })
      .sort((a, b) => toNumber(b.stars) - toNumber(a.stars))
      .slice(0, 6);

    const recentCertificates = filteredCertificates
      .slice(0, 6)
      .map((certificate) => ({
        ...certificate,
        member: memberLookup.get(certificate.member_id) || null,
      }));

    const featuredMembers = approvedMembers.filter((member) => member.is_featured).slice(0, 3);
    const visibleMembers = (featuredMembers.length > 0 ? featuredMembers : approvedMembers).slice(0, 6);

    return res.status(200).json({
      settings,
      stats: {
        members: approvedMembers.length,
        projects: filteredProjects.length,
        repos: totalRepos,
        certifications: filteredCertificates.length,
        commits: totalCommits,
        github_profiles: githubProfiles,
      },
      members: visibleMembers,
      featured_members: featuredMembers,
      top_repos: topRepos,
      recent_certificates: recentCertificates,
    });
  } catch (err) {
    console.error('Landing API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
