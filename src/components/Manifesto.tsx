"use client";
import { motion } from "framer-motion";
import { site } from "@/lib/content";
import { EASE } from "@/lib/motion";

const LINES = site.manifesto;

export function Manifesto() {
  return (
    <section
      id="index"
      data-snap-section
      aria-label="Manifesto"
      className="relative border-y py-20 sm:py-28"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7 grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
          <span>02</span>
          <span className="ml-2">Manifesto</span>
        </div>
        <div className="col-span-12 md:col-span-9 max-w-[40ch]">
          {LINES.map((line, i) => (
            <div key={i} className="overflow-hidden pb-2">
              <motion.p
                initial={{ y: "100%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.78, ease: EASE, delay: i * 0.12 }}
                className="text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.015em]"
              >
                {line}
              </motion.p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
