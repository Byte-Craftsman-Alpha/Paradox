import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github, CheckCircle2, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { projects, memberById } from "@/lib/content";
import { HUB_HOST, buildProjectSoftwareJsonLd, FEDERATED_MEMBERS } from "@/lib/seo";

export function generateStaticParams() {
  return projects.projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const project = projects.projects.find((p) => p.id === id);
  if (!project) return { title: "Case Study Not Found" };

  const title = `${project.title} — ${project.summary.split(".")[0]}`;

  return {
    title: `${title} | Team Paradox`,
    description: project.problem,
    alternates: {
      canonical: `/work/${id}`,
    },
    openGraph: {
      type: "article",
      title: `${project.title} Case Study — Team Paradox`,
      description: project.summary,
      url: `${HUB_HOST}/work/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} Case Study — Team Paradox`,
      description: project.summary,
    },
  };
}

export default async function WorkCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.projects.find((p) => p.id === id);
  if (!project) notFound();

  const owner = memberById(project.owner);
  const federatedSpoke = FEDERATED_MEMBERS.find((m) => m.slug === project.owner);
  const softwareJsonLd = buildProjectSoftwareJsonLd(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareJsonLd),
        }}
      />
      <Header />
      <main id="main" className="relative pt-28 sm:pt-36 pb-20">
        <article className="mx-auto max-w-[1440px] px-5 sm:px-7">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[var(--meta)] hover:text-[var(--fg)] mb-8"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back to all systems
          </Link>

          {/* Header section */}
          <header className="grid grid-cols-12 gap-5 pb-12 border-b" style={{ borderColor: "var(--hairline)" }}>
            <div className="col-span-12 md:col-span-8">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-3">
                <span>System Index · {project.index}</span>
                <span>/</span>
                <span>{project.status}</span>
                <span>/</span>
                <span>{project.year}</span>
              </div>
              <h1 className="text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.02] tracking-[-0.025em] font-medium">
                {project.title}
              </h1>
              <p className="mt-4 text-[19px] leading-[1.5] text-[var(--fg-soft)] max-w-[52ch]">
                {project.summary}
              </p>
            </div>

            <div className="col-span-12 md:col-span-4 flex flex-col md:items-end justify-between gap-6 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] block mb-1">
                  Project Lead
                </span>
                {owner ? (
                  <div>
                    <Link
                      href={`/team/${owner.id}`}
                      className="text-[18px] font-medium hover:underline underline-offset-4 block"
                    >
                      {owner.name}
                    </Link>
                    <span className="text-[13px] text-[var(--meta)] block">{project.ownerRole}</span>
                    {federatedSpoke && (
                      <a
                        href={federatedSpoke.host}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-[var(--fg)] hover:underline mt-2"
                      >
                        Lead's Portfolio <ArrowUpRight size={12} strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                ) : (
                  <span>{project.owner}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {project.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-4 border text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)]"
                    style={{ borderColor: "var(--hairline)" }}
                  >
                    {link.href.includes("github") && <Github size={14} />}
                    {link.label} <ArrowUpRight size={13} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </header>

          {/* Answer-first Executive Summary block */}
          <section className="py-10 border-b" style={{ borderColor: "var(--hairline)" }}>
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-4">
              01 — System Overview & Primary Intent
            </h2>
            <div className="p-6 border text-[17px] leading-[1.65] max-w-[80ch]" style={{ borderColor: "var(--hairline)", background: "var(--milk-2)" }}>
              <strong>{project.title}</strong> is a specialized system engineered by <strong>Team Paradox</strong> in Gorakhpur, led by <strong>{owner?.name || project.owner}</strong>. {project.problem}
            </div>
          </section>

          {/* Core Technical Sections */}
          <div className="grid grid-cols-12 gap-8 py-12 border-b" style={{ borderColor: "var(--hairline)" }}>
            <div className="col-span-12 md:col-span-7 space-y-12">
              <section>
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-4">
                  02 — Architecture & Flow
                </h3>
                <div className="space-y-4">
                  {project.architecture.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border" style={{ borderColor: "var(--hairline)" }}>
                      <span className="text-[13px] font-mono text-[var(--meta)] mt-0.5">0{idx + 1}</span>
                      <p className="text-[15px] leading-[1.6] text-[var(--fg)]">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-4">
                  03 — Engineering Decisions & Rationale
                </h3>
                <ul className="space-y-3">
                  {project.decisions.map((decision, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] leading-[1.6] text-[var(--fg-soft)]">
                      <CheckCircle2 size={16} className="text-[var(--fg)] shrink-0 mt-1" />
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-4">
                  04 — Known Limitations & Failure Modes
                </h3>
                <div className="p-5 border space-y-3" style={{ borderColor: "var(--hairline)" }}>
                  {project.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-[14px] leading-[1.6] text-[var(--fg-soft)]">
                      <AlertTriangle size={15} className="text-[var(--meta)] shrink-0 mt-1" />
                      <span>{limitation}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="col-span-12 md:col-span-5 space-y-8">
              <section className="p-6 border" style={{ borderColor: "var(--hairline)" }}>
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-4">
                  Observed Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[12px] uppercase tracking-[0.12em] px-3 py-1 border font-mono"
                      style={{ borderColor: "var(--hairline)" }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              <section className="p-6 border" style={{ borderColor: "var(--hairline)" }}>
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-3">
                  Engineering Governance
                </h3>
                <p className="text-[13px] leading-[1.6] text-[var(--fg-soft)]">
                  All systems undergo internal peer review with strict claims verification. We do not publish simulated benchmarks, fake testimonial quotes, or obfuscated AI wrappers without deterministic fallbacks.
                </p>
                <div className="mt-4 pt-4 border-t text-[12px] text-[var(--meta)]" style={{ borderColor: "var(--hairline)" }}>
                  Studio: Team Paradox · Gorakhpur, Uttar Pradesh, India
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
      <Contact />
    </>
  );
}

