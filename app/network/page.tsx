import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { FEDERATED_MEMBERS, HUB_HOST } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The Team Paradox Network — Federated Studio & Member Sites",
  description:
    "The official crawl directory and federation graph for Team Paradox in Gorakhpur, Uttar Pradesh, India, and our five members' independent personal websites.",
  alternates: {
    canonical: "/network",
  },
  openGraph: {
    type: "website",
    title: "The Team Paradox Network — Studio Hub & Member Sites",
    description:
      "Directory of independent websites in the Team Paradox federation. Gorakhpur, India.",
    url: `${HUB_HOST}/network`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Team Paradox Network",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Team Paradox Network — Studio Hub & Member Sites",
    description:
      "Directory of independent websites in the Team Paradox federation. Gorakhpur, India.",
    images: ["/opengraph-image"],
  },
};

export default function NetworkPage() {
  const networkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${HUB_HOST}/network#page`,
    name: "The Team Paradox Network",
    description: "Crawl directory and federation graph for Team Paradox studio and its members in Gorakhpur, India.",
    url: `${HUB_HOST}/network`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: FEDERATED_MEMBERS.map((m, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: m.host,
        name: m.name,
        description: `${m.name} (${m.role}) — Personal Portfolio`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(networkJsonLd),
        }}
      />
      <Header />
      <main id="main" className="relative pt-28 sm:pt-36 pb-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-7">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[var(--meta)] hover:text-[var(--fg)] mb-8"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back to studio hub
          </Link>

          <div className="grid grid-cols-12 gap-5 mb-12 sm:mb-16">
            <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
              <span>00</span>
              <span className="ml-2">Federation</span>
            </div>
            <div className="col-span-12 md:col-span-9">
              <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05] tracking-[-0.02em]">
                The Team Paradox Network
              </h1>
              <p className="mt-4 text-[17px] text-[var(--fg-soft)] leading-[1.6] max-w-[62ch]">
                Team Paradox is a student technology studio based in Gorakhpur, Uttar Pradesh, India.
                Our members maintain their own independent personal portfolios across dedicated hostnames.
                Search engines index each host separately, while our graph of links and schema binds us as one studio.
              </p>
            </div>
          </div>

          <div className="border-t" style={{ borderColor: "var(--hairline)" }}>
            <div className="py-8 grid grid-cols-12 gap-5 items-baseline border-b" style={{ borderColor: "var(--hairline)" }}>
              <div className="col-span-12 md:col-span-4">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] block mb-1">Studio Hub</span>
                <span className="text-[24px] font-medium tracking-[-0.01em]">Team Paradox (www)</span>
              </div>
              <div className="col-span-12 md:col-span-5 text-[14px] text-[var(--fg-soft)] leading-[1.55]">
                Organization entity, collective work, design system, capabilities ledger, and official team profiles.
              </div>
              <div className="col-span-12 md:col-span-3 flex md:justify-end items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-[var(--fg)] hover:underline underline-offset-4"
                >
                  Visit Hub <ArrowUpRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            {FEDERATED_MEMBERS.map((member, i) => (
              <div
                key={member.slug}
                className="py-8 grid grid-cols-12 gap-5 items-baseline border-b"
                style={{ borderColor: "var(--hairline)" }}
              >
                <div className="col-span-12 md:col-span-4">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] block mb-1">
                    Member #{String(i + 1).padStart(2, "0")} · {member.role}
                  </span>
                  <span className="text-[24px] font-medium tracking-[-0.01em] block">
                    {member.name}
                  </span>
                  <span className="text-[13px] text-[var(--fg-soft)] block mt-1">
                    {member.discipline}
                  </span>
                </div>

                <div className="col-span-12 md:col-span-5 text-[14px] text-[var(--fg-soft)] leading-[1.55]">
                  <p>Independent personal portfolio & full project showcase for {member.name}.</p>
                  <p className="mt-2 text-[12px] text-[var(--meta)]">
                    Host: <code className="font-mono">{member.host}</code>
                  </p>
                </div>

                <div className="col-span-12 md:col-span-3 flex flex-wrap md:flex-col md:items-end gap-2">
                  <a
                    href={member.host}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 h-10 px-4 border text-[12px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    Personal Site <ArrowUpRight size={13} strokeWidth={1.5} />
                  </a>
                  <Link
                    href={`/team/${member.slug}`}
                    className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] text-[var(--meta)] hover:text-[var(--fg)] py-1"
                  >
                    Studio Role Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 border text-[13px] text-[var(--fg-soft)] leading-[1.6] max-w-[70ch]" style={{ borderColor: "var(--hairline)" }}>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] block mb-2">Crawl & Indexing Note</span>
            Each spoke domain above serves an independent 200 HTTP response, maintains its own self-referencing canonical tag, and publishes its own distinct XML sitemap. Links between the hub and member sites are non-reciprocal semantic citations that establish authentic identity and team affiliation.
          </div>
        </div>
      </main>
      <Contact />
    </>
  );
}
