"use client";
import { motion } from "framer-motion";
import { principles } from "@/lib/content";
import { EASE } from "@/lib/motion";

export function Principles() {
  return (
    <section
      id="principles"
      data-snap-section
      aria-label="Principles"
      className="relative py-20 sm:py-28 border-y"
      style={{ borderColor: "var(--hairline)" }}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7">
        <div className="grid grid-cols-12 gap-5 mb-10 sm:mb-14">
          <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
            <span>07</span>
            <span className="ml-2">Principles</span>
          </div>
          <h2 className="col-span-12 md:col-span-9 text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.1] tracking-[-0.015em] max-w-[40ch]">
            Commitments, not claims of perfection. We aim here. Sometimes we miss. We publish the misses too.
          </h2>
        </div>

        <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-y-1">
          {principles.map((p, i) => (
            <motion.li
              key={p.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
              className="border-t last:border-b py-7 sm:py-9 px-1 sm:px-4 grid grid-cols-12 gap-5"
              style={{ borderColor: "var(--hairline)" }}
            >
              <div className="col-span-2 sm:col-span-1 text-[12px] text-[var(--meta)] tabular-nums">{p.n}</div>
              <div className="col-span-10 sm:col-span-4 text-[clamp(1.4rem,2.4vw,2rem)] tracking-[-0.015em] leading-[1.05]">
                {p.title}
              </div>
              <div className="col-span-12 sm:col-span-7 text-[15px] leading-[1.6] text-[var(--fg-soft)] max-w-[58ch]">
                {p.text}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
