import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { updateMember, fetchEducation, fetchExperience, fetchProjects, fetchCertificates, createEducation, deleteEducation, createExperience, deleteExperience, createProject, deleteProject, createCertificate, deleteCertificate, syncGitHub, syncAboutMe } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Save, Github, RefreshCw, Plus, Trash2, User, Briefcase, GraduationCap,
  FolderGit2, Award, Globe, Linkedin, Twitter, MapPin, Phone, FileText,
  AlertCircle, CheckCircle, Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user, member, loading: authLoading, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingAboutMe, setSyncingAboutMe] = useState(false);
  const [aboutMeConfirmOpen, setAboutMeConfirmOpen] = useState(false);
  const [aboutMeConfirmUrl, setAboutMeConfirmUrl] = useState('');
  const [aboutMeConfirmSummary, setAboutMeConfirmSummary] = useState<{ name: string; skills: number; experience: number; education: number; projects: number; certificates: number } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [form, setForm] = useState({
    full_name: '', title: '', bio: '', location: '', phone: '',
    website: '', github_username: '', linkedin_url: '', twitter_handle: '',
    dribbble_url: '', resume_url: '', skills: '',
    aboutme_url: '',
  });

  // Sub-data
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Add forms
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '' });
  const [newExp, setNewExp] = useState({ company: '', position: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });
  const [newProj, setNewProj] = useState({ title: '', description: '', tech_stack: '', live_url: '', repo_url: '', is_featured: false });
  const [newCert, setNewCert] = useState({ title: '', issuer: '', issue_date: '', expiry_date: '', credential_url: '' });

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (member) {
      const skills = Array.isArray(member.skills) ? member.skills : (typeof member.skills === 'string' ? JSON.parse(member.skills) : []);
      setForm({
        full_name: member.full_name || '',
        title: member.title || '',
        bio: member.bio || '',
        location: member.location || '',
        phone: member.phone || '',
        website: member.website || '',
        github_username: member.github_username || '',
        linkedin_url: member.linkedin_url || '',
        twitter_handle: member.twitter_handle || '',
        dribbble_url: member.dribbble_url || '',
        resume_url: member.resume_url || '',
        aboutme_url: member.aboutme_url || '',
        skills: skills.join(', '),
      });
      loadSubData(member.id);
    }
  }, [member]);

  const loadSubData = async (memberId: number) => {
    const [edu, exp, proj, cert] = await Promise.all([
      fetchEducation(memberId), fetchExperience(memberId),
      fetchProjects(memberId), fetchCertificates(memberId),
    ]);
    setEducation((edu || []).map((e: any) => ({
      ...e,
      field_of_study: e.field_of_study || e.field || '',
      gpa: e.gpa || e.grade || '',
    })));
    setExperience((exp || []).map((e: any) => ({
      ...e,
      position: e.position || e.role || '',
    })));
    setProjects((proj || []).map((p: any) => ({
      ...p,
      tech_stack: p.tech_stack || p.technologies || [],
      live_url: p.live_url || p.project_url || '',
    })));
    setCertificates(cert);
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!member) return;
    setSaving(true);
    try {
      const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      await updateMember(member.id, { ...form, skills: skillsArr });
      await refreshAuth();
      showMsg('success', 'Profile updated successfully!');
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGitHubSync = async () => {
    if (!member || !form.github_username) return;
    setSyncing(true);
    try {
      await syncGitHub(member.id, form.github_username);
      await refreshAuth();
      if (member) await loadSubData(member.id);
      showMsg('success', 'GitHub profile synced!');
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setSyncing(false);
    }
  };

  const buildAboutMePayload = () => {
    const profile = {
      name: form.full_name || member?.full_name || '',
      profile_photo: member?.avatar_url || '',
      current_profession: form.title || member?.title || '',
      current_company: '',
      resume_link: form.resume_url || member?.resume_url || '',
      contact: {
        phone: form.phone || member?.phone || '',
        email: user?.email || '',
      },
      address: {
        city: form.location || member?.location || '',
        permanent_address: null,
        current_address: null,
      },
      social_accounts: {
        github: form.github_username ? `https://github.com/${form.github_username}` : '',
        linkedin: form.linkedin_url || '',
        instagram: '',
        twitter: form.twitter_handle ? `https://twitter.com/${form.twitter_handle.replace(/^@+/, '')}` : '',
      },
      bio: form.bio || member?.bio || '',
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      experience: experience.map((exp: any) => ({
        designation: exp.position || exp.role || '',
        company_name: exp.company || '',
        date: [exp.start_date, exp.end_date].filter(Boolean).join('-'),
        location: exp.location || '',
        work_description: exp.description || '',
      })),
      education: education.map((edu: any) => ({
        institute_logo: null,
        institute_name: edu.institution || '',
        course_type: edu.degree || '',
        course_name: edu.field_of_study || '',
        date: [edu.start_date, edu.end_date].filter(Boolean).join('-'),
        score: edu.gpa || null,
        skill_acquired: null,
      })),
      projects: projects.map((proj: any) => ({
        project_title: proj.title || '',
        project_type: proj.is_featured ? 'Featured' : 'Public',
        project_description: proj.description || '',
        core_technology: Array.isArray(proj.tech_stack) ? proj.tech_stack[0] || '' : '',
        repository: proj.repo_url || '',
        project_link: proj.live_url || '',
      })),
      certificates: certificates.map((cert: any) => ({
        authority_logo: '',
        certificate_name: cert.title || '',
        issuing_authority: cert.issuer || '',
        certified_for: '',
      })),
    };

    return [profile];
  };

  const downloadAboutMeJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportAboutMe = () => {
    const payload = buildAboutMePayload();
    downloadAboutMeJson(payload, 'aboutme.json');
    showMsg('success', 'aboutme.json exported!');
  };

  const normalizeAboutMePayload = (payload: any) => {
    if (Array.isArray(payload)) return payload[0] || {};
    return payload || {};
  };

  const isStringArray = (value: any) => Array.isArray(value) && value.every((item) => typeof item === 'string');

  const validateAboutMePayload = (payload: any) => {
    const errors: string[] = [];
    const base = normalizeAboutMePayload(payload);

    if (!base || typeof base !== 'object') {
      return { ok: false, errors: ['aboutme.json root must be an object or array with an object'], base: {} };
    }

    if (!base.name || typeof base.name !== 'string') {
      errors.push('Missing or invalid `name` (string expected).');
    }

    if (base.skills !== undefined && !isStringArray(base.skills)) {
      errors.push('`skills` should be an array of strings.');
    }

    for (const key of ['experience', 'education', 'projects', 'certificates']) {
      if (base[key] !== undefined && !Array.isArray(base[key])) {
        errors.push(`\`${key}\` should be an array.`);
      }
    }

    if (base.contact !== undefined && typeof base.contact !== 'object') {
      errors.push('`contact` should be an object with contact details.');
    }

    if (base.social_accounts !== undefined && typeof base.social_accounts !== 'object') {
      errors.push('`social_accounts` should be an object with profile links.');
    }

    return { ok: errors.length === 0, errors, base };
  };

  const openAboutMeConfirm = (url: string, base: any) => {
    setAboutMeConfirmUrl(url);
    setAboutMeConfirmSummary({
      name: typeof base?.name === 'string' ? base.name : '',
      skills: Array.isArray(base?.skills) ? base.skills.length : 0,
      experience: Array.isArray(base?.experience) ? base.experience.length : 0,
      education: Array.isArray(base?.education) ? base.education.length : 0,
      projects: Array.isArray(base?.projects) ? base.projects.length : 0,
      certificates: Array.isArray(base?.certificates) ? base.certificates.length : 0,
    });
    setAboutMeConfirmOpen(true);
  };

  const closeAboutMeConfirm = () => {
    setAboutMeConfirmOpen(false);
  };

  const confirmAboutMeSync = async () => {
    if (!member || !aboutMeConfirmUrl) return;
    setAboutMeConfirmOpen(false);
    setSyncingAboutMe(true);
    try {
      await syncAboutMe(member.id, aboutMeConfirmUrl);
      await refreshAuth();
      if (member) await loadSubData(member.id);
      showMsg('success', 'Profile synced from aboutme.json!');
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setSyncingAboutMe(false);
    }
  };

  const handleAboutMeSync = async () => {
    if (!member || !form.aboutme_url) return;
    setSyncingAboutMe(true);
    try {
      let payload: any;
      try {
        const res = await fetch(form.aboutme_url.trim());
        if (!res.ok) throw new Error(`Unable to fetch aboutme.json (status ${res.status})`);
        payload = await res.json();
      } catch (err: any) {
        throw new Error(err?.message || 'Failed to fetch or parse aboutme.json');
      }

      const validation = validateAboutMePayload(payload);
      if (!validation.ok) {
        showMsg('error', `Validation failed: ${validation.errors.join(' ')}`);
        return;
      }

      setSyncingAboutMe(false);
      openAboutMeConfirm(form.aboutme_url.trim(), validation.base);
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setSyncingAboutMe(false);
    }
  };

  const handleAddEdu = async () => {
    if (!member || !newEdu.institution) return;
    try {
      await createEducation({
        member_id: member.id,
        institution: newEdu.institution,
        degree: newEdu.degree,
        field: newEdu.field_of_study,
        start_date: newEdu.start_date,
        end_date: newEdu.end_date,
        grade: newEdu.gpa,
      });
      await loadSubData(member.id);
      setNewEdu({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '' });
      showMsg('success', 'Education added!');
    } catch (err: any) { showMsg('error', err.message); }
  };

  const handleAddExp = async () => {
    if (!member || !newExp.company || !newExp.position) return;
    try {
      await createExperience({
        member_id: member.id,
        company: newExp.company,
        role: newExp.position,
        location: newExp.location,
        start_date: newExp.start_date,
        end_date: newExp.end_date,
        is_current: newExp.is_current,
        description: newExp.description,
      });
      await loadSubData(member.id);
      setNewExp({ company: '', position: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });
      showMsg('success', 'Experience added!');
    } catch (err: any) { showMsg('error', err.message); }
  };

  const handleAddProj = async () => {
    if (!member || !newProj.title) return;
    try {
      const techArr = newProj.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
      await createProject({
        member_id: member.id,
        title: newProj.title,
        description: newProj.description,
        technologies: techArr,
        project_url: newProj.live_url,
        repo_url: newProj.repo_url,
        is_featured: newProj.is_featured,
      });
      await loadSubData(member.id);
      setNewProj({ title: '', description: '', tech_stack: '', live_url: '', repo_url: '', is_featured: false });
      showMsg('success', 'Project added!');
    } catch (err: any) { showMsg('error', err.message); }
  };

  const handleAddCert = async () => {
    if (!member || !newCert.title) return;
    try {
      await createCertificate({ ...newCert, member_id: member.id });
      await loadSubData(member.id);
      setNewCert({ title: '', issuer: '', issue_date: '', expiry_date: '', credential_url: '' });
      showMsg('success', 'Certificate added!');
    } catch (err: any) { showMsg('error', err.message); }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!member) return;
    try {
      if (type === 'education') await deleteEducation(id);
      if (type === 'experience') await deleteExperience(id);
      if (type === 'project') await deleteProject(id);
      if (type === 'certificate') await deleteCertificate(id);
      await loadSubData(member.id);
      showMsg('success', 'Item deleted!');
    } catch (err: any) { showMsg('error', err.message); }
  };

  if (authLoading) return <div className="pt-24"><LoadingSpinner /></div>;
  if (!user || !member) return null;

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all";
  const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";

  return (
    <>
      {aboutMeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeAboutMeConfirm} />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#0b0b12] p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white">Confirm AboutMe Sync</h3>
            <p className="text-sm text-zinc-400 mt-2">
              This will overwrite your experience, education, projects, and certificates with data from the provided
              aboutme.json file.
            </p>

            {aboutMeConfirmSummary && (
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-zinc-300 space-y-2">
                {aboutMeConfirmSummary.name && (
                  <div>
                    <span className="text-zinc-500">Name:</span> {aboutMeConfirmSummary.name}
                  </div>
                )}
                <div>
                  <span className="text-zinc-500">Skills:</span> {aboutMeConfirmSummary.skills}
                </div>
                <div>
                  <span className="text-zinc-500">Experience:</span> {aboutMeConfirmSummary.experience}
                </div>
                <div>
                  <span className="text-zinc-500">Education:</span> {aboutMeConfirmSummary.education}
                </div>
                <div>
                  <span className="text-zinc-500">Projects:</span> {aboutMeConfirmSummary.projects}
                </div>
                <div>
                  <span className="text-zinc-500">Certificates:</span> {aboutMeConfirmSummary.certificates}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeAboutMeConfirm}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-zinc-300 text-sm font-medium hover:text-white hover:bg-white/[0.1] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmAboutMeSync}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-[#0a0a0f] text-sm font-semibold hover:bg-emerald-400 transition-all"
              >
                Sync Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            {!member.is_approved && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <Clock className="w-3 h-3" /> Pending Approval
              </span>
            )}
            {member.is_approved && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <CheckCircle className="w-3 h-3" /> Approved
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm">Manage your team profile, experience, projects, and more.</p>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-3 rounded-xl flex items-center gap-2 text-sm ${
              message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === s.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeSection === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-emerald-400" /> Quick Sync</h2>
                <div>
                  <label className={labelClass}><Github className="w-3.5 h-3.5 inline mr-1" />GitHub Username</label>
                  <div className="flex gap-3">
                    <input value={form.github_username} onChange={e => setForm({...form, github_username: e.target.value})} className={inputClass + ' flex-1'} placeholder="GitHub username" />
                    <button
                      onClick={handleGitHubSync}
                      disabled={syncing || !form.github_username}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                      {syncing ? 'Syncing...' : 'Sync GitHub'}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}><FileText className="w-3.5 h-3.5 inline mr-1" />AboutMe JSON URL</label>
                  <div className="flex gap-3">
                    <input
                      value={form.aboutme_url}
                      onChange={e => setForm({ ...form, aboutme_url: e.target.value })}
                      className={inputClass + ' flex-1'}
                      placeholder="https://raw.githubusercontent.com/Anshika9838/Anshika9838/refs/heads/main/aboutme.json"
                    />
                    <button
                      onClick={handleAboutMeSync}
                      disabled={syncingAboutMe || !form.aboutme_url}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncingAboutMe ? 'animate-spin' : ''}`} />
                      {syncingAboutMe ? 'Syncing...' : 'Sync aboutme.json'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <button
                      onClick={handleExportAboutMe}
                      className="px-4 py-2 rounded-xl bg-white/[0.06] text-zinc-300 text-xs font-medium hover:text-white hover:bg-white/[0.1] transition-all"
                    >
                      Export my aboutme.json
                    </button>
                    <a
                      href="/aboutme.demo.json"
                      download
                      className="px-4 py-2 rounded-xl bg-white/[0.06] text-zinc-300 text-xs font-medium hover:text-white hover:bg-white/[0.1] transition-all"
                    >
                      Download demo aboutme.json
                    </a>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Paste the raw <code>aboutme.json</code> URL (for example, https://raw.githubusercontent.com/Anshika9838/Anshika9838/refs/heads/main/aboutme.json) to mirror your published profile.
                    Updates replace experience, education, projects, and certificates with the values from the file.
                  </p>
                </div>
                <p className="text-xs text-zinc-500 mt-3">
                  Sync first to auto-fill profile details, avatar, and project data from GitHub.
                </p>
              </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><User className="w-5 h-5 text-emerald-400" /> Basic Info</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Full Name</label><input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Title / Role</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} placeholder="Senior Frontend Engineer" /></div>
                    <div><label className={labelClass}><MapPin className="w-3.5 h-3.5 inline mr-1" />Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inputClass} placeholder="San Francisco, CA" /></div>
                    <div><label className={labelClass}><Phone className="w-3.5 h-3.5 inline mr-1" />Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} placeholder="+1-555-0101" /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Bio</label><textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} className={inputClass} placeholder="Tell us about yourself..." /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Skills (comma-separated)</label><input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className={inputClass} placeholder="React, TypeScript, Node.js, Python" /></div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><Globe className="w-5 h-5 text-emerald-400" /> Links & Socials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}><Globe className="w-3.5 h-3.5 inline mr-1" />Website</label><input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className={inputClass} placeholder="https://yoursite.dev" /></div>
                    <div><label className={labelClass}><FileText className="w-3.5 h-3.5 inline mr-1" />Resume URL</label><input value={form.resume_url} onChange={e => setForm({...form, resume_url: e.target.value})} className={inputClass} placeholder="https://drive.google.com/..." /></div>
                    <div><label className={labelClass}><Linkedin className="w-3.5 h-3.5 inline mr-1" />LinkedIn URL</label><input value={form.linkedin_url} onChange={e => setForm({...form, linkedin_url: e.target.value})} className={inputClass} placeholder="https://linkedin.com/in/..." /></div>
                    <div><label className={labelClass}><Twitter className="w-3.5 h-3.5 inline mr-1" />Twitter Handle</label><input value={form.twitter_handle} onChange={e => setForm({...form, twitter_handle: e.target.value})} className={inputClass} placeholder="@yourhandle" /></div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-[#0a0a0f] font-semibold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </motion.div>
            )}

            {activeSection === 'experience' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Add Experience</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className={labelClass}>Company *</label><input value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Position *</label><input value={newExp.position} onChange={e => setNewExp({...newExp, position: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Location</label><input value={newExp.location} onChange={e => setNewExp({...newExp, location: e.target.value})} className={inputClass} /></div>
                    <div className="flex gap-3">
                      <div className="flex-1"><label className={labelClass}>Start</label><input value={newExp.start_date} onChange={e => setNewExp({...newExp, start_date: e.target.value})} className={inputClass} placeholder="2023-01" /></div>
                      <div className="flex-1"><label className={labelClass}>End</label><input value={newExp.end_date} onChange={e => setNewExp({...newExp, end_date: e.target.value})} className={inputClass} placeholder="2024-06" disabled={newExp.is_current} /></div>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input type="checkbox" checked={newExp.is_current} onChange={e => setNewExp({...newExp, is_current: e.target.checked, end_date: ''})} className="rounded" />
                      <label className="text-sm text-zinc-300">Currently working here</label>
                    </div>
                    <div className="md:col-span-2"><label className={labelClass}>Description</label><textarea value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} rows={2} className={inputClass} /></div>
                  </div>
                  <button onClick={handleAddExp} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-[#0a0a0f] font-semibold text-sm hover:bg-emerald-400 transition-all"><Plus className="w-4 h-4" /> Add</button>
                </div>
                {experience.map(exp => (
                  <div key={exp.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{exp.position}</h4>
                      <p className="text-sm text-zinc-400">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                      <p className="text-xs text-zinc-500 mt-1">{exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}</p>
                    </div>
                    <button onClick={() => handleDelete('experience', exp.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'education' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Add Education</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className={labelClass}>Institution *</label><input value={newEdu.institution} onChange={e => setNewEdu({...newEdu, institution: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Degree</label><input value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} className={inputClass} placeholder="B.S., M.S., Ph.D." /></div>
                    <div><label className={labelClass}>Field of Study</label><input value={newEdu.field_of_study} onChange={e => setNewEdu({...newEdu, field_of_study: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>GPA</label><input value={newEdu.gpa} onChange={e => setNewEdu({...newEdu, gpa: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Start</label><input value={newEdu.start_date} onChange={e => setNewEdu({...newEdu, start_date: e.target.value})} className={inputClass} placeholder="2020" /></div>
                    <div><label className={labelClass}>End</label><input value={newEdu.end_date} onChange={e => setNewEdu({...newEdu, end_date: e.target.value})} className={inputClass} placeholder="2024" /></div>
                  </div>
                  <button onClick={handleAddEdu} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-[#0a0a0f] font-semibold text-sm hover:bg-emerald-400 transition-all"><Plus className="w-4 h-4" /> Add</button>
                </div>
                {education.map(edu => (
                  <div key={edu.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{edu.institution}</h4>
                      <p className="text-sm text-zinc-400">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</p>
                      <p className="text-xs text-zinc-500 mt-1">{edu.start_date} – {edu.end_date || 'Present'}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                    </div>
                    <button onClick={() => handleDelete('education', edu.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'projects' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Add Project</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className={labelClass}>Title *</label><input value={newProj.title} onChange={e => setNewProj({...newProj, title: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Tech Stack (comma-separated)</label><input value={newProj.tech_stack} onChange={e => setNewProj({...newProj, tech_stack: e.target.value})} className={inputClass} placeholder="React, Node.js, PostgreSQL" /></div>
                    <div><label className={labelClass}>Live URL</label><input value={newProj.live_url} onChange={e => setNewProj({...newProj, live_url: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Repo URL</label><input value={newProj.repo_url} onChange={e => setNewProj({...newProj, repo_url: e.target.value})} className={inputClass} /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Description</label><textarea value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} rows={2} className={inputClass} /></div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={newProj.is_featured} onChange={e => setNewProj({...newProj, is_featured: e.target.checked})} />
                      <label className="text-sm text-zinc-300">Featured project</label>
                    </div>
                  </div>
                  <button onClick={handleAddProj} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-[#0a0a0f] font-semibold text-sm hover:bg-emerald-400 transition-all"><Plus className="w-4 h-4" /> Add</button>
                </div>
                {projects.map(proj => {
                  const tech = Array.isArray(proj.tech_stack) ? proj.tech_stack : [];
                  return (
                    <div key={proj.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{proj.title}</h4>
                          {proj.is_featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Featured</span>}
                        </div>
                        <p className="text-sm text-zinc-400 mt-0.5">{proj.description}</p>
                        <div className="flex gap-2 mt-2">
                          {tech.slice(0, 4).map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400">{t}</span>)}
                        </div>
                      </div>
                      <button onClick={() => handleDelete('project', proj.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeSection === 'certificates' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-400" /> Add Certificate</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className={labelClass}>Title *</label><input value={newCert.title} onChange={e => setNewCert({...newCert, title: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Issuer</label><input value={newCert.issuer} onChange={e => setNewCert({...newCert, issuer: e.target.value})} className={inputClass} placeholder="AWS, Google, etc." /></div>
                    <div><label className={labelClass}>Issue Date</label><input value={newCert.issue_date} onChange={e => setNewCert({...newCert, issue_date: e.target.value})} className={inputClass} placeholder="2024-01" /></div>
                    <div><label className={labelClass}>Expiry Date</label><input value={newCert.expiry_date} onChange={e => setNewCert({...newCert, expiry_date: e.target.value})} className={inputClass} placeholder="2027-01" /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Credential URL</label><input value={newCert.credential_url} onChange={e => setNewCert({...newCert, credential_url: e.target.value})} className={inputClass} /></div>
                  </div>
                  <button onClick={handleAddCert} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-[#0a0a0f] font-semibold text-sm hover:bg-emerald-400 transition-all"><Plus className="w-4 h-4" /> Add</button>
                </div>
                {certificates.map(cert => (
                  <div key={cert.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0"><Award className="w-4 h-4 text-amber-400" /></div>
                      <div>
                        <h4 className="font-semibold text-white">{cert.title}</h4>
                        <p className="text-sm text-zinc-400">{cert.issuer}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{cert.issue_date}{cert.expiry_date ? ` – ${cert.expiry_date}` : ''}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete('certificate', cert.id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
