import { Zap, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#0a0a0f]" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-white">Nexus<span className="text-emerald-400">.</span>dev</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/team" className="hover:text-white transition-colors">Team</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Nexus.dev — Technical Team Portal
        </div>
      </div>
    </footer>
  );
}
