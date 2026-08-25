"use client";
import { motion } from "framer-motion";
import { osSteps } from "@/lib/content";
import { EASE } from "@/lib/motion";

export function OperatingSystem() {
  return (
    <section
      data-snap-section
      aria-label="Operating system"
      className="relative py-20 sm:py-24 border-y"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7">
        <div className="grid grid-cols-12 gap-5 mb-10">
          <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
            <span>06</span>
            <span className="ml-2">Operating System</span>
          </div>
          <h2 className="col-span-12 md:col-span-9 text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.1] tracking-[-0.015em] max-w-[40ch]">
            A five-step rhythm we return to whenever things get messy.
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" role="list">
          {osSteps.map((s, i) => (
            <motion.li
              key={s.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
              className="relative p-6 sm:p-7 border-t lg:border-t-0 lg:border-l first:border-t-0 lg:first:border-l-0"
              style={{ borderColor: "var(--hairline)" }}
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-6 tabular-nums">
                Step · {s.k}
              </div>
              <div className="text-[clamp(1.6rem,2.4vw,2rem)] tracking-[-0.015em] leading-[1.05]">
                {s.t}
              </div>
              <p className="mt-4 text-[14px] text-[var(--fg-soft)] leading-[1.55] max-w-[28ch]">
                {s.d}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
