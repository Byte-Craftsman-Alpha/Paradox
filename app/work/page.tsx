import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { projects, memberById } from "@/lib/content";
import { HUB_HOST } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Engineering Case Studies — Selected Systems by Team Paradox",
  description:
    "In-depth technical case studies and engineering postmortems for systems built by Team Paradox in Gorakhpur: EduPortal, ARIA, Theft Alert, Perkify, Career Boost, and The Local Way.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    type: "website",
    title: "Engineering Case Studies — Team Paradox",
    description:
      "Deep technical case studies for product, AI, mobile, and security systems built by Team Paradox in Gorakhpur, India.",
    url: `${HUB_HOST}/work`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Engineering Case Studies — Team Paradox",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Case Studies — Team Paradox",
    description:
      "Deep technical case studies for product, AI, mobile, and security systems built by Team Paradox in Gorakhpur, India.",
    images: ["/opengraph-image"],
  },
};

export default function WorkIndexPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${HUB_HOST}/work#page`,
    name: "Engineering Case Studies — Team Paradox",
    description: "Technical case studies and systems architecture by Team Paradox in Gorakhpur, India.",
    url: `${HUB_HOST}/work`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.projects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${HUB_HOST}/work/${p.id}`,
        name: p.title,
        description: p.summary,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
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
              <span>01</span>
              <span className="ml-2">Selected Work</span>
            </div>
            <div className="col-span-12 md:col-span-9">
              <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05] tracking-[-0.02em]">
                Systems & Case Studies
              </h1>
              <p className="mt-4 text-[17px] text-[var(--fg-soft)] leading-[1.6] max-w-[62ch]">
                Each project below is a real system with an identified technical lead, proven architectural decisions, and an honest evaluation of trade-offs and constraints.
              </p>
            </div>
          </div>

          <div className="divide-y border-y" style={{ borderColor: "var(--hairline)" }}>
            {projects.projects.map((project) => {
              const owner = memberById(project.owner);
              return (
                <article
                  key={project.id}
                  className="py-8 sm:py-10 grid grid-cols-12 gap-5 items-start group"
                >
                  <div className="col-span-12 sm:col-span-1 text-[13px] font-mono text-[var(--meta)]">
                    {project.index}
                  </div>

                  <div className="col-span-12 sm:col-span-4 pr-4">
                    <Link
                      href={`/work/${project.id}`}
                      className="block text-[26px] leading-[1.1] tracking-[-0.015em] font-medium hover:underline underline-offset-4"
                    >
                      {project.title}
                    </Link>
                    <span className="block text-[13px] text-[var(--meta)] mt-2">
                      Lead: {owner ? (
                        <Link href={`/team/${owner.id}`} className="hover:text-[var(--fg)] underline underline-offset-2">
                          {owner.name}
                        </Link>
                      ) : project.owner} · {project.year}
                    </span>
                  </div>

                  <div className="col-span-12 sm:col-span-5 text-[14px] text-[var(--fg-soft)] leading-[1.6]">
                    <p>{project.summary}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.stack.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 border"
                          style={{ borderColor: "var(--hairline)" }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-2 flex items-center sm:justify-end gap-2 pt-2 sm:pt-0">
                    <Link
                      href={`/work/${project.id}`}
                      className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.14em] px-3 py-2 border hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                      style={{ borderColor: "var(--hairline)" }}
                    >
                      Read Case Study <ArrowUpRight size={13} strokeWidth={1.5} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <Contact />
    </>
  );
}
