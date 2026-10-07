"use client";
import { useState, useEffect } from "react";
import { ArrowUpRight, X, Github, Linkedin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { teamMembers, type TeamMember } from "@/lib/content";
import { useFilter } from "./FilterProvider";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { EASE } from "@/lib/motion";

export function Team() {
  const { filter } = useFilter();
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const dialogRef = useFocusTrap(!!activeMember);

  const visible = filter
    ? teamMembers.filter((m) => m.capabilities.includes(filter))
    : teamMembers;

  useEffect(() => {
    if (!activeMember) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMember(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeMember]);

  return (
    <section
      id="team"
      data-snap-section
      aria-label="Team"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7">
        <div className="grid grid-cols-12 gap-5 mb-10 sm:mb-14">
          <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
            <span>05</span>
            <span className="ml-2">Team</span>
          </div>
          <h2 className="col-span-12 md:col-span-9 text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.015em] max-w-[40ch]">
            Five builders. Read their discipline, then read their work. What we don&apos;t publish is intentional.
          </h2>
        </div>

        <ul role="list" className="divide-y" style={{ borderColor: "var(--hairline)" }}>
          {visible.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setActiveMember(m)}
                className="w-full text-left grid grid-cols-12 gap-5 py-6 sm:py-8 items-center group cursor-pointer"
                style={{ minHeight: 120 }}
                aria-haspopup="dialog"
                aria-expanded={activeMember?.id === m.id}
              >
                <span className="col-span-2 sm:col-span-1 text-[12px] text-[var(--meta)] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="col-span-10 sm:col-span-4">
                  <span className="block text-[clamp(1.5rem,2.6vw,2.2rem)] leading-[1.05] tracking-[-0.015em] group-hover:italic">{m.name}</span>
                  <span className="block text-[13px] text-[var(--fg-soft)] mt-2 max-w-[36ch]">{m.discipline}</span>
                </span>
                <span className="hidden md:block col-span-5 text-[14px] leading-[1.55] text-[var(--fg-soft)] pr-6">{m.responsibility}</span>
                <span className="col-span-12 sm:col-span-2 flex items-center justify-end text-[12px] text-[var(--meta)] uppercase tracking-[0.16em] gap-2">
                  <span>Open profile</span>
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[12px] text-[var(--meta)] max-w-[64ch] leading-[1.55]">
          Profiles summarize public project evidence; LinkedIn details remain member-controlled. We don&apos;t publish phone numbers, internal marks or unverified achievements.
        </p>

        {/* Accessible Profile Dialog */}
        <AnimatePresence>
          {activeMember && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${activeMember.name} profile`}
              ref={dialogRef}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <div
                className="fixed inset-0 bg-[var(--charcoal)]/60 backdrop-blur-sm"
                onClick={() => setActiveMember(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto border bg-[var(--bg)] p-6 sm:p-8 shadow-2xl"
                style={{ borderColor: "var(--hairline)" }}
              >
                <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--hairline)" }}>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] font-mono">
                    {activeMember.role} · Team Paradox
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveMember(null)}
                    aria-label="Close profile"
                    className="h-10 w-10 flex items-center justify-center border text-[var(--meta)] hover:text-[var(--fg)] cursor-pointer"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <h3 className="mt-5 text-[clamp(1.8rem,3.2vw,2.4rem)] font-medium leading-[1.05] tracking-[-0.02em]">
                  {activeMember.name}
                </h3>
                <div className="text-[14px] text-[var(--fg-soft)] mt-2">
                  {activeMember.discipline}
                </div>
                <p className="mt-4 text-[14px] leading-[1.6] text-[var(--fg)]">
                  {activeMember.responsibility}
                </p>

                {/* Stack */}
                <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--hairline)" }}>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--meta)] mb-2.5 font-mono">Core Stack</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMember.stack.map((s) => (
                      <span key={s} className="px-2.5 py-1 border text-[11px] text-[var(--fg-soft)]" style={{ borderColor: "var(--hairline)", background: "var(--bg-2)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evidence */}
                <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--hairline)" }}>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--meta)] mb-2.5 font-mono">Public Evidence</div>
                  <ul className="space-y-2">
                    {activeMember.evidence.map((ev, i) => (
                      <li key={i} className="text-[13px] text-[var(--fg-soft)] flex items-start gap-2">
                        <span className="text-[var(--meta)] mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Links */}
                <div className="mt-6 pt-5 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--hairline)" }}>
                  <div className="flex items-center gap-2">
                    <a
                      href={activeMember.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-10 px-3 border text-[12px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                      style={{ borderColor: "var(--hairline)" }}
                    >
                      <Github size={14} /> GitHub
                    </a>
                    <a
                      href={activeMember.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-10 px-3 border text-[12px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                      style={{ borderColor: "var(--hairline)" }}
                    >
                      <Linkedin size={14} /> LinkedIn
                    </a>
                  </div>
                  <Link
                    href={`/team/${activeMember.id}`}
                    className="inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] text-[var(--meta)] hover:text-[var(--fg)]"
                  >
                    Full page profile <ArrowUpRight size={14} />
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}