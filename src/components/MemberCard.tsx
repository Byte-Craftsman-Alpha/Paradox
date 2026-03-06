import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Github, Linkedin, ExternalLink } from 'lucide-react';
import SkillBadge from './SkillBadge';
import type { Member } from '../lib/auth';

export default function MemberCard({ member, index = 0 }: { member: Member; index?: number }) {
  const skills = Array.isArray(member.skills) ? member.skills : (typeof member.skills === 'string' ? JSON.parse(member.skills) : []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link
        to={`/member/${member.slug}`}
        className="group block h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all duration-300 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <img
                src={member.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.slug}`}
                alt={member.full_name}
                className="w-14 h-14 rounded-xl ring-2 ring-white/10 group-hover:ring-emerald-500/30 transition-all"
              />
              {member.is_featured && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0a0a0f]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base truncate group-hover:text-emerald-400 transition-colors">
                {member.full_name}
              </h3>
              <p className="text-sm text-zinc-400 truncate">{member.title}</p>
              {member.location && (
                <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                  <MapPin className="w-3 h-3" />
                  {member.location}
                </div>
              )}
            </div>
          </div>

          {member.bio && (
            <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">{member.bio}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-4">
            {skills.slice(0, 5).map((s: string) => (
              <SkillBadge key={s} skill={s} />
            ))}
            {skills.length > 5 && (
              <span className="text-xs text-zinc-500 px-2 py-1">+{skills.length - 5}</span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
            {member.github_username && (
              <span className="text-zinc-500 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </span>
            )}
            {member.linkedin_url && (
              <span className="text-zinc-500 hover:text-blue-400 transition-colors">
                <Linkedin className="w-4 h-4" />
              </span>
            )}
            <span className="ml-auto text-xs text-zinc-600 group-hover:text-emerald-400/60 flex items-center gap-1 transition-colors">
              View Profile <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
