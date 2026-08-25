import { Header } from "@/components/Header";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="min-h-[70vh] mx-auto max-w-[1440px] px-5 sm:px-7 py-32">
        <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">404</div>
        <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.8rem)] tracking-[-0.02em] leading-[1.05]">
          This route isn&apos;t part of the studio.
        </h1>
        <p className="mt-3 text-[15px] text-[var(--fg-soft)] max-w-[64ch]">
          Pages we haven&apos;t built yet should look unread. Head back to the home page.
        </p>
        <a
          href="/"
          className="mt-8 inline-block h-11 px-4 leading-[44px] border text-[13px] uppercase tracking-[0.14em]"
          style={{ borderColor: "var(--hairline)" }}
        >
          Return home
        </a>
      </main>
    </>
  );
}