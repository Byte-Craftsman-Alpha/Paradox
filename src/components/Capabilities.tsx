"use client";
import { motion, AnimatePresence } from "framer-motion";
import { capabilities, teamMembers, projects } from "@/lib/content";
import { useFilter } from "./FilterProvider";
import { EASE, SPRING } from "@/lib/motion";

export function Capabilities() {
  const { filter, setFilter } = useFilter();
  return (
    <section
      id="capabilities"
      data-snap-section
      aria-label="Capabilities"
      className="relative py-20 sm:py-28 border-y"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7">
        <div className="grid grid-cols-12 gap-5 mb-10 sm:mb-14">
          <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
            <span>04</span>
            <span className="ml-2">Capabilities</span>
          </div>
          <h2 className="col-span-12 md:col-span-9 text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.015em] max-w-[40ch]">
            A small ledger of what we actually do. Click one to filter the studio — no percentages, just the work it touches.
          </h2>
        </div>

        <ul role="list" className="divide-y" style={{ borderColor: "var(--hairline)" }}>
          {capabilities.map((c, i) => {
            const isActive = filter === c.key;
            const memberCount = c.members.length;
            const projectCount = c.projects.length;
            return (
              <li key={c.key}>
                <button
                  onClick={() => setFilter(isActive ? null : c.key)}
                  aria-pressed={isActive}
                  aria-controls="filter-status"
                  className="w-full text-left grid grid-cols-12 gap-5 py-6 sm:py-7 items-center group"
                  style={{ minHeight: 96 }}
                >
                  <span className="col-span-2 sm:col-span-1 text-[12px] text-[var(--meta)] tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-10 sm:col-span-5">
                    <span className="block text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.1] tracking-[-0.015em] group-hover:italic">{c.label}</span>
                  </span>
                  <span className="hidden sm:block col-span-3 text-[13px] text-[var(--fg-soft)] pr-4">{c.note}</span>
                  <span className="col-span-12 sm:col-span-3 flex items-center sm:justify-end gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--meta)]">
                    <span>{memberCount} people</span>
                    <span aria-hidden>/</span>
                    <span>{projectCount} project{projectCount === 1 ? "" : "s"}</span>
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5"
                      style={{
                        background: isActive ? "var(--fg)" : "transparent",
                        border: "1px solid var(--fg)",
                      }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Filter status & linked members/projects */}
        <AnimatePresence mode="wait">
          {filter && (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } }}
              id="filter-status"
              role="status"
              aria-live="polite"
              className="mt-10 grid grid-cols-12 gap-5"
            >
              <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
                Filtered by
              </div>
              <div className="col-span-12 md:col-span-9">
                <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
                  <LinkedGroup
                    title="People"
                    items={teamMembers
                      .filter((m) => m.capabilities.includes(filter))
                      .map((m) => ({ key: m.id, label: m.name }))}
                  />
                  <LinkedGroup
                    title="Projects"
                    items={projects.projects
                      .filter((p) => p.capabilities.includes(filter))
                      .map((p) => ({ key: p.id, label: p.title }))}
                  />
                  <button
                    onClick={() => setFilter(null)}
                    className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em]"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    Reset filter
                    <span aria-hidden>×</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function LinkedGroup({ title, items }: { title: string; items: { key: string; label: string }[] }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-2">{title}</div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((it) => (
          <motion.li
            key={it.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="text-[15px] tracking-[-0.01em]"
          >
            {it.label}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
