"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { achievements } from "@/lib/content";
import { EASE } from "@/lib/motion";

export function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of achievements) {
      set.add(a.category);
    }
    return ["All", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return achievements;
    return achievements.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <section
      id="achievements"
      data-snap-section
      aria-label="Achievements timeline"
      className="relative py-20 sm:py-28 border-y"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7">
        {/* Section Header */}
        <div className="grid grid-cols-12 gap-5 mb-12 sm:mb-16">
          <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
            <span>06</span>
            <span className="ml-2">Achievements</span>
          </div>
          <div className="col-span-12 md:col-span-9 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.015em] max-w-[38ch]">
                Chronological ledger of shipped systems, architecture milestones, and production releases.
              </h2>
              <p className="mt-4 text-[14px] text-[var(--fg-soft)] leading-[1.6] max-w-[54ch]">
                Every entry points to shipped code, a running prototype, or a published architecture decision. We omit unverified claims and focus on evidence.
              </p>
            </div>
            <div className="text-[12px] font-mono text-[var(--meta)] tracking-wide shrink-0">
              2023 — Present · Gorakhpur
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-10 border-b" style={{ borderColor: "var(--hairline)" }}>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter achievements by discipline">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={active}
                  className={`h-9 px-3.5 border text-[11px] uppercase tracking-[0.14em] font-medium transition-none cursor-pointer flex items-center gap-2 ${
                    active
                      ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                      : "text-[var(--meta)] hover:text-[var(--fg)] bg-[var(--bg)]"
                  }`}
                  style={{
                    borderColor: active ? "var(--fg)" : "var(--hairline)",
                    minHeight: 38,
                  }}
                >
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5"
                    style={{
                      background: active ? "var(--bg)" : "var(--meta)",
                    }}
                  />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span aria-live="polite" className="text-[11px] font-mono text-[var(--meta)] uppercase tracking-[0.14em]">
              Showing {filtered.length} of {achievements.length}
            </span>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--meta)] hover:text-[var(--fg)] cursor-pointer"
                aria-label="Reset discipline filter"
              >
                <RotateCcw size={12} strokeWidth={1.5} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Vertical hairline track */}
          <div
            aria-hidden
            className="absolute left-3 sm:left-4 top-2 bottom-6 w-px bg-[var(--hairline)] hidden sm:block"
          />

          <ol className="space-y-8 sm:space-y-10" role="list">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.li
                  key={`${item.year}-${item.title}`}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.38, ease: EASE, delay: i * 0.03 }}
                  className="relative sm:pl-12 group"
                >
                  {/* Timeline node */}
                  <span
                    aria-hidden
                    className="absolute left-2.5 sm:left-3.5 top-2.5 h-1.5 w-1.5 -translate-x-1/2 bg-[var(--fg)] hidden sm:inline-block"
                  />

                  {/* Milestone Card */}
                  <div
                    className="p-6 sm:p-7 border"
                    style={{
                      borderColor: "var(--hairline)",
                      background: "color-mix(in srgb, var(--bg) 94%, var(--bg-2))",
                    }}
                  >
                    <div className="grid grid-cols-12 gap-5 items-start">
                      {/* Meta Column */}
                      <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                        <div className="flex items-center gap-2 font-mono text-[12px] tabular-nums text-[var(--meta)]">
                          <span className="text-[var(--fg)] font-semibold">{item.year}</span>
                          {item.quarter && (
                            <>
                              <span>·</span>
                              <span>{item.quarter}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-2 inline-block px-2 py-0.5 border text-[10px] uppercase tracking-[0.16em] text-[var(--meta)]" style={{ borderColor: "var(--hairline)" }}>
                          {item.category}
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="col-span-12 sm:col-span-8 lg:col-span-9">
                        <h3 className="text-[clamp(1.25rem,2.2vw,1.65rem)] font-medium tracking-[-0.015em] leading-[1.15] text-[var(--fg)]">
                          {item.title}
                        </h3>

                        <p className="mt-3 text-[14px] sm:text-[15px] leading-[1.6] text-[var(--fg-soft)] max-w-[58ch]">
                          {item.summary}
                        </p>

                        <div className="mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--hairline)" }}>
                          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[var(--meta)]">
                            <CheckCircle2 size={13} strokeWidth={1.5} className="text-[var(--fg)] shrink-0" />
                            <span>Evidence:</span>
                            <span className="text-[var(--fg)] font-normal">{item.highlight}</span>
                          </div>

                          {item.project && (
                            <Link
                              href={`/work/${item.project}`}
                              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-[var(--meta)] hover:text-[var(--fg)] group/link"
                            >
                              <span>View case study</span>
                              <ArrowUpRight size={13} strokeWidth={1.5} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </div>

        {/* Bottom Ledger Summary */}
        <div
          className="mt-16 sm:mt-20 pt-8 border-t grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{ borderColor: "var(--hairline)" }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--meta)] font-mono">Core Builders</div>
            <div className="text-[clamp(1.5rem,2.8vw,2.2rem)] font-medium tabular-nums tracking-[-0.02em] text-[var(--fg)] mt-1">05</div>
            <div className="text-[12px] text-[var(--fg-soft)] mt-0.5">Gorakhpur studio</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--meta)] font-mono">Systems Shipped</div>
            <div className="text-[clamp(1.5rem,2.8vw,2.2rem)] font-medium tabular-nums tracking-[-0.02em] text-[var(--fg)] mt-1">06</div>
            <div className="text-[12px] text-[var(--fg-soft)] mt-0.5">Active & prototype</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--meta)] font-mono">Evidence Threshold</div>
            <div className="text-[clamp(1.5rem,2.8vw,2.2rem)] font-medium tabular-nums tracking-[-0.02em] text-[var(--fg)] mt-1">100%</div>
            <div className="text-[12px] text-[var(--fg-soft)] mt-0.5">Verifiable deliverables</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--meta)] font-mono">Chronology</div>
            <div className="text-[clamp(1.5rem,2.8vw,2.2rem)] font-medium tabular-nums tracking-[-0.02em] text-[var(--fg)] mt-1">2023–26</div>
            <div className="text-[12px] text-[var(--fg-soft)] mt-0.5">Continuous evolution</div>
          </div>
        </div>
      </div>
    </section>
  );
}

