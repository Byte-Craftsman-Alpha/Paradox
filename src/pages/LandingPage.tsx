import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Code2,
  ExternalLink,
  FolderGit2,
  Github,
  Globe,
  HeartHandshake,
  Lightbulb,
  Linkedin,
  Mail,
  Sparkles,
  Twitter,
  Users,
} from 'lucide-react';
import MemberCard from '../components/MemberCard';
import { fetchLandingData } from '../lib/api';
import type { Member } from '../lib/auth';

type LandingRepo = {
  name: string;
  description?: string;
  stars?: number;
  forks?: number;
  language?: string;
  url?: string;
  member_name: string;
  member_slug: string;
};

type LandingCertificate = {
  id: number;
  title: string;
  issuer: string;
  issue_date?: string;
  credential_url?: string;
  member: Member | null;
};

type LandingSettings = {
  hero_badge: string;
  hero_title: string;
  hero_tagline: string;
  hero_description: string;
  about_title: string;
  mission_title: string;
  mission_description: string;
  team_title: string;
  team_description: string;
  achievements_title: string;
  achievements_description: string;
  contact_title: string;
  contact_description: string;
  contact_email: string;
  hero_stats: Array<{ label: string; type: string }>;
  mission_cards: Array<{ icon: string; title: string; description: string }>;
  core_stack_items: string[];
  team_filter_labels: string[];
  achievement_items: Array<{ date: string; title: string; description: string }>;
  contact_links: Array<{ label: string; type: string; href?: string }>;
  sync_mode: string;
  sync_on_profile_save: boolean;
};

type LandingData = {
  settings?: LandingSettings;
  stats: {
    members: number;
    projects: number;
    repos: number;
    certifications: number;
    commits: number;
    github_profiles: number;
  };
  members: Member[];
  featured_members: Member[];
  top_repos: LandingRepo[];
  recent_certificates: LandingCertificate[];
};

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

function formatIssueDate(value?: string) {
  if (!value) return 'Recently added';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

const defaultSettings: LandingSettings = {
  hero_badge: 'IET Gorakhpur - Team Paradox',
  hero_title: 'Team Paradox',
  hero_tagline: 'Crafting digital solutions, one byte at a time',
  hero_description: 'We are a passionate team of student developers at IET Gorakhpur, building innovative projects, contributing to open source, and pushing the boundaries of technology.',
  about_title: 'Who We Are',
  mission_title: 'Our Mission',
  mission_description: 'To foster a collaborative environment where students can learn, build, and innovate together while making meaningful contributions to the tech community.',
  team_title: 'Our Team',
  team_description: 'The brilliant minds behind our projects and innovations.',
  achievements_title: 'Our Achievements',
  achievements_description: 'A live snapshot of team output from approved members, projects, repositories, and certifications.',
  contact_title: 'Get In Touch',
  contact_description: 'Interested in collaborating or joining the team? Reach out to us through the links below or create your profile to become part of the public directory.',
  contact_email: 'team@paradox.local',
  hero_stats: [
    { label: 'Team Members', type: 'members' },
    { label: 'GitHub Profiles', type: 'github_profiles' },
    { label: 'Projects / Repos', type: 'projects_repos' },
    { label: 'Engineers', type: 'members' },
  ],
  mission_cards: [
    { icon: 'Github', title: 'Open Source', description: 'Active contribution culture with synced repositories and public code visibility.' },
    { icon: 'Lightbulb', title: 'Innovation', description: 'A shared space to prototype, ship, and improve products with measurable output.' },
    { icon: 'BookOpen', title: 'Learning', description: 'Profiles capture evolving skills, certifications, and technical growth over time.' },
    { icon: 'HeartHandshake', title: 'Community', description: 'The platform makes it easier to discover teammates, work, and areas of expertise.' },
  ],
  core_stack_items: ['React/Next.js', 'Node.js', 'TypeScript', 'Python/ML', 'Git/GitHub', 'UI/UX'],
  team_filter_labels: ['All', 'Developers', 'GitHub Synced', 'Featured'],
  achievement_items: [
    { date: 'Live Data', title: 'Approved member directory is active', description: 'Approved member profiles currently power the landing page.' },
    { date: 'GitHub Sync', title: 'Repository data is synced', description: 'Connected GitHub profiles and public repos are indexed from the database.' },
    { date: 'Projects', title: 'Project showcase is ready', description: 'Project records are available for member portfolios.' },
    { date: 'Certificates', title: 'Certification tracking is enabled', description: 'Certificate records are stored for verified team members.' },
  ],
  contact_links: [
    { label: 'GitHub', type: 'member_github', href: '' },
    { label: 'LinkedIn', type: 'member_linkedin', href: '' },
    { label: 'Twitter', type: 'member_twitter', href: '' },
    { label: 'Website', type: 'member_website', href: '' },
    { label: 'Email', type: 'email', href: '' },
  ],
  sync_mode: 'manual',
  sync_on_profile_save: false,
};

const iconMap = {
  Github,
  Lightbulb,
  BookOpen,
  HeartHandshake,
  Globe,
  Linkedin,
  Twitter,
  Mail,
  Users,
  Code2,
  FolderGit2,
  Award,
} as const;

export default function LandingPage() {
  const [landing, setLanding] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingData()
      .then(setLanding)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = landing?.stats || {
    members: 0,
    projects: 0,
    repos: 0,
    certifications: 0,
    commits: 0,
    github_profiles: 0,
  };
  const members = landing?.members || [];
  const topRepos = landing?.top_repos || [];
  const recentCertificates = landing?.recent_certificates || [];
  const settings = { ...defaultSettings, ...(landing?.settings || {}) };
  const primaryMember = members[0] || null;

  const techStack = useMemo(() => {
    if (Array.isArray(settings.core_stack_items) && settings.core_stack_items.length > 0) {
      return settings.core_stack_items.filter(Boolean);
    }
    const fromMembers = members
      .flatMap((member) => (Array.isArray(member.skills) ? member.skills : []))
      .filter(Boolean)
      .slice(0, 8);
    return fromMembers.length > 0 ? fromMembers : defaultSettings.core_stack_items;
  }, [members, settings.core_stack_items]);

  const achievements = (settings.achievement_items.length > 0 ? settings.achievement_items : defaultSettings.achievement_items).map((item) => {
    const dynamicDescriptionMap: Record<string, string> = {
      'Approved member directory is active': `${formatCount(stats.members)} approved member profile${stats.members === 1 ? '' : 's'} currently power the landing page.`,
      'Repository data is synced': `${formatCount(stats.github_profiles)} GitHub profile${stats.github_profiles === 1 ? '' : 's'} connected with ${formatCount(stats.repos)} public repos indexed.`,
      'Project showcase is ready': `${formatCount(stats.projects)} project record${stats.projects === 1 ? '' : 's'} available from the database for member portfolios.`,
      'Certification tracking is enabled': `${formatCount(stats.certifications)} certificate record${stats.certifications === 1 ? '' : 's'} stored for verified team members.`,
    };
    return { ...item, description: dynamicDescriptionMap[item.title] || item.description };
  });

  const heroStats = (settings.hero_stats.length > 0 ? settings.hero_stats : defaultSettings.hero_stats).map((item) => {
    const valueMap: Record<string, { icon: typeof Users; value: string }> = {
      members: { icon: Users, value: formatCount(stats.members) },
      github_profiles: { icon: Github, value: formatCount(stats.github_profiles) },
      commits: { icon: Github, value: formatCount(stats.commits) },
      projects: { icon: FolderGit2, value: formatCount(stats.projects) },
      repos: { icon: FolderGit2, value: formatCount(stats.repos) },
      projects_repos: { icon: FolderGit2, value: `${formatCount(stats.projects)} / ${formatCount(stats.repos)}` },
      engineers: { icon: Code2, value: formatCount(stats.members) },
      certifications: { icon: Award, value: formatCount(stats.certifications) },
    };
    return { ...item, ...(valueMap[item.type] || valueMap.members) };
  });

  const missionCards = (settings.mission_cards.length > 0 ? settings.mission_cards : defaultSettings.mission_cards).map((item) => ({
    ...item,
    iconComponent: iconMap[item.icon as keyof typeof iconMap] || Github,
  }));

  const contactLinks = (settings.contact_links.length > 0 ? settings.contact_links : defaultSettings.contact_links)
    .map((item) => {
      const resolvedHref =
        item.type === 'member_github' ? (primaryMember?.github_username ? `https://github.com/${primaryMember.github_username}` : '') :
        item.type === 'member_linkedin' ? (primaryMember?.linkedin_url || '') :
        item.type === 'member_twitter' ? (primaryMember?.twitter_handle ? `https://twitter.com/${primaryMember.twitter_handle}` : '') :
        item.type === 'member_website' ? (primaryMember?.website || '') :
        item.type === 'email' ? `mailto:${settings.contact_email}` :
        (item.href || '');
      return {
        ...item,
        href: resolvedHref,
        iconComponent:
          item.type === 'member_linkedin' ? Linkedin :
          item.type === 'member_twitter' ? Twitter :
          item.type === 'member_website' ? Globe :
          item.type === 'email' ? Mail :
          Github,
      };
    })
    .filter((item) => item.href);

  return (
    <div className="min-h-screen bg-[#070b16] text-white">
      <section id="home" className="relative overflow-hidden pt-28 pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,93,255,0.22),transparent_34%),linear-gradient(180deg,#09111f_0%,#070b16_55%,#070b16_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(53,94,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(53,94,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute left-1/2 top-12 h-80 w-80 -translate-x-1/2 rounded-full bg-[#6f6bff]/20 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#6f6bff]/30 bg-[#6f6bff]/10 px-4 py-1.5 text-sm text-[#b8b6ff]">
              <Sparkles className="h-3.5 w-3.5" />
              {settings.hero_badge}
            </div>

            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-[#9d97ff] via-[#7d8dff] to-[#45d2ff] bg-clip-text text-transparent">
                {settings.hero_title}
              </span>
            </h1>

            <p className="mt-4 text-lg text-[#c3c8dc] sm:text-xl">{settings.hero_tagline}</p>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#8d94af] sm:text-base">{settings.hero_description}</p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/team" className="inline-flex items-center gap-2 rounded-xl bg-[#6f6bff] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#807cff]">
                Meet the Team
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#about" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Learn More
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-6 text-center shadow-[0_0_0_1px_rgba(111,107,255,0.05)]">
                <stat.icon className="mx-auto h-5 w-5 text-[#8b86ff]" />
                <div className="mt-3 text-3xl font-bold text-white">{loading ? '...' : stat.value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-[#7f88a8]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="about" className="relative border-t border-white/5 py-24">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(42,88,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(42,88,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-[#6f89ff]">About</div>
            <h2 className="mt-3 text-4xl font-bold text-white">{settings.about_title}</h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#6f6bff] to-[#3dd6ff]" />
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8">
              <h3 className="text-2xl font-semibold text-white">{settings.mission_title}</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9aa3be] sm:text-base">{settings.mission_description}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {missionCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6f6bff]/15 text-[#8b86ff]">
                        <card.iconComponent className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-base font-semibold text-white">{card.title}</div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#8d94af]">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8">
              <h3 className="text-2xl font-semibold text-white">Core Stack</h3>
              <p className="mt-4 text-sm leading-7 text-[#9aa3be]">Admin can maintain this list directly, or it can fall back to member skills when left empty.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {techStack.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-[#d8ddf0]">
                    {item}
                  </div>
                ))}
              </div>

              {topRepos.length > 0 ? (
                <div className="mt-8 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Top Repo</div>
                  <div className="mt-2 text-lg font-semibold text-white">{topRepos[0].name}</div>
                  <p className="mt-2 text-sm text-[#9aa3be]">{topRepos[0].description || 'Repository synced from GitHub.'}</p>
                  <a href={topRepos[0].url} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200">
                    Open repository
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section id="members" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-[#6f89ff]">Team</div>
            <h2 className="mt-3 text-4xl font-bold text-white">{settings.team_title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-[#8d94af] sm:text-base">{settings.team_description}</p>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#6f6bff] to-[#3dd6ff]" />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {(settings.team_filter_labels.length > 0 ? settings.team_filter_labels : defaultSettings.team_filter_labels).map((chip) => (
              <div key={chip} className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#a3abc7]">
                {chip}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          ) : members.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {members.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-[#8d94af]">
              No approved members are available yet.
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/team" className="inline-flex items-center gap-2 text-sm font-medium text-[#8b86ff] transition hover:text-[#b3afff]">
              View full directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="achievements" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-[#6f89ff]">Achievements</div>
            <h2 className="mt-3 text-4xl font-bold text-white">{settings.achievements_title}</h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#6f6bff] to-[#3dd6ff]" />
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#8d94af] sm:text-base">{settings.achievements_description}</p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
            <div className="relative">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-[#6f6bff] via-[#6f6bff]/50 to-transparent" />
              <div className="space-y-8">
                {achievements.map((item) => (
                  <div key={item.title} className="relative pl-10">
                    <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-[#070b16] bg-[#6f6bff]" />
                    <div className="text-xs uppercase tracking-[0.18em] text-[#7f88a8]">{item.date}</div>
                    <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#8d94af]">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Certification Records</div>
                    <div className="text-sm text-[#8d94af]">Latest entries from the certificates table.</div>
                  </div>
                </div>

                {recentCertificates.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {recentCertificates.slice(0, 3).map((certificate) => (
                      <div key={certificate.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <div className="text-sm font-semibold text-white">{certificate.title}</div>
                        <div className="mt-1 text-xs text-[#8d94af]">{certificate.issuer}</div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-xs text-[#7f88a8]">{formatIssueDate(certificate.issue_date)}</span>
                          {certificate.credential_url ? (
                            <a href={certificate.credential_url} target="_blank" rel="noopener" className="text-xs font-medium text-amber-300 hover:text-amber-200">
                              Verify
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-[#8d94af]">
                    No certification records are stored yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-[0.28em] text-[#6f89ff]">Contact</div>
          <h2 className="mt-3 text-4xl font-bold text-white">{settings.contact_title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#8d94af] sm:text-base">{settings.contact_description}</p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {contactLinks.map((item) => (
              <a
                key={`${item.label}-${item.href}`}
                href={item.href}
                target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={item.href.startsWith('mailto:') ? undefined : 'noopener'}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-[#dce1f3] transition hover:bg-white/[0.08]"
              >
                <item.iconComponent className="h-4 w-4 text-[#8b86ff]" />
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-12 text-sm text-[#6f7896]">
            <div>&copy; {new Date().getFullYear()} Team Paradox. All rights reserved.</div>
            <div className="mt-2">Made with live member data, GitHub sync, and admin-managed landing content.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
