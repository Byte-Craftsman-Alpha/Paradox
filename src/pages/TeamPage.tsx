import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import MemberCard from '../components/MemberCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Member } from '../lib/auth';

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allSkills = [...new Set(members.flatMap(m => {
    const s = Array.isArray(m.skills) ? m.skills : (typeof m.skills === 'string' ? JSON.parse(m.skills) : []);
    return s;
  }))].sort();

  const filtered = members.filter(m => {
    const matchesSearch = !search ||
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.bio?.toLowerCase().includes(search.toLowerCase());
    const skills = Array.isArray(m.skills) ? m.skills : (typeof m.skills === 'string' ? JSON.parse(m.skills) : []);
    const matchesSkill = !skillFilter || skills.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Our Team</h1>
          <p className="text-zinc-400">The engineers building the future, one commit at a time.</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, title, or bio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <select
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm appearance-none focus:outline-none focus:border-emerald-500/40 transition-all min-w-[180px]"
            >
              <option value="" className="bg-[#0a0a0f]">All Skills</option>
              {allSkills.map(s => (
                <option key={s} value={s} className="bg-[#0a0a0f]">{s}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {loading ? (
          <LoadingSpinner text="Loading team members..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No members found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
