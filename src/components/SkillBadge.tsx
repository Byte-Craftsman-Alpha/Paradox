const colorMap: Record<string, string> = {
  'TypeScript': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'React': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'Node.js': 'bg-green-500/15 text-green-400 border-green-500/20',
  'Go': 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  'Python': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'Rust': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Kubernetes': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  'AWS': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Docker': 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'PostgreSQL': 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'GraphQL': 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'Terraform': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'Next.js': 'bg-white/10 text-white border-white/20',
  'Tailwind CSS': 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  'PyTorch': 'bg-red-500/15 text-red-400 border-red-500/20',
  'TensorFlow': 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'React Native': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'Flutter': 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'Swift': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Kotlin': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'Firebase': 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  'Redis': 'bg-red-500/15 text-red-300 border-red-500/20',
};

const fallback = 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';

export default function SkillBadge({ skill }: { skill: string }) {
  const classes = colorMap[skill] || fallback;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${classes}`}>
      {skill}
    </span>
  );
}
