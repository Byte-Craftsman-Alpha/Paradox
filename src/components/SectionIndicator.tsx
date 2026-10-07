"use client";
import { useActiveSection } from "@/lib/useActiveSection";
import { AnimatePresence } from "framer-motion";

const labels: Record<string, string> = {
  top: "01 · Hero",
  index: "02 · Manifesto",
  work: "03 · Work",
  capabilities: "04 · Capabilities",
  team: "05 · Team",
  achievements: "06 · Timeline",
  principles: "08 · Principles",
  contact: "09 · Contact",
};

const IDS = Object.keys(labels);

export function SectionIndicator() {
  const active = useActiveSection(IDS);
  return (
    <div
      aria-hidden
      className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--meta)]"
    >
      <AnimatePresence mode="wait">
        <span key={active}>{labels[active] ?? "—"}</span>
      </AnimatePresence>
      <span className="inline-block h-12 w-px bg-[var(--hairline)]" />
    </div>
  );
}