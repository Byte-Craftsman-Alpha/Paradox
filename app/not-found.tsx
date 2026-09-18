import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Home, Layers, Globe } from "lucide-react";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { FEDERATED_MEMBERS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The requested route does not exist within the Team Paradox studio hub.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="relative pt-28 sm:pt-36 pb-20">
        <article className="mx-auto max-w-[1440px] px-5 sm:px-7">
          <div className="max-w-[720px]">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-4">
              <span className="font-mono">404</span>
              <span>/</span>
              <span>Resource Not Found</span>
            </div>

            <h1 className="text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1.02] tracking-[-0.025em] font-medium">
              This route does not exist.
            </h1>

            <p className="mt-5 text-[17px] leading-[1.6] text-[var(--fg-soft)]">
              The page you are looking for may have moved, been reorganized into our federation directory, or has not been authored yet.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em] bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
                style={{ borderColor: "var(--hairline)" }}
              >
                <Home size={14} strokeWidth={1.5} /> Studio Home
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                style={{ borderColor: "var(--hairline)" }}
              >
                <Layers size={14} strokeWidth={1.5} /> Selected Work
              </Link>
              <Link
                href="/network"
                className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                style={{ borderColor: "var(--hairline)" }}
              >
                <Globe size={14} strokeWidth={1.5} /> Crawl Network
              </Link>
            </div>
          </div>

          <section className="mt-16 pt-10 border-t grid grid-cols-12 gap-6" style={{ borderColor: "var(--hairline)" }}>
            <div className="col-span-12 md:col-span-4">
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-2">
                Federated Member Sites
              </h2>
              <p className="text-[13px] leading-[1.6] text-[var(--fg-soft)]">
                Looking for an individual team member&apos;s portfolio?
              </p>
            </div>

            <div className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {FEDERATED_MEMBERS.map((m) => (
                <a
                  key={m.slug}
                  href={m.host}
                  target="_blank"
                  rel="noopener"
                  className="p-3.5 border flex flex-col justify-between group hover:border-[var(--fg)] transition-colors"
                  style={{ borderColor: "var(--hairline)", background: "var(--milk-2)" }}
                >
                  <div>
                    <div className="text-[14px] font-medium group-hover:underline flex items-center justify-between">
                      <span>{m.name}</span>
                      <ArrowUpRight size={13} className="text-[var(--meta)] group-hover:text-[var(--fg)]" />
                    </div>
                    <div className="text-[11px] text-[var(--meta)] mt-1">{m.jobTitle}</div>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--meta)] mt-3">
                    {m.slug}.teamparadox.in
                  </div>
                </a>
              ))}
            </div>
          </section>
        </article>
      </main>
      <Contact />
    </>
  );
}