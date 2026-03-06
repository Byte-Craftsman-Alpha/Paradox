import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Phone, Globe, Github, Linkedin, Twitter,
  Briefcase, GraduationCap, FolderGit2, Award, ExternalLink,
  Star, GitFork, ArrowLeft, FileText, Calendar
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchMemberBySlug, fetchEducation, fetchExperience, fetchProjects, fetchCertificates } from '../lib/api';
import type { Member } from '../lib/auth';

export default function MemberProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchMemberBySlug(slug)
      .then(async (m) => {
        setMember(m);
        const [edu, exp, proj, cert] = await Promise.all([
          fetchEducation(m.id),
          fetchExperience(m.id),
          fetchProjects(m.id),
          fetchCertificates(m.id),
        ]);
        setEducation(edu);
        setExperience(exp);
        setProjects(proj);
        setCertificates(cert);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-24"><LoadingSpinner text="Loading profile..." /></div>;
  if (!member) return (
    <div className="pt-24 text-center">
      <p className="text-zinc-400 text-lg">Member not found</p>
      <Link to="/team" className="text-emerald-400 mt-4 inline-block">Back to team</Link>
    </div>
  );

  const skills = Array.isArray(member.skills) ? member.skills : (typeof member.skills === 'string' ? JSON.parse(member.skills) : []);
  const ghData = member.github_data && typeof member.github_data === 'object' ? member.github_data : {};
  const topRepos = ghData.top_repos || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderGit2, count: projects.length },
    { id: 'experience', label: 'Experience', icon: Briefcase, count: experience.length },
    { id: 'education', label: 'Education', icon: GraduationCap, count: education.length },
    { id: 'certificates', label: 'Certificates', icon: Award, count: certificates.length },
  ];

  if (topRepos.length > 0) {
    tabs.push({ id: 'github', label: 'GitHub', icon: Github, count: topRepos.length });
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link to="/team" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to team
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start gap-6"
          >
            <img
              src={member.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.slug}`}
              alt={member.full_name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white/10"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">{member.full_name}</h1>
                {member.is_featured && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/20">Featured</span>
                )}
              </div>
              <p className="text-lg text-zinc-400 mb-3">{member.title}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                {member.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{member.location}</span>}
                {member.website && <a href={member.website} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-emerald-400 transition-colors"><Globe className="w-3.5 h-3.5" />{member.website.replace(/^https?:\/\//, '')}</a>}
                {member.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{member.phone}</span>}
              </div>

              <div className="flex items-center gap-3 mt-4">
                {member.github_username && (
                  <a href={`https://github.com/${member.github_username}`} target="_blank" rel="noopener" className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {member.linkedin_url && (
                  <a href={member.linkedin_url} target="_blank" rel="noopener" className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-blue-400 hover:border-blue-500/20 transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {member.twitter_handle && (
                  <a href={`https://twitter.com/${member.twitter_handle}`} target="_blank" rel="noopener" className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-sky-400 hover:border-sky-500/20 transition-all">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {member.resume_url && (
                  <a href={member.resume_url} target="_blank" rel="noopener" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all text-sm">
                    <FileText className="w-4 h-4" /> Resume
                  </a>
                )}
              </div>
            </div>

            {/* GitHub Stats */}
            {ghData.public_repos !== undefined && (
              <div className="flex sm:flex-col gap-4 sm:gap-2 text-center">
                <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xl font-bold text-white">{ghData.public_repos}</div>
                  <div className="text-xs text-zinc-500">Repos</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-xl font-bold text-white">{ghData.followers}</div>
                  <div className="text-xs text-zinc-500">Followers</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bio & Skills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            {member.bio && (
              <p className="text-zinc-300 leading-relaxed max-w-3xl mb-6">{member.bio}</p>
            )}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s: string) => <SkillBadge key={s} skill={s} />)}
              </div>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="mt-10 flex gap-1 overflow-x-auto pb-px border-b border-white/[0.06]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-emerald-400'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-zinc-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {experience.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-400" /> Latest Experience</h3>
                <div className="space-y-3">
                  {experience.slice(0, 2).map(exp => (
                    <div key={exp.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{exp.position}</h4>
                          <p className="text-sm text-zinc-400">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                        </div>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                        </span>
                      </div>
                      {exp.description && <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {projects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FolderGit2 className="w-4 h-4 text-emerald-400" /> Featured Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.filter(p => p.is_featured).slice(0, 2).map(proj => {
                    const tech = Array.isArray(proj.tech_stack) ? proj.tech_stack : (typeof proj.tech_stack === 'string' ? JSON.parse(proj.tech_stack) : []);
                    return (
                      <div key={proj.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <h4 className="font-semibold text-white mb-1">{proj.title}</h4>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{proj.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {tech.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">{t}</span>)}
                        </div>
                        <div className="flex gap-3">
                          {proj.live_url && <a href={proj.live_url} target="_blank" rel="noopener" className="text-xs text-emerald-400 flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" />Live</a>}
                          {proj.repo_url && <a href={proj.repo_url} target="_blank" rel="noopener" className="text-xs text-zinc-400 flex items-center gap-1 hover:text-white hover:underline"><Github className="w-3 h-3" />Code</a>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'experience' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {experience.length === 0 ? <p className="text-zinc-500 py-8 text-center">No experience listed yet.</p> : (
              <div className="relative">
                <div className="absolute left-[19px] top-6 bottom-6 w-px bg-white/[0.06]" />
                <div className="space-y-6">
                  {experience.map(exp => (
                    <div key={exp.id} className="relative pl-12">
                      <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-emerald-400/20 border-2 border-emerald-400" />
                      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-white text-base">{exp.position}</h4>
                            <p className="text-sm text-zinc-400">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {exp.is_current && <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-medium">Current</span>}
                            <span className="text-xs text-zinc-500">{exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}</span>
                          </div>
                        </div>
                        {exp.description && <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'education' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {education.length === 0 ? <p className="text-zinc-500 py-8 text-center">No education listed yet.</p> : (
              education.map(edu => (
                <div key={edu.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{edu.institution}</h4>
                      <p className="text-sm text-zinc-400">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500">{edu.start_date} – {edu.end_date || 'Present'}</span>
                      {edu.gpa && <p className="text-xs text-emerald-400 mt-0.5">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                  {edu.description && <p className="text-sm text-zinc-400 mt-2">{edu.description}</p>}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.length === 0 ? <p className="text-zinc-500 py-8 text-center col-span-2">No projects listed yet.</p> : (
              projects.map(proj => {
                const tech = Array.isArray(proj.tech_stack) ? proj.tech_stack : (typeof proj.tech_stack === 'string' ? JSON.parse(proj.tech_stack) : []);
                return (
                  <div key={proj.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white">{proj.title}</h4>
                      {proj.is_featured && <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-medium">Featured</span>}
                    </div>
                    <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tech.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">{t}</span>)}
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
                      {proj.live_url && <a href={proj.live_url} target="_blank" rel="noopener" className="text-xs text-emerald-400 flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" />Live Demo</a>}
                      {proj.repo_url && <a href={proj.repo_url} target="_blank" rel="noopener" className="text-xs text-zinc-400 flex items-center gap-1 hover:text-white hover:underline"><Github className="w-3 h-3" />Source Code</a>}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'certificates' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {certificates.length === 0 ? <p className="text-zinc-500 py-8 text-center">No certificates listed yet.</p> : (
              certificates.map(cert => (
                <div key={cert.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{cert.title}</h4>
                    <p className="text-sm text-zinc-400">{cert.issuer}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      {cert.issue_date && <span>Issued: {cert.issue_date}</span>}
                      {cert.expiry_date && <span>Expires: {cert.expiry_date}</span>}
                    </div>
                  </div>
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noopener" className="text-xs text-emerald-400 flex items-center gap-1 hover:underline flex-shrink-0">
                      <ExternalLink className="w-3 h-3" /> Verify
                    </a>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'github' && topRepos.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topRepos.map((repo: any, i: number) => (
              <a
                key={i}
                href={repo.url}
                target="_blank"
                rel="noopener"
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{repo.name}</h4>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{repo.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  {repo.language && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />{repo.language}</span>}
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>
                </div>
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
