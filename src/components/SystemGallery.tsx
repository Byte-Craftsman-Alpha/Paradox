"use client";
import Link from "next/link";

const cards = [
  { k: "Milk", v: "#FCFBF7" },
  { k: "Milk 2", v: "#F5F2EA" },
  { k: "Milk 3", v: "#ECE8DE" },
  { k: "Charcoal", v: "#191A18" },
  { k: "Ink", v: "#292A27" },
  { k: "Muted", v: "#68665F" },
  { k: "Metadata", v: "#9B978D" },
  { k: "Hairline", v: "#DDD9CF" },
  { k: "Hairline · dark", v: "#3B3C38" },
  { k: "Taupe", v: "#A59C8C" },
];

export function SystemGallery() {
  return (
    <div className="min-h-[60vh] mx-auto max-w-[1440px] px-5 sm:px-7 py-24 sm:py-32">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">/system</div>
      <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.8rem)] tracking-[-0.02em] leading-[1.05]">State gallery</h1>
      <p className="mt-3 text-[15px] text-[var(--fg-soft)] max-w-[64ch]">
        A quick atlas of the components in their default, hover, focus, expanded, disabled, error, success and loading states. Used in QA, not in the public narrative.
      </p>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => (
          <div key={c.k} className="border p-5" style={{ borderColor: "var(--hairline)" }}>
            <div className="h-24 w-full" style={{ background: c.v, border: "1px solid var(--hairline)" }} />
            <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--meta)]">
              <span className="uppercase tracking-[0.16em]">{c.k}</span>
              <span className="tabular-nums text-[var(--fg)]">{c.v}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-[clamp(1.4rem,2.6vw,2rem)] tracking-[-0.015em]">Buttons &amp; inputs</h2>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="border p-5 space-y-3" style={{ borderColor: "var(--hairline)" }}>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--meta)]">Default / Hover / Active</div>
          <button className="inline-flex items-center h-11 px-4 border border-[var(--fg)] text-[13px] uppercase tracking-[0.14em]">Primary</button>
          <button className="ml-2 inline-flex items-center h-11 px-4 border text-[13px] uppercase tracking-[0.14em]" style={{ borderColor: "var(--hairline)" }}>Secondary</button>
          <button disabled className="ml-2 inline-flex items-center h-11 px-4 border text-[13px] uppercase tracking-[0.14em] opacity-50 cursor-not-allowed" style={{ borderColor: "var(--hairline)" }}>Disabled</button>
        </div>
        <div className="border p-5 space-y-3" style={{ borderColor: "var(--hairline)" }}>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--meta)]">Input · default / focus / error</div>
          <input placeholder="Default" className="w-full h-11 px-3 border bg-transparent text-[14px]" style={{ borderColor: "var(--hairline)" }} />
          <input placeholder="Focus (autofocus)" autoFocus className="w-full h-11 px-3 border bg-transparent text-[14px] outline-[var(--fg)]" style={{ borderColor: "var(--hairline)" }} />
          <input placeholder="Invalid" aria-invalid="true" className="w-full h-11 px-3 border bg-transparent text-[14px]" style={{ borderColor: "var(--fg)" }} />
        </div>
        <div className="border p-5 space-y-3" style={{ borderColor: "var(--hairline)" }}>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--meta)]">Loading / Success / Error</div>
          <button className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em]" style={{ borderColor: "var(--hairline)" }}>
            <span className="inline-block h-3 w-3 rounded-full border border-current border-t-transparent" /> Loading
          </button>
          <p className="text-[14px] text-[var(--fg-soft)]">Success: <span className="text-[var(--fg)]">Sent</span></p>
          <p className="text-[14px] text-[var(--fg-soft)]">Error: <span className="text-[var(--fg)]">Try again</span></p>
        </div>
      </div>

      <p className="mt-16 text-[12px] text-[var(--meta)]">
        <Link href="/" className="underline underline-offset-4">← Back to the studio</Link>
      </p>
    </div>
  );
}