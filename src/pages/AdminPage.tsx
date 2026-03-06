import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { fetchAdminStats, fetchPendingMembers, fetchMembers, approveMember, updateMember } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Shield, Users, FolderGit2, Award, Clock, CheckCircle, XCircle,
  Star, StarOff, Eye, UserCheck, UserX, BarChart3, Search
} from 'lucide-react';
import type { Member } from '../lib/auth';

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<Member[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/login');
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, m] = await Promise.all([
        fetchAdminStats(),
        fetchPendingMembers(),
        fetchMembers(true),
      ]);
      setStats(s);
      setPending(p);
      setAllMembers(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: number, approved: boolean) => {
    setProcessing(memberId);
    try {
      await approveMember(memberId, approved);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleFeatured = async (m: Member) => {
    try {
      await updateMember(m.id, { is_featured: !m.is_featured });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) return <div className="pt-24"><LoadingSpinner text="Loading admin panel..." /></div>;
  if (!isAdmin) return null;

  const filteredMembers = allMembers.filter(m =>
    !search || m.full_name.toLowerCase().includes(search.toLowerCase()) || m.title?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pending', label: 'Pending', icon: Clock, count: pending.length },
    { id: 'members', label: 'All Members', icon: Users, count: allMembers.length },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-zinc-400 text-sm">Manage team members, approve registrations, and monitor team activity.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/[0.06] overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.06] text-zinc-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Members', value: stats.total_members, icon: Users, color: 'emerald' },
                { label: 'Pending', value: stats.pending_approvals, icon: Clock, color: 'amber' },
                { label: 'Projects', value: stats.total_projects, icon: FolderGit2, color: 'cyan' },
                { label: 'Certificates', value: stats.total_certificates, icon: Award, color: 'purple' },
                { label: 'Featured', value: stats.featured_members, icon: Star, color: 'yellow' },
              ].map((s, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <s.icon className={`w-5 h-5 text-${s.color}-400 mb-3`} />
                  <div className="text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {pending.length > 0 && (
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15">
                <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {pending.length} Pending Approval{pending.length > 1 ? 's' : ''}
                </h3>
                <div className="space-y-2">
                  {pending.slice(0, 3).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.slug}`} className="w-8 h-8 rounded-lg" alt="" />
                        <div>
                          <p className="text-sm font-medium text-white">{m.full_name}</p>
                          <p className="text-xs text-zinc-500">{m.title || 'New member'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(m.id, true)}
                          disabled={processing === m.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleApprove(m.id, false)}
                          disabled={processing === m.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Pending */}
        {activeTab === 'pending' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {pending.length === 0 ? (
              <div className="text-center py-16">
                <UserCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-zinc-400">No pending registrations. All caught up!</p>
              </div>
            ) : (
              pending.map(m => (
                <div key={m.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <img src={m.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.slug}`} className="w-12 h-12 rounded-xl" alt="" />
                      <div>
                        <h4 className="font-semibold text-white">{m.full_name}</h4>
                        <p className="text-sm text-zinc-400">{m.title || 'New member'}</p>
                        <p className="text-xs text-zinc-500 mt-1">Registered: {new Date(m.joined_date).toLocaleDateString()}</p>
                        {m.bio && <p className="text-sm text-zinc-400 mt-2 max-w-lg">{m.bio}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(m.id, true)}
                        disabled={processing === m.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-[#0a0a0f] text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleApprove(m.id, false)}
                        disabled={processing === m.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/25 disabled:opacity-50 transition-all border border-red-500/20"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* All Members */}
        {activeTab === 'members' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/40 transition-all"
                />
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
                    <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={m.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.slug}`} className="w-8 h-8 rounded-lg" alt="" />
                          <div>
                            <p className="text-sm font-medium text-white">{m.full_name}</p>
                            <p className="text-xs text-zinc-500">{m.title || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          m.role === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-500/15 text-zinc-400'
                        }`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1 w-fit ${
                          m.is_approved ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {m.is_approved ? <><CheckCircle className="w-3 h-3" /> Approved</> : <><Clock className="w-3 h-3" /> Pending</>}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(m)}
                          className={`p-1.5 rounded-lg transition-all ${
                            m.is_featured ? 'text-yellow-400 bg-yellow-400/10' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]'
                          }`}
                        >
                          {m.is_featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/member/${m.slug}`}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"
                            title="View profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {!m.is_approved && (
                            <>
                              <button
                                onClick={() => handleApprove(m.id, true)}
                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                title="Approve"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleApprove(m.id, false)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                                title="Reject"
                              >
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
      </div>
    </div>
  );
}
