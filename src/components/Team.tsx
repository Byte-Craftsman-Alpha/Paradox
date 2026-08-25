"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { teamMembers } from "@/lib/content";
import { useFilter } from "./FilterProvider";

export function Team() {
  const { filter } = useFilter();
  const visible = filter
    ? teamMembers.filter((m) => m.capabilities.includes(filter))
    : teamMembers;

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
              <Link
                href={`/team/${m.id}`}
                className="w-full text-left grid grid-cols-12 gap-5 py-6 sm:py-8 items-center group block"
                style={{ minHeight: 120 }}
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
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[12px] text-[var(--meta)] max-w-[64ch] leading-[1.55]">
          Profiles summarize public project evidence; LinkedIn details remain member-controlled. We don&apos;t publish phone numbers, internal marks or unverified achievements.
        </p>
      </div>
    </section>
  );
}