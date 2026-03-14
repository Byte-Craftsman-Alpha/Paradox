import supabase from './_supabase.js';
import { getSession } from './_auth.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sanitizeText(value) {
  if (value === undefined || value === null) return '';
  return String(value || '').trim();
}

function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function normalizePayload(payload) {
  if (Array.isArray(payload)) return payload[0] || {};
  return payload || {};
}

function uniqueStrings(values) {
  const seen = new Set();
  const normalized = [];
  for (const value of values) {
    const candidate = sanitizeText(value);
    if (!candidate) continue;
    const key = candidate.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(candidate);
  }
  return normalized;
}

function normalizeExternalUrl(value) {
  const text = sanitizeText(value);
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

function parseLocation(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  const parts = [];
  for (const key of ['city', 'region', 'country', 'address', 'locality']) {
    const part = sanitizeText(value[key]);
    if (part) parts.push(part);
  }
  if (parts.length) return parts.join(', ');
  if (value.formatted) return sanitizeText(value.formatted);
  if (value.display) return sanitizeText(value.display);
  return '';
}

function parseDateRange(value) {
  const text = sanitizeText(value);
  if (!text) return { start: '', end: '' };
  const parts = text.split(/\\s*[-–—]\\s*/).filter(Boolean);
  if (parts.length >= 2) return { start: parts[0], end: parts[1] };
  const toParts = text.split(/\\s+to\\s+/i).filter(Boolean);
  if (toParts.length >= 2) return { start: toParts[0], end: toParts[1] };
  return { start: text, end: '' };
}

function findProfile(profiles, provider) {
  if (!Array.isArray(profiles)) return null;
  const needle = provider.toLowerCase();
  return profiles.find((profile) => {
    const network = (profile.network || profile.network_name || '').toString().toLowerCase();
    const host = (profile.host || '').toString().toLowerCase();
    return network.includes(needle) || host.includes(needle);
  }) || null;
}

function extractUsernameFromUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    if (!segments.length) return '';
    return segments[segments.length - 1];
  } catch {
    const cleaned = sanitizeText(rawUrl).replace(/^https?:\/\//i, '');
    const pieces = cleaned.split(/[\/]+/).filter(Boolean);
    return pieces[pieces.length - 1] || '';
  }
}

function parseSkills(raw) {
  if (!raw) return [];
  const collected = [];
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry === 'string') collected.push(entry);
      else if (entry?.name) collected.push(entry.name);
      if (Array.isArray(entry?.keywords)) collected.push(...entry.keywords);
    }
  } else if (typeof raw === 'string') {
    collected.push(...raw.split(/[,;/]+/));
  }
  return uniqueStrings(collected).slice(0, 40);
}

function parseTechnologies(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return uniqueStrings(raw);
  if (typeof raw === 'string') return uniqueStrings(raw.split(/[,;/]+/));
  return [];
}

function buildExperienceRows(list, memberId) {
  const entries = ensureArray(list);
  return entries
    .map((entry) => {
      const role = sanitizeText(entry.position || entry.role || entry.title || entry.designation);
      const company = sanitizeText(entry.company || entry.organization || entry.employer || entry.company_name);
      const start_date = sanitizeText(entry.startDate || entry.start_date || entry.from);
      const end_date = sanitizeText(entry.endDate || entry.end_date || entry.to);
      const is_current = Boolean(entry.current || entry.is_current || entry.present || entry.isPresent);
      const location = sanitizeText(entry.location || entry.area || entry.place || entry.city);
      const description = sanitizeText(entry.summary || entry.description || entry.details || entry.work_description);
      return {
        member_id: memberId,
        role,
        company,
        start_date,
        end_date,
        is_current,
        location,
        description,
      };
    })
    .filter((entry) => entry.company || entry.role || entry.description);
}

function buildEducationRows(list, memberId) {
  const entries = ensureArray(list);
  return entries
    .map((entry) => {
      const institution = sanitizeText(entry.institution || entry.school || entry.college || entry.institute_name);
      const degree = sanitizeText(entry.degree || entry.studyType || entry.program || entry.course_name);
      const field = sanitizeText(entry.field || entry.area || entry.field_of_study);
      let start_date = sanitizeText(entry.startDate || entry.start_date || entry.from);
      let end_date = sanitizeText(entry.endDate || entry.end_date || entry.to);
      if (!start_date && !end_date && entry.date) {
        const parsed = parseDateRange(entry.date);
        start_date = parsed.start;
        end_date = parsed.end;
      }
      let grade = sanitizeText(entry.grade || entry.score || entry.cgpa);
      if (!grade && entry.score && typeof entry.score === 'object') {
        const type = sanitizeText(entry.score.score_type);
        const value = sanitizeText(entry.score.score);
        grade = [value, type].filter(Boolean).join(' ');
      }
      const description = sanitizeText(entry.description || entry.summary);
      return {
        member_id: memberId,
        institution,
        degree,
        field,
        start_date,
        end_date,
        grade,
        description,
      };
    })
    .filter((entry) => entry.institution || entry.degree);
}

function buildProjectRows(list, memberId) {
  const entries = ensureArray(list);
  return entries
    .map((entry) => {
      const title = sanitizeText(entry.title || entry.name || entry.project || entry.project_title);
      if (!title) return null;
      const description = sanitizeText(entry.description || entry.summary || entry.details || entry.project_description);
      const project_url = normalizeExternalUrl(entry.url || entry.link || entry.project_url || entry.live_url || entry.project_link);
      const repo_url = normalizeExternalUrl(
        entry.repo || entry.repo_url || entry.github || entry.source || entry.code || entry.repository,
      );
      const technologies = parseTechnologies(
        entry.technologies || entry.tech_stack || entry.stack || entry.tags || entry.keywords || entry.core_technology,
      );
      const is_featured = Boolean(entry.is_featured || entry.featured || entry.highlighted);
      const image_url = normalizeExternalUrl(entry.image || entry.cover || entry.thumb || entry.image_url);
      return {
        member_id: memberId,
        title,
        description,
        project_url,
        repo_url,
        technologies,
        is_featured,
        image_url,
      };
    })
    .filter(Boolean);
}

function buildCertificateRows(list, memberId) {
  const entries = ensureArray(list);
  return entries
    .map((entry) => {
      const rawTitle = sanitizeText(entry.title || entry.name || entry.credential || entry.certification || entry.certificate_name);
      const certifiedFor = sanitizeText(entry.certified_for);
      const title = rawTitle && certifiedFor ? `${rawTitle} (${certifiedFor})` : rawTitle;
      if (!title) return null;
      const issuer = sanitizeText(entry.issuer || entry.institution || entry.provider || entry.issuing_authority);
      const issue_date = sanitizeText(entry.issueDate || entry.date || entry.issued);
      const expiry_date = sanitizeText(entry.expiryDate || entry.expires || entry.expiry);
      const credential_url = normalizeExternalUrl(entry.url || entry.link || entry.credential_url || entry.authority_logo);
      return {
        member_id: memberId,
        title,
        issuer,
        issue_date,
        expiry_date,
        credential_url,
      };
    })
    .filter(Boolean);
}

function buildMemberUpdates(payload, normalizedUrl) {
  const base = normalizePayload(payload);
  const basics = base?.basics || {};
  const profiles = Array.isArray(basics.profiles) ? basics.profiles : [];
  const updates = {};
  const setIf = (key, value) => {
    if (value) updates[key] = value;
  };

  setIf('full_name', sanitizeText(basics.name || base.name || base.full_name));
  setIf(
    'title',
    sanitizeText(
      basics.label ||
      basics.headline ||
      base.role ||
      base.label ||
      base.title ||
      base.current_profession ||
      base.current_company,
    ),
  );
  setIf('bio', sanitizeText(basics.summary || base.summary || base.bio || base.description));
  setIf(
    'avatar_url',
    normalizeExternalUrl(basics.image || base.picture || base.image || base.avatar || base.avatar_url || base.profile_photo),
  );
  setIf('location', parseLocation(basics.location || base.location || base.address));
  setIf('phone', sanitizeText(basics.phone || base.phone || base.contact?.phone));
  setIf(
    'website',
    normalizeExternalUrl(
      basics.website ||
      basics.url ||
      base.website ||
      base.url ||
      base.site ||
      base.social_accounts?.website,
    ),
  );
  setIf('resume_url', normalizeExternalUrl(basics.resume || base.resume || base.resume_url || base.resume_link));

  const githubProfile = findProfile(profiles, 'github');
  const githubUsername = sanitizeText(
    githubProfile?.username ||
    extractUsernameFromUrl(githubProfile?.url) ||
    base.github ||
    base.github_username ||
    extractUsernameFromUrl(base.social_accounts?.github),
  );
  setIf('github_username', githubUsername);

  const linkedinProfile = findProfile(profiles, 'linkedin');
  setIf(
    'linkedin_url',
    normalizeExternalUrl(linkedinProfile?.url || base.linkedin_url || base.social_accounts?.linkedin),
  );

  const twitterProfile = findProfile(profiles, 'twitter');
  let twitterHandle = sanitizeText(
    twitterProfile?.username ||
    extractUsernameFromUrl(twitterProfile?.url) ||
    base.twitter ||
    base.twitter_handle ||
    extractUsernameFromUrl(base.social_accounts?.twitter),
  );
  if (twitterHandle) {
    twitterHandle = twitterHandle.replace(/^@+/, '');
    updates.twitter_handle = twitterHandle;
  }

  const skillsSource = base.skills || basics.skills || base.skill_sets || base.technical_skills;
  const skills = parseSkills(skillsSource);
  if (skills.length) {
    updates.skills = skills;
  }

  updates.aboutme_url = normalizedUrl;
  updates.updated_at = new Date().toISOString();
  return updates;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(supabase, req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { member_id, aboutme_url } = req.body || {};
    const normalizedUrl = normalizeExternalUrl(aboutme_url);
    if (!normalizedUrl) return res.status(400).json({ error: 'aboutme.json URL is required' });

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

    let fetchResponse;
    try {
      fetchResponse = await fetch(normalizedUrl, {
        headers: { 'User-Agent': 'paradox-aboutme-sync' },
      });
    } catch (error) {
      return res.status(400).json({ error: 'Failed to reach aboutme.json URL' });
    }

    if (!fetchResponse.ok) {
      return res.status(400).json({ error: `Unable to fetch aboutme.json (status ${fetchResponse.status})` });
    }

    let payload;
    try {
      payload = await fetchResponse.json();
    } catch (error) {
      return res.status(400).json({ error: 'aboutme.json did not return valid JSON' });
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid aboutme.json payload' });
    }

    const base = normalizePayload(payload);
    const memberUpdates = buildMemberUpdates(base, normalizedUrl);
    const { data: updatedMember, error: updateError } = await supabase
      .from('team_members')
      .update(memberUpdates)
      .eq('id', targetId)
      .select()
      .single();
    if (updateError) throw updateError;

    await supabase.from('experience').delete().eq('member_id', targetId);
    await supabase.from('education').delete().eq('member_id', targetId);
    await supabase.from('projects').delete().eq('member_id', targetId);
    await supabase.from('certificates').delete().eq('member_id', targetId);

    const experienceRows = buildExperienceRows(base.work || base.experience || base.jobs, targetId);
    if (experienceRows.length) {
      await supabase.from('experience').insert(experienceRows);
    }

    const educationRows = buildEducationRows(base.education || base.schools, targetId);
    if (educationRows.length) {
      await supabase.from('education').insert(educationRows);
    }

    const projectRows = buildProjectRows(base.projects || base.portfolio, targetId);
    if (projectRows.length) {
      await supabase.from('projects').insert(projectRows);
    }

    const certificateRows = buildCertificateRows(base.certifications || base.certificates || base.awards, targetId);
    if (certificateRows.length) {
      await supabase.from('certificates').insert(certificateRows);
    }

    return res.status(200).json({ member: updatedMember });
  } catch (err) {
    console.error('AboutMe sync error:', err);
    const message = err instanceof Error ? err.message : String(err || 'Unable to sync profile');
    return res.status(500).json({ error: message });
  }
}
