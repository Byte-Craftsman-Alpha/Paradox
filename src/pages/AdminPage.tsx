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
  Plus,
  Trash2,
  Edit,
  X,
  Lightbulb,
  BookOpen,
  HeartHandshake,
  Mail,
  ExternalLink as LinkIcon,
  Calendar,
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
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempHeroStats, setTempHeroStats] = useState<any[]>([]);
  const [tempMissionCards, setTempMissionCards] = useState<any[]>([]);
  const [tempCoreStackItems, setTempCoreStackItems] = useState<string[]>([]);
  const [tempTeamFilterLabels, setTempTeamFilterLabels] = useState<string[]>([]);
  const [tempAchievementItems, setTempAchievementItems] = useState<any[]>([]);
  const [tempContactLinks, setTempContactLinks] = useState<any[]>([]);

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

  const openAdvancedModal = (section: string) => {
    setEditingSection(section);
    switch (section) {
      case 'hero_stats':
        setTempHeroStats(landingSettings.hero_stats);
        break;
      case 'mission_cards':
        setTempMissionCards(landingSettings.mission_cards);
        break;
      case 'core_stack_items':
        setTempCoreStackItems(landingSettings.core_stack_items);
        break;
      case 'team_filter_labels':
        setTempTeamFilterLabels(landingSettings.team_filter_labels);
        break;
      case 'achievement_items':
        setTempAchievementItems(landingSettings.achievement_items);
        break;
      case 'contact_links':
        setTempContactLinks(landingSettings.contact_links);
        break;
    }
    setShowAdvancedModal(true);
  };

  const saveAdvancedSection = () => {
    const updatedSettings = { ...landingSettings };
    const updatedDrafts = { ...advancedDrafts };
    
    switch (editingSection) {
      case 'hero_stats':
        updatedSettings.hero_stats = tempHeroStats;
        updatedDrafts.hero_stats = toJson(tempHeroStats);
        break;
      case 'mission_cards':
        updatedSettings.mission_cards = tempMissionCards;
        updatedDrafts.mission_cards = toJson(tempMissionCards);
        break;
      case 'core_stack_items':
        updatedSettings.core_stack_items = tempCoreStackItems;
        updatedDrafts.core_stack_items = toJson(tempCoreStackItems);
        break;
      case 'team_filter_labels':
        updatedSettings.team_filter_labels = tempTeamFilterLabels;
        updatedDrafts.team_filter_labels = toJson(tempTeamFilterLabels);
        break;
      case 'achievement_items':
        updatedSettings.achievement_items = tempAchievementItems;
        updatedDrafts.achievement_items = toJson(tempAchievementItems);
        break;
      case 'contact_links':
        updatedSettings.contact_links = tempContactLinks;
        updatedDrafts.contact_links = toJson(tempContactLinks);
        break;
    }
    
    setLandingSettings(updatedSettings);
    setAdvancedDrafts(updatedDrafts);
    setShowAdvancedModal(false);
    setEditingSection(null);
    showMessage('success', `${editingSection?.replace('_', ' ') || 'section'} updated successfully`);
  };

  const addHeroStat = () => {
    setTempHeroStats([...tempHeroStats, { label: '', type: 'members' }]);
  };

  const removeHeroStat = (index: number) => {
    setTempHeroStats(tempHeroStats.filter((_, i) => i !== index));
  };

  const updateHeroStat = (index: number, field: string, value: string) => {
    const updated = [...tempHeroStats];
    updated[index] = { ...updated[index], [field]: value };
    setTempHeroStats(updated);
  };

  const addMissionCard = () => {
    setTempMissionCards([...tempMissionCards, { icon: 'Lightbulb', title: '', description: '' }]);
  };

  const removeMissionCard = (index: number) => {
    setTempMissionCards(tempMissionCards.filter((_, i) => i !== index));
  };

  const updateMissionCard = (index: number, field: string, value: string) => {
    const updated = [...tempMissionCards];
    updated[index] = { ...updated[index], [field]: value };
    setTempMissionCards(updated);
  };

  const addCoreStackItem = () => {
    setTempCoreStackItems([...tempCoreStackItems, '']);
  };

  const removeCoreStackItem = (index: number) => {
    setTempCoreStackItems(tempCoreStackItems.filter((_, i) => i !== index));
  };

  const updateCoreStackItem = (index: number, value: string) => {
    const updated = [...tempCoreStackItems];
    updated[index] = value;
    setTempCoreStackItems(updated);
  };

  const addTeamFilterLabel = () => {
    setTempTeamFilterLabels([...tempTeamFilterLabels, '']);
  };

  const removeTeamFilterLabel = (index: number) => {
    setTempTeamFilterLabels(tempTeamFilterLabels.filter((_, i) => i !== index));
  };

  const updateTeamFilterLabel = (index: number, value: string) => {
    const updated = [...tempTeamFilterLabels];
    updated[index] = value;
    setTempTeamFilterLabels(updated);
  };

  const addAchievementItem = () => {
    setTempAchievementItems([...tempAchievementItems, { date: '', title: '', description: '' }]);
  };

  const removeAchievementItem = (index: number) => {
    setTempAchievementItems(tempAchievementItems.filter((_, i) => i !== index));
  };

  const updateAchievementItem = (index: number, field: string, value: string) => {
    const updated = [...tempAchievementItems];
    updated[index] = { ...updated[index], [field]: value };
    setTempAchievementItems(updated);
  };

  const addContactLink = () => {
    setTempContactLinks([...tempContactLinks, { label: '', type: 'email', href: '' }]);
  };

  const removeContactLink = (index: number) => {
    setTempContactLinks(tempContactLinks.filter((_, i) => i !== index));
  };

  const updateContactLink = (index: number, field: string, value: string) => {
    const updated = [...tempContactLinks];
    updated[index] = { ...updated[index], [field]: value };
    setTempContactLinks(updated);
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
                  <p className="text-sm text-zinc-400 mb-6">Manage mission tiles, core stack, team chips, achievements, stat tiles, and contact links.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => openAdvancedModal('hero_stats')}
                      className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        <span className="font-medium text-white">Hero Stats</span>
                      </div>
                      <div className="text-xs text-zinc-500">{landingSettings.hero_stats.length} items</div>
                    </button>
                    
                    <button
                      onClick={() => openAdvancedModal('mission_cards')}
                      className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium text-white">Mission Cards</span>
                      </div>
                      <div className="text-xs text-zinc-500">{landingSettings.mission_cards.length} items</div>
                    </button>
                    
                    <button
                      onClick={() => openAdvancedModal('core_stack_items')}
                      className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Settings2 className="w-5 h-5 text-purple-400" />
                        <span className="font-medium text-white">Core Stack Items</span>
                      </div>
                      <div className="text-xs text-zinc-500">{landingSettings.core_stack_items.length} items</div>
                    </button>
                    
                    <button
                      onClick={() => openAdvancedModal('team_filter_labels')}
                      className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        <span className="font-medium text-white">Team Filter Labels</span>
                      </div>
                      <div className="text-xs text-zinc-500">{landingSettings.team_filter_labels.length} items</div>
                    </button>
                    
                    <button
                      onClick={() => openAdvancedModal('achievement_items')}
                      className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-fuchsia-400" />
                        <span className="font-medium text-white">Achievement Items</span>
                      </div>
                      <div className="text-xs text-zinc-500">{landingSettings.achievement_items.length} items</div>
                    </button>
                    
                    <button
                      onClick={() => openAdvancedModal('contact_links')}
                      className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <LinkIcon className="w-5 h-5 text-blue-400" />
                        <span className="font-medium text-white">Contact Links</span>
                      </div>
                      <div className="text-xs text-zinc-500">{landingSettings.contact_links.length} items</div>
                    </button>
                  </div>
                  
                  <button onClick={handleSaveLanding} disabled={savingLanding} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50">
                    <Globe className="w-4 h-4" />
                    {savingLanding ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Advanced Options Modal */}
      {showAdvancedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-white/[0.1] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/[0.1]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white capitalize">
                  {editingSection?.replace('_', ' ')} Management
                </h2>
                <button
                  onClick={() => setShowAdvancedModal(false)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Hero Stats Editor */}
              {editingSection === 'hero_stats' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Hero Stats Items</h3>
                    <button
                      onClick={addHeroStat}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#0a0a0f] rounded-lg font-medium hover:bg-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                  {tempHeroStats.map((stat, index) => (
                    <div key={index} className="p-4 border border-white/[0.1] rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-300">Item {index + 1}</span>
                        <button
                          onClick={() => removeHeroStat(index)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Label</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => updateHeroStat(index, 'label', e.target.value)}
                            className={inputClass}
                            placeholder="e.g., Team Members"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
                          <select
                            value={stat.type}
                            onChange={(e) => updateHeroStat(index, 'type', e.target.value)}
                            className={inputClass}
                          >
                            <option value="members">Members</option>
                            <option value="github_profiles">GitHub Profiles</option>
                            <option value="projects_repos">Projects/Repos</option>
                            <option value="certificates">Certificates</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Mission Cards Editor */}
              {editingSection === 'mission_cards' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Mission Cards</h3>
                    <button
                      onClick={addMissionCard}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#0a0a0f] rounded-lg font-medium hover:bg-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Card
                    </button>
                  </div>
                  {tempMissionCards.map((card, index) => (
                    <div key={index} className="p-4 border border-white/[0.1] rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-300">Card {index + 1}</span>
                        <button
                          onClick={() => removeMissionCard(index)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Icon</label>
                          <select
                            value={card.icon}
                            onChange={(e) => updateMissionCard(index, 'icon', e.target.value)}
                            className={inputClass}
                          >
                            <option value="Github">GitHub</option>
                            <option value="Lightbulb">Lightbulb</option>
                            <option value="BookOpen">Book Open</option>
                            <option value="HeartHandshake">Heart Handshake</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateMissionCard(index, 'title', e.target.value)}
                            className={inputClass}
                            placeholder="e.g., Open Source"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                          <textarea
                            value={card.description}
                            onChange={(e) => updateMissionCard(index, 'description', e.target.value)}
                            className={`${inputClass} min-h-[80px]`}
                            placeholder="Describe this mission..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Core Stack Items Editor */}
              {editingSection === 'core_stack_items' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Core Stack Items</h3>
                    <button
                      onClick={addCoreStackItem}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#0a0a0f] rounded-lg font-medium hover:bg-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                  {tempCoreStackItems.map((item, index) => (
                    <div key={index} className="p-4 border border-white/[0.1] rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateCoreStackItem(index, e.target.value)}
                          className={`${inputClass} flex-1`}
                          placeholder="e.g., React/Next.js"
                        />
                        <button
                          onClick={() => removeCoreStackItem(index)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Team Filter Labels Editor */}
              {editingSection === 'team_filter_labels' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Team Filter Labels</h3>
                    <button
                      onClick={addTeamFilterLabel}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#0a0a0f] rounded-lg font-medium hover:bg-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Label
                    </button>
                  </div>
                  {tempTeamFilterLabels.map((label, index) => (
                    <div key={index} className="p-4 border border-white/[0.1] rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => updateTeamFilterLabel(index, e.target.value)}
                          className={`${inputClass} flex-1`}
                          placeholder="e.g., Developers"
                        />
                        <button
                          onClick={() => removeTeamFilterLabel(index)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Achievement Items Editor */}
              {editingSection === 'achievement_items' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Achievement Items</h3>
                    <button
                      onClick={addAchievementItem}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#0a0a0f] rounded-lg font-medium hover:bg-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Achievement
                    </button>
                  </div>
                  {tempAchievementItems.map((item, index) => (
                    <div key={index} className="p-4 border border-white/[0.1] rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-300">Achievement {index + 1}</span>
                        <button
                          onClick={() => removeAchievementItem(index)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Date</label>
                          <input
                            type="text"
                            value={item.date}
                            onChange={(e) => updateAchievementItem(index, 'date', e.target.value)}
                            className={inputClass}
                            placeholder="e.g., Live Data"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateAchievementItem(index, 'title', e.target.value)}
                            className={inputClass}
                            placeholder="e.g., Member directory is active"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => updateAchievementItem(index, 'description', e.target.value)}
                            className={`${inputClass} min-h-[80px]`}
                            placeholder="Describe this achievement..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Contact Links Editor */}
              {editingSection === 'contact_links' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Contact Links</h3>
                    <button
                      onClick={addContactLink}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#0a0a0f] rounded-lg font-medium hover:bg-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Link
                    </button>
                  </div>
                  {tempContactLinks.map((link, index) => (
                    <div key={index} className="p-4 border border-white/[0.1] rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-300">Link {index + 1}</span>
                        <button
                          onClick={() => removeContactLink(index)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Label</label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => updateContactLink(index, 'label', e.target.value)}
                            className={inputClass}
                            placeholder="e.g., GitHub"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
                          <select
                            value={link.type}
                            onChange={(e) => updateContactLink(index, 'type', e.target.value)}
                            className={inputClass}
                          >
                            <option value="member_github">Member GitHub</option>
                            <option value="member_linkedin">Member LinkedIn</option>
                            <option value="member_twitter">Member Twitter</option>
                            <option value="member_website">Member Website</option>
                            <option value="email">Email</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1">URL (optional)</label>
                          <input
                            type="text"
                            value={link.href || ''}
                            onChange={(e) => updateContactLink(index, 'href', e.target.value)}
                            className={inputClass}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-white/[0.1] flex justify-end gap-3">
              <button
                onClick={() => setShowAdvancedModal(false)}
                className="px-4 py-2 rounded-lg border border-white/[0.2] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveAdvancedSection}
                className="px-4 py-2 rounded-lg bg-amber-500 text-[#0a0a0f] font-medium hover:bg-amber-400 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
