import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { TeamMemberView } from "@/components/TeamMemberView";
import { memberById, teamMembers } from "@/lib/content";
import { HUB_HOST, buildHubMemberPersonJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return teamMembers.map((m) => ({ id: m.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const m = memberById(id);
  if (!m) return { title: "Member not found" };

  const pageTitle = `${m.name} — ${m.role}`;

  return {
    title: pageTitle,
    description: `${m.name} (${m.role}) is a member of Team Paradox, a student tech studio in Gorakhpur, India. ${m.responsibility}`,
    alternates: {
      canonical: `/team/${id}`,
    },
    openGraph: {
      type: "profile",
      title: `${pageTitle} · Team Paradox`,
      description: m.responsibility,
      url: `${HUB_HOST}/team/${id}`,
      images: [
        {
          url: `/og/team-${id}.png`,
          width: 1200,
          height: 630,
          alt: `${m.name} — Team Paradox Profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} · Team Paradox`,
      description: m.responsibility,
    },
  };
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = memberById(id);
  if (!member) notFound();

  const personJsonLd = buildHubMemberPersonJsonLd(id);

  return (
    <>
      {personJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
      )}
      <Header />
      <main id="main">
        <TeamMemberView member={member} />
      </main>
      <Contact />
    </>
  );
}