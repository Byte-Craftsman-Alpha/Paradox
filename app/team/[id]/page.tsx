import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { TeamMemberView } from "@/components/TeamMemberView";
import { memberById, teamMembers } from "@/lib/content";

export function generateStaticParams() {
  return teamMembers.map((m) => ({ id: m.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const m = memberById(id);
  if (!m) return { title: "Member not found" };
  return {
    title: `${m.name} — ${m.role}`,
    description: m.responsibility,
    openGraph: {
      type: "profile",
      title: `${m.name} — ${m.role}`,
      description: m.responsibility,
    },
  };
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = memberById(id);
  if (!member) notFound();
  return (
    <>
      <Header />
      <main id="main">
        <TeamMemberView member={member} />
      </main>
      <Contact />
    </>
  );
}