"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, AlertCircle, Mail, Layers } from "lucide-react";
import { Header } from "@/components/Header";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for telemetry/client-side debugging
    console.error("[Team Paradox] Runtime boundary caught error:", error);
  }, [error]);

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="relative pt-28 sm:pt-36 pb-20 focus:outline-none">
        <article className="mx-auto max-w-[1440px] px-5 sm:px-7">
          <div className="max-w-[720px]">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-4">
              <span className="font-mono">500</span>
              <span>/</span>
              <span>Runtime Exception</span>
            </div>

            <h1 className="text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1.02] tracking-[-0.025em] font-medium">
              An unexpected system error occurred.
            </h1>

            <p className="mt-5 text-[17px] leading-[1.6] text-[var(--fg-soft)]">
              A runtime boundary caught an unhandled exception while rendering this view. Our operating system isolates failures to preserve session stability.
            </p>

            {error.digest && (
              <div
                className="mt-6 p-4 border flex items-start gap-3 text-[13px] font-mono text-[var(--meta)]"
                style={{ borderColor: "var(--hairline)", background: "var(--milk-2)" }}
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-[var(--fg)]" />
                <div>
                  <span className="text-[var(--fg)] font-medium">Incident Digest:</span> {error.digest}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em] bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 cursor-pointer"
                style={{ borderColor: "var(--hairline)" }}
              >
                <RotateCcw size={14} strokeWidth={1.5} /> Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                style={{ borderColor: "var(--hairline)" }}
              >
                <Home size={14} strokeWidth={1.5} /> Return Home
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                style={{ borderColor: "var(--hairline)" }}
              >
                <Layers size={14} strokeWidth={1.5} /> Selected Work
              </Link>
            </div>
          </div>

          <section className="mt-16 pt-10 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: "var(--hairline)" }}>
            <p className="text-[12px] text-[var(--meta)] leading-[1.6]">
              Persistent failures can be reported directly to our platform team at{" "}
              <a href="mailto:hello@teamparadox.in" className="underline hover:text-[var(--fg)]">
                hello@teamparadox.in
              </a>
              .
            </p>
            <a
              href="mailto:hello@teamparadox.in?subject=Runtime%20Error%20Report"
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-[var(--fg)] hover:underline"
            >
              <Mail size={13} /> Report Issue
            </a>
          </section>
        </article>
      </main>
    </>
  );
}

