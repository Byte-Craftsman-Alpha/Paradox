import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import {
  adminSyncMembers,
  approveMember,
  fetchAdminStats,
  fetchLandingSettings,
  fetchMembers,
  fetchPendingMembers,
  updateLandingSettings,
  updateMember,
} from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  FolderGit2,
  Github,
  Globe,
  LandPlot,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Shield,
  Star,
  StarOff,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from 'lucide-react';
import type { Member } from '../lib/auth';

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
  sync_mode: 'manual' | 'automatic';
  sync_on_profile_save: boolean;
};

const defaults: LandingSettings = {
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

function toJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<Member[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [landingSettings, setLandingSettings] = useState<LandingSettings>(defaults);
  const [advancedDrafts, setAdvancedDrafts] = useState({
    hero_stats: toJson(defaults.hero_stats),
    mission_cards: toJson(defaults.mission_cards),
    core_stack_items: toJson(defaults.core_stack_items),
    team_filter_labels: toJson(defaults.team_filter_labels),
    achievement_items: toJson(defaults.achievement_items),
    contact_links: toJson(defaults.contact_links),
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [syncingMemberId, setSyncingMemberId] = useState<number | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [savingLanding, setSavingLanding] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/login');
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, m, landing] = await Promise.all([
        fetchAdminStats(),
        fetchPendingMembers(),
        fetchMembers(true),
        fetchLandingSettings(),
      ]);
      const merged = { ...defaults, ...landing };
      setStats(s);
      setPending(p);
      setAllMembers(m);
      setLandingSettings(merged);
      setAdvancedDrafts({
        hero_stats: toJson(merged.hero_stats),
        mission_cards: toJson(merged.mission_cards),
        core_stack_items: toJson(merged.core_stack_items),
        team_filter_labels: toJson(merged.team_filter_labels),
        achievement_items: toJson(merged.achievement_items),
        contact_links: toJson(merged.contact_links),
      });
    } catch (err: any) {
      console.error(err);
      showMessage('error', err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: number, approved: boolean) => {
    setProcessing(memberId);
    try {
      await approveMember(memberId, approved);
      await loadData();
      showMessage('success', approved ? 'Member approved.' : 'Member rejected.');
    } catch (err: any) {
      showMessage('error', err.message || 'Approval update failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleFeatured = async (member: Member) => {
    setProcessing(member.id);
    try {
      await updateMember(member.id, { is_featured: !member.is_featured });
      await loadData();
      showMessage('success', member.is_featured ? 'Removed from featured members.' : 'Marked as featured.');
    } catch (err: any) {
      showMessage('error', err.message || 'Featured update failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleSyncMember = async (memberId: number) => {
    setSyncingMemberId(memberId);
    try {
      await adminSyncMembers(memberId);
      await loadData();
      showMessage('success', 'Member GitHub data synced.');
    } catch (err: any) {
      showMessage('error', err.message || 'Member sync failed');
    } finally {
      setSyncingMemberId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const result = await adminSyncMembers();
      await loadData();
      showMessage('success', `Synced ${result.synced_count || 0} member GitHub profile(s).`);
    } catch (err: any) {
      showMessage('error', err.message || 'Bulk sync failed');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSaveLanding = async () => {
    setSavingLanding(true);
    try {
      const parsed = {
        hero_stats: JSON.parse(advancedDrafts.hero_stats),
        mission_cards: JSON.parse(advancedDrafts.mission_cards),
        core_stack_items: JSON.parse(advancedDrafts.core_stack_items),
        team_filter_labels: JSON.parse(advancedDrafts.team_filter_labels),
        achievement_items: JSON.parse(advancedDrafts.achievement_items),
        contact_links: JSON.parse(advancedDrafts.contact_links),
      };
      const updated = await updateLandingSettings({ ...landingSettings, ...parsed });
      const merged = { ...defaults, ...updated };
      setLandingSettings(merged);
      setAdvancedDrafts({
        hero_stats: toJson(merged.hero_stats),
        mission_cards: toJson(merged.mission_cards),
        core_stack_items: toJson(merged.core_stack_items),
        team_filter_labels: toJson(merged.team_filter_labels),
        achievement_items: toJson(merged.achievement_items),
        contact_links: toJson(merged.contact_links),
      });
      showMessage('success', 'Landing page settings updated.');
    } catch (err: any) {
      showMessage('error', err.message || 'Invalid advanced JSON or failed save');
    } finally {
      setSavingLanding(false);
    }
  };

  if (authLoading || loading) return <div className="pt-24"><LoadingSpinner text="Loading admin panel..." /></div>;
  if (!isAdmin) return null;

  const filteredMembers = allMembers.filter((member) =>
    !search ||
    member.full_name.toLowerCase().includes(search.toLowerCase()) ||
    member.title?.toLowerCase().includes(search.toLowerCase()) ||
    member.github_username?.toLowerCase().includes(search.toLowerCase()),
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pending', label: 'Pending', icon: Clock, count: pending.length },
    { id: 'members', label: 'All Members', icon: Users, count: allMembers.length },
    { id: 'landing', label: 'Landing & Sync', icon: Settings2 },
  ];

  const inputClass = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/40 transition-all';
  const labelClass = 'mb-1.5 block text-sm font-medium text-zinc-300';
  const textareaClass = `${inputClass} min-h-[180px] font-mono text-xs`;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-zinc-400 text-sm">Manage team members, landing page content, and GitHub sync behavior.</p>
        </motion.div>

        {message && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-1 mb-8 border-b border-white/[0.06] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'text-amber-400 border-amber-400' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.06] text-zinc-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Members', value: stats.total_members, icon: Users, iconClass: 'text-emerald-400' },
                { label: 'Pending', value: stats.pending_approvals, icon: Clock, iconClass: 'text-amber-400' },
                { label: 'Projects', value: stats.total_projects, icon: FolderGit2, iconClass: 'text-cyan-400' },
                { label: 'Certificates', value: stats.total_certificates, icon: Award, iconClass: 'text-fuchsia-400' },
                { label: 'Featured', value: stats.featured_members, icon: Star, iconClass: 'text-yellow-400' },
              ].map((card) => (
                <div key={card.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <card.icon className={`w-5 h-5 mb-3 ${card.iconClass}`} />
                  <div className="text-3xl font-bold text-white">{card.value}</div>
                  <div className="text-xs text-zinc-500 mt-1">{card.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'pending' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {pending.length === 0 ? (
              <div className="text-center py-16">
                <UserCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-zinc-400">No pending registrations. All caught up.</p>
              </div>
            ) : (
              pending.map((member) => (
                <div key={member.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img src={member.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.slug}`} className="w-12 h-12 rounded-xl" alt="" />
                      <div>
                        <h4 className="font-semibold text-white">{member.full_name}</h4>
                        <p className="text-sm text-zinc-400">{member.title || 'New member'}</p>
                        <p className="text-xs text-zinc-500 mt-1">Registered: {new Date(member.joined_date).toLocaleDateString()}</p>
                        {member.bio && <p className="text-sm text-zinc-400 mt-2 max-w-lg">{member.bio}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(member.id, true)} disabled={processing === member.id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-[#0a0a0f] text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 transition-all">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => handleApprove(member.id, false)} disabled={processing === member.id} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/25 disabled:opacity-50 transition-all border border-red-500/20">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input type="text" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/40 transition-all" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Member</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Featured</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">GitHub</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={member.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.slug}`} className="w-8 h-8 rounded-lg" alt="" />
                          <div>
                            <p className="text-sm font-medium text-white">{member.full_name}</p>
                            <p className="text-xs text-zinc-500">{member.title || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${member.role === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-500/15 text-zinc-400'}`}>{member.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1 w-fit ${member.is_approved ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {member.is_approved ? <><CheckCircle className="w-3 h-3" /> Approved</> : <><Clock className="w-3 h-3" /> Pending</>}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => handleToggleFeatured(member)} disabled={processing === member.id} className={`p-1.5 rounded-lg transition-all ${member.is_featured ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]'}`}>
                          {member.is_featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-zinc-400">
                          <div>{member.github_username || 'Not connected'}</div>
                          <div className="text-zinc-600 mt-1">{member.github_data?.synced_at ? `Last sync: ${new Date(member.github_data.synced_at).toLocaleString()}` : 'Never synced'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSyncMember(member.id)} disabled={!member.github_username || syncingMemberId === member.id} className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-all disabled:text-zinc-700 disabled:hover:bg-transparent" title="Sync GitHub">
                            <RefreshCw className={`w-4 h-4 ${syncingMemberId === member.id ? 'animate-spin' : ''}`} />
                          </button>
                          <Link to={`/member/${member.slug}`} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all" title="View profile">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {!member.is_approved && (
                            <>
                              <button onClick={() => handleApprove(member.id, true)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all" title="Approve">
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleApprove(member.id, false)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all" title="Reject">
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'landing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <LandPlot className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">Landing Page Content</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className={labelClass}>Hero Badge</label><input value={landingSettings.hero_badge} onChange={(e) => setLandingSettings({ ...landingSettings, hero_badge: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>Hero Title</label><input value={landingSettings.hero_title} onChange={(e) => setLandingSettings({ ...landingSettings, hero_title: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>Hero Tagline</label><input value={landingSettings.hero_tagline} onChange={(e) => setLandingSettings({ ...landingSettings, hero_tagline: e.target.value })} className={inputClass} /></div>
                  <div className="md:col-span-2"><label className={labelClass}>Hero Description</label><textarea value={landingSettings.hero_description} onChange={(e) => setLandingSettings({ ...landingSettings, hero_description: e.target.value })} rows={4} className={inputClass} /></div>
                  <div><label className={labelClass}>About Title</label><input value={landingSettings.about_title} onChange={(e) => setLandingSettings({ ...landingSettings, about_title: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>Mission Title</label><input value={landingSettings.mission_title} onChange={(e) => setLandingSettings({ ...landingSettings, mission_title: e.target.value })} className={inputClass} /></div>
                  <div className="md:col-span-2"><label className={labelClass}>Mission Description</label><textarea value={landingSettings.mission_description} onChange={(e) => setLandingSettings({ ...landingSettings, mission_description: e.target.value })} rows={4} className={inputClass} /></div>
                  <div><label className={labelClass}>Team Title</label><input value={landingSettings.team_title} onChange={(e) => setLandingSettings({ ...landingSettings, team_title: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>Team Description</label><input value={landingSettings.team_description} onChange={(e) => setLandingSettings({ ...landingSettings, team_description: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>Achievements Title</label><input value={landingSettings.achievements_title} onChange={(e) => setLandingSettings({ ...landingSettings, achievements_title: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>Contact Title</label><input value={landingSettings.contact_title} onChange={(e) => setLandingSettings({ ...landingSettings, contact_title: e.target.value })} className={inputClass} /></div>
                  <div className="md:col-span-2"><label className={labelClass}>Achievements Description</label><textarea value={landingSettings.achievements_description} onChange={(e) => setLandingSettings({ ...landingSettings, achievements_description: e.target.value })} rows={3} className={inputClass} /></div>
                  <div className="md:col-span-2"><label className={labelClass}>Contact Description</label><textarea value={landingSettings.contact_description} onChange={(e) => setLandingSettings({ ...landingSettings, contact_description: e.target.value })} rows={3} className={inputClass} /></div>
                  <div className="md:col-span-2"><label className={labelClass}>Contact Email</label><input value={landingSettings.contact_email} onChange={(e) => setLandingSettings({ ...landingSettings, contact_email: e.target.value })} className={inputClass} /></div>
                </div>
                <button onClick={handleSaveLanding} disabled={savingLanding} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-[#0a0a0f] transition hover:bg-amber-400 disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {savingLanding ? 'Saving...' : 'Save Landing Settings'}
                </button>
              </div>
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Github className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-white">Member & GitHub Sync</h2>
                  </div>
                  <label className={labelClass}>Sync Mode</label>
                  <div className="space-y-3 mb-4">
                    {[
                      { value: 'manual', title: 'Manual', description: 'Admins or members trigger GitHub refresh only when needed.' },
                      { value: 'automatic', title: 'Automatic', description: 'Profile saves refresh GitHub data automatically when a username exists.' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-black/20 p-4 cursor-pointer">
                        <input type="radio" name="sync_mode" checked={landingSettings.sync_mode === option.value} onChange={() => setLandingSettings({ ...landingSettings, sync_mode: option.value as 'manual' | 'automatic' })} className="mt-1" />
                        <div>
                          <div className="text-sm font-medium text-white">{option.title}</div>
                          <div className="text-xs text-zinc-500 mt-1">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input type="checkbox" checked={landingSettings.sync_on_profile_save} onChange={(e) => setLandingSettings({ ...landingSettings, sync_on_profile_save: e.target.checked })} />
                    Trigger GitHub sync after member profile saves
                  </label>
                  <div className="mt-6 space-y-3">
                    <button onClick={handleSyncAll} disabled={syncingAll} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-[#081018] transition hover:bg-cyan-400 disabled:opacity-50">
                      <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
                      {syncingAll ? 'Syncing all members...' : 'Sync All GitHub Profiles'}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Advanced Options</h3>
                  <p className="text-sm text-zinc-400 mb-4">Maintain mission tiles, core stack, team chips, achievements, stat tiles, and contact links with JSON arrays.</p>
                  <div className="space-y-4">
                    <div><label className={labelClass}>Hero Stats</label><textarea value={advancedDrafts.hero_stats} onChange={(e) => setAdvancedDrafts({ ...advancedDrafts, hero_stats: e.target.value })} className={textareaClass} /></div>
                    <div><label className={labelClass}>Mission Cards</label><textarea value={advancedDrafts.mission_cards} onChange={(e) => setAdvancedDrafts({ ...advancedDrafts, mission_cards: e.target.value })} className={textareaClass} /></div>
                    <div><label className={labelClass}>Core Stack Items</label><textarea value={advancedDrafts.core_stack_items} onChange={(e) => setAdvancedDrafts({ ...advancedDrafts, core_stack_items: e.target.value })} className={textareaClass} /></div>
                    <div><label className={labelClass}>Team Filter Labels</label><textarea value={advancedDrafts.team_filter_labels} onChange={(e) => setAdvancedDrafts({ ...advancedDrafts, team_filter_labels: e.target.value })} className={textareaClass} /></div>
                    <div><label className={labelClass}>Achievement Items</label><textarea value={advancedDrafts.achievement_items} onChange={(e) => setAdvancedDrafts({ ...advancedDrafts, achievement_items: e.target.value })} className={textareaClass} /></div>
                    <div><label className={labelClass}>Contact Links</label><textarea value={advancedDrafts.contact_links} onChange={(e) => setAdvancedDrafts({ ...advancedDrafts, contact_links: e.target.value })} className={textareaClass} /></div>
                  </div>
                  <button onClick={handleSaveLanding} disabled={savingLanding} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50">
                    <Globe className="w-4 h-4" />
                    {savingLanding ? 'Saving...' : 'Save Advanced Options'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
