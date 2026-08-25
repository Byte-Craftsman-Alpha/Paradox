"use client";
import Link from "next/link";
import { Github, Linkedin, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { projectsByOwner, projects, capabilities, type TeamMember } from "@/lib/content";
const projectList = projects.projects;
import { EASE } from "@/lib/motion";

export function TeamMemberView({ member }: { member: TeamMember }) {
  const owned = projectsByOwner(member.id);
  return (
    <article className="relative pt-28 sm:pt-32 pb-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7 grid grid-cols-12 gap-y-6">
        <Link
          href="/#team"
          className="col-span-12 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[var(--meta)] hover:text-[var(--fg)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to team
        </Link>

        <div className="col-span-12 md:col-span-8">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">{member.role}</div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
            className="mt-2 text-[clamp(2.2rem,5vw,4rem)] leading-[1.02] tracking-[-0.02em]"
          >
            {member.name}
          </motion.h1>
          <div className="text-[15px] text-[var(--fg-soft)] mt-2 max-w-[42ch]">{member.discipline}</div>
        </div>

        <div className="col-span-12 md:col-span-4 flex md:justify-end items-start gap-2">
          <a
            href={member.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-11 px-3 border text-[12px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            style={{ borderColor: "var(--hairline)" }}
          >
            <Github size={14} strokeWidth={1.5} /> GitHub
          </a>
          <a
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 h-11 px-3 border text-[12px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            style={{ borderColor: "var(--hairline)" }}
          >
            <Linkedin size={14} strokeWidth={1.5} /> LinkedIn
          </a>
        </div>

        <section className="col-span-12">
          <SectionTitle n="01" title="Responsibility" />
          <p className="text-[17px] leading-[1.6] max-w-[64ch]">{member.responsibility}</p>
        </section>

        <section className="col-span-12 md:col-span-6">
          <SectionTitle n="02" title="Observed Stack" />
          <ul className="flex flex-wrap gap-2">
            {member.stack.map((s, i) => (
              <li key={i} className="text-[11px] uppercase tracking-[0.12em] px-2 py-1 border" style={{ borderColor: "var(--hairline)" }}>
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-12 md:col-span-6">
          <SectionTitle n="03" title="Selected Evidence" />
          <ul className="space-y-2">
            {member.evidence.map((e, i) => (
              <li key={i} className="text-[14px] leading-[1.55] text-[var(--fg-soft)]">— {e}</li>
            ))}
          </ul>
        </section>

        <section className="col-span-12 md:col-span-7">
          <SectionTitle n="04" title="Projects Owned / Linked" />
          {owned.length > 0 ? (
            <ul className="space-y-1.5">
              {owned.map((p) => (
                <li key={p.id} className="text-[15px] tracking-[-0.01em]">
                  <Link href={`/#work`} className="underline decoration-[var(--meta)] underline-offset-4 hover:decoration-[var(--fg)]">
                    {p.title}
                  </Link>
                  <span className="text-[var(--meta)] text-[12px] ml-2">— {p.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-1.5">
              {projectList
                .filter((p) => member.capabilities.some((cap) => p.capabilities.includes(cap)))
                .slice(0, 5)
                .map((p) => (
                  <li key={p.id} className="text-[15px] tracking-[-0.01em]">
                    <Link href={`/#work`} className="underline decoration-[var(--meta)] underline-offset-4 hover:decoration-[var(--fg)]">
                      {p.title}
                    </Link>
                    <span className="text-[var(--meta)] text-[12px] ml-2">— {p.status}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="col-span-12 md:col-span-5">
          <SectionTitle n="05" title="Capabilities" />
          <ul className="flex flex-wrap gap-2">
            {member.capabilities.map((cap) => {
              const c = capabilities.find((x) => x.key === cap);
              return (
                <li key={cap} className="text-[11px] uppercase tracking-[0.12em] px-2 py-1 border" style={{ borderColor: "var(--hairline)" }}>
                  {c?.label}
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="col-span-12 pt-2 border-t mt-2" style={{ borderColor: "var(--hairline)" }}>
          <p className="text-[12px] text-[var(--meta)] leading-[1.55] pt-4">
            Public links only. LinkedIn details remain member-controlled. Anything that can&apos;t be evidenced is intentionally omitted.
          </p>
        </footer>
      </div>
    </article>
  );
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-3">
      <span className="tabular-nums">{n}</span>
      <span aria-hidden className="h-px w-6 bg-[var(--meta)]" />
      <span>{title}</span>
    </div>
  );
}