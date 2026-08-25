"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { projects, type CapabilityKey } from "@/lib/content";
import { useFilter } from "./FilterProvider";
import { EASE, SPRING } from "@/lib/motion";

function statusStyle(s: string): { bg: string; fg: string; label: string } {
  if (s === "Active") return { bg: "var(--fg)", fg: "var(--bg)", label: "Active" };
  if (s === "Archived") return { bg: "transparent", fg: "var(--meta)", label: "Archived" };
  return { bg: "var(--milk-3)", fg: "var(--ink)", label: "Prototype" };
}

export function Work() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { filter } = useFilter();
  const lastFilter = useRef<CapabilityKey | null>(filter);

  const filtered = filter
    ? projects.projects.filter((p) => p.capabilities.includes(filter))
    : projects.projects;

  // Close any open project when the filter actually changes
  useEffect(() => {
    if (lastFilter.current !== filter) {
      lastFilter.current = filter;
      setOpenId(null);
    }
  }, [filter]);

  return (
    <section
      id="work"
      data-snap-section
      aria-label="Selected work"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7">
        {/* header */}
        <div className="grid grid-cols-12 gap-5 mb-10 sm:mb-14">
          <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
            <span>03</span>
            <span className="ml-2">Selected Work</span>
          </div>
          <h2 className="col-span-12 md:col-span-9 text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.015em] max-w-[34ch]">
            Six projects in flight. Each a real system with a real lead, a real stack and a real list of limitations.
          </h2>
        </div>

        {filtered.length === 0 ? (
          <EmptyState onClear={() => window.history.replaceState(null, "", location.pathname + "#work")} />
        ) : (
          <LayoutGroup>
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-12 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] py-3 border-y" style={{ borderColor: "var(--hairline)" }}>
                <div className="col-span-1">№</div>
                <div className="col-span-4">Project</div>
                <div className="col-span-3">Lead</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Index</div>
              </div>

              <ul role="list" className="divide-y" style={{ borderColor: "var(--hairline)" }}>
                {filtered.map((p) => {
                  const isOpen = openId === p.id;
                  const s = statusStyle(p.status);
                  return (
                    <li key={p.id}>
                      <button
                        className="grid grid-cols-12 w-full text-left py-5 items-start group"
                        aria-expanded={isOpen}
                        aria-controls={`panel-${p.id}`}
                        onClick={() => setOpenId(isOpen ? null : p.id)}
                      >
                        <span className="col-span-1 text-[12px] text-[var(--meta)] tabular-nums">{p.index}</span>
                        <span className="col-span-4 pr-4">
                          <span className="block text-[22px] leading-[1.15] tracking-[-0.01em] group-hover:italic">
                            {p.title}
                          </span>
                          <span className="block text-[13px] text-[var(--fg-soft)] mt-1 max-w-[42ch]">{p.summary}</span>
                        </span>
                        <span className="col-span-3 text-[13px] text-[var(--fg)]">{p.owner}</span>
                        <span className="col-span-2 text-[12px] uppercase tracking-[0.14em]" style={{ color: s.fg }}>
                          <span className="inline-flex items-center gap-2 px-2 py-1 border" style={{ borderColor: "var(--hairline)", background: s.bg, color: s.fg }}>
                            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-current" />
                            {s.label}
                          </span>
                        </span>
                        <span className="col-span-2 flex items-center justify-end gap-3 text-[12px] text-[var(--meta)]">
                          <span className="tabular-nums">{p.year.split(" —")[0]}</span>
                          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={SPRING}>
                            <ChevronDown size={16} strokeWidth={1.5} />
                          </motion.span>
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`panel-${p.id}`}
                            key="panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.55, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <motion.div
                              layoutId={`panel-inner-${p.id}`}
                              transition={{ duration: 0.55, ease: EASE }}
                              className="grid grid-cols-12 gap-y-5 py-8 border-t"
                              style={{ borderColor: "var(--hairline)" }}
                            >
                              <Block n="01" title="Problem" col="col-span-12 md:col-span-6">{p.problem}</Block>
                              <Block n="02" title="Architecture" col="col-span-12 md:col-span-6">
                                <ul className="space-y-2">
                                  {p.architecture.map((a, k) => (
                                    <li key={k} className="flex gap-3">
                                      <span className="text-[var(--meta)] tabular-nums text-[11px] mt-2">0{k + 1}</span>
                                      <span>{a}</span>
                                    </li>
                                  ))}
                                </ul>
                              </Block>
                              <Block n="03" title="Decisions" col="col-span-12 md:col-span-4">
                                <ul className="space-y-2">
                                  {p.decisions.map((a, k) => <li key={k} className="leading-[1.55]">— {a}</li>)}
                                </ul>
                              </Block>
                              <Block n="04" title="Limitations" col="col-span-12 md:col-span-4">
                                <ul className="space-y-2">
                                  {p.limitations.map((a, k) => <li key={k} className="leading-[1.55]">— {a}</li>)}
                                </ul>
                              </Block>
                              <Block n="05" title="Stack" col="col-span-12 md:col-span-4">
                                <div className="flex flex-wrap gap-2">
                                  {p.stack.map((s, k) => (
                                    <span key={k} className="text-[11px] uppercase tracking-[0.12em] px-2 py-1 border" style={{ borderColor: "var(--hairline)" }}>
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </Block>
                              <div className="col-span-12 flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--hairline)" }}>
                                <span className="text-[12px] uppercase tracking-[0.18em] text-[var(--meta)]">Index · {p.index}</span>
                                <div className="flex items-center gap-3">
                                  {p.links.map((l) => (
                                    <a
                                      key={l.label}
                                      href={l.href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 h-11 px-3 text-[13px] uppercase tracking-[0.14em] border hover:bg-[var(--fg)] hover:text-[var(--bg)] focus-visible:bg-[var(--fg)] focus-visible:text-[var(--bg)]"
                                      style={{ borderColor: "var(--hairline)" }}
                                    >
                                      {l.label}
                                      <ArrowUpRight size={14} strokeWidth={1.5} />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Mobile cards */}
            <ul className="md:hidden space-y-4">
              {filtered.map((p) => {
                const isOpen = openId === p.id;
                const s = statusStyle(p.status);
                return (
                  <li key={p.id} className="border" style={{ borderColor: "var(--hairline)" }}>
                    <button
                      className="w-full text-left p-4"
                      aria-expanded={isOpen}
                      aria-controls={`panel-m-${p.id}`}
                      onClick={() => setOpenId(isOpen ? null : p.id)}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[12px] text-[var(--meta)] tabular-nums">{p.index}</span>
                        <span className="text-[11px] inline-flex items-center gap-1.5 px-1.5 py-0.5 border" style={{ borderColor: "var(--hairline)", background: s.bg, color: s.fg }}>
                          <span aria-hidden className="inline-block h-1 w-1 bg-current" />
                          {s.label}
                        </span>
                      </div>
                      <div className="text-[20px] leading-[1.15] tracking-[-0.01em] mt-2">{p.title}</div>
                      <div className="text-[13px] text-[var(--fg-soft)] mt-1">{p.summary}</div>
                      <div className="text-[12px] text-[var(--meta)] mt-2">
                        {p.owner} · {p.year}
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`panel-m-${p.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 border-t space-y-4" style={{ borderColor: "var(--hairline)" }}>
                            <Block n="01" title="Problem">{p.problem}</Block>
                            <Block n="02" title="Architecture">
                              <ul className="space-y-1.5">
                                {p.architecture.map((a, k) => <li key={k}>— {a}</li>)}
                              </ul>
                            </Block>
                            <Block n="03" title="Decisions">
                              <ul className="space-y-1.5">
                                {p.decisions.map((a, k) => <li key={k}>— {a}</li>)}
                              </ul>
                            </Block>
                            <Block n="04" title="Limitations">
                              <ul className="space-y-1.5">
                                {p.limitations.map((a, k) => <li key={k}>— {a}</li>)}
                              </ul>
                            </Block>
                            <Block n="05" title="Stack">
                              <div className="flex flex-wrap gap-1.5">
                                {p.stack.map((s, k) => (
                                  <span key={k} className="text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 border" style={{ borderColor: "var(--hairline)" }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </Block>
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                              {p.links.map((l) => (
                                <a
                                  key={l.label}
                                  href={l.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 h-10 px-3 text-[12px] uppercase tracking-[0.14em] border"
                                  style={{ borderColor: "var(--hairline)" }}
                                >
                                  {l.label}
                                  <ArrowUpRight size={14} strokeWidth={1.5} />
                                </a>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        )}
      </div>
    </section>
  );
}

function Block({ n, title, children, col = "" }: { n: string; title: string; children: React.ReactNode; col?: string }) {
  return (
    <div className={col}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-2">
        <span className="tabular-nums">{n}</span>
        <span aria-hidden className="h-px w-6 bg-[var(--meta)]" />
        <span>{title}</span>
      </div>
      <div className="text-[15px] leading-[1.55] text-[var(--fg)]">{children}</div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="border-y py-16 text-center" style={{ borderColor: "var(--hairline)" }}>
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">No matches</div>
      <div className="text-[28px] leading-[1.1] tracking-[-0.01em] mt-3">No project claims this capability yet.</div>
      <div className="text-[14px] text-[var(--fg-soft)] mt-2 max-w-[42ch] mx-auto">
        Reality sometimes reads like silence. Try another capability or clear the filter.
      </div>
      <button
        onClick={onClear}
        className="mt-6 inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em]"
        style={{ borderColor: "var(--hairline)" }}
      >
        Clear filter
      </button>
    </div>
  );
}
