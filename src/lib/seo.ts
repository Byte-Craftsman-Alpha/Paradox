export const HUB_HOST = "https://www.teamparadox.in";
export const APEX_HOST = "https://teamparadox.in";

export interface FederatedMember {
  slug: string;
  name: string;
  role: string;
  discipline: string;
  host: string;
  github: string;
  linkedin: string;
  email: string;
  jobTitle: string;
  knowsAbout: string[];
}

export const FEDERATED_MEMBERS: readonly FederatedMember[] = [
  {
    slug: "anshika",
    name: "Anshika Singh",
    role: "Founder / Team Leader",
    discipline: "Product & Experience · Security Product",
    host: "https://anshika.teamparadox.in",
    github: "https://github.com/Anshika9838",
    linkedin: "https://www.linkedin.com/in/anshika-singh-aa6a7a330/",
    email: "anshika@teamparadox.in",
    jobTitle: "Product & Security Engineer",
    knowsAbout: ["React", "TypeScript", "Next.js", "Framer Motion", "Supabase", "FastAPI", "Flutter", "Browser Extensions", "Security Heuristics"],
  },
  {
    slug: "aditya",
    name: "Aditya Chaudhari",
    role: "Co-Leader",
    discipline: "Platform / Backend / Mobile",
    host: "https://aditya.teamparadox.in",
    github: "https://github.com/Byte-Craftsman-Alpha",
    linkedin: "https://www.linkedin.com/in/byte-craftsman-alpha/",
    email: "aditya@teamparadox.in",
    jobTitle: "Python-led full-stack engineer",
    knowsAbout: ["Python", "Flask", "FastAPI", "WebSockets", "Socket.IO", "Flutter", "PWA", "TWA", "Selenium", "OpenCV", "SQLite"],
  },
  {
    slug: "om",
    name: "Om Abhishek Tripathi",
    role: "AI / RAG Engineer",
    discipline: "Retrieval · Embeddings · Applied AI",
    host: "https://om.teamparadox.in",
    github: "https://github.com/tripcoded",
    linkedin: "https://www.linkedin.com/in/om-abhishek-tripathi-57a261329/",
    email: "om@teamparadox.in",
    jobTitle: "RAG & Applied AI Engineer",
    knowsAbout: ["Next.js", "React", "TypeScript", "FastAPI", "LangChain", "Groq", "HuggingFace Embeddings", "Chroma", "Vector Databases"],
  },
  {
    slug: "abhiuday",
    name: "Abhiuday Pratap Singh",
    role: "Frontend Interaction Engineer",
    discipline: "Motion · 3D UI · Frontend Systems",
    host: "https://abhiuday.teamparadox.in",
    github: "https://github.com/Abhiuday02",
    linkedin: "https://www.linkedin.com/in/abhiuday-pratap-singh-3745232b9/",
    email: "abhiuday@teamparadox.in",
    jobTitle: "Frontend Interaction & Motion Engineer",
    knowsAbout: ["Next.js", "React", "TypeScript", "Framer Motion", "3D UI", "Express", "Prisma", "PostgreSQL", "FastAPI"],
  },
  {
    slug: "ananya",
    name: "Ananya Singh",
    role: "Product Frontend Engineer",
    discipline: "Discovery · Document Systems · Marketplace",
    host: "https://ananya.teamparadox.in",
    github: "https://github.com/ananya658",
    linkedin: "https://www.linkedin.com/in/ananya-singh-b53602326/",
    email: "ananya@teamparadox.in",
    jobTitle: "Product Frontend Engineer",
    knowsAbout: ["React", "TypeScript", "Vite", "Framer Motion", "Supabase", "Document Parsing", "Marketplace Systems"],
  },
] as const;

export function buildHubGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${HUB_HOST}/#org`,
        name: "Team Paradox",
        alternateName: ["Team Paradox Gorakhpur", "Paradox Studio"],
        url: `${HUB_HOST}/`,
        logo: {
          "@type": "ImageObject",
          url: `${HUB_HOST}/opengraph-image`,
          width: 1200,
          height: 630,
        },
        email: "hello@teamparadox.in",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Gorakhpur",
          addressRegion: "Uttar Pradesh",
          addressCountry: "IN",
        },
        areaServed: "IN",
        sameAs: [
          ...FEDERATED_MEMBERS.map((m) => `${m.host}/`),
          "https://github.com/Byte-Craftsman-Alpha",
          "https://github.com/Anshika9838",
          "https://github.com/tripcoded",
          "https://github.com/Abhiuday02",
          "https://github.com/ananya658",
        ],
        member: FEDERATED_MEMBERS.map((m) => ({
          "@id": `${HUB_HOST}/team/${m.slug}#person`,
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${HUB_HOST}/#website`,
        url: `${HUB_HOST}/`,
        name: "Team Paradox",
        inLanguage: "en-IN",
        publisher: { "@id": `${HUB_HOST}/#org` },
      },
    ],
  };
}

export function buildHubMemberPersonJsonLd(slug: string) {
  const member = FEDERATED_MEMBERS.find((m) => m.slug === slug);
  if (!member) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${HUB_HOST}/team/${member.slug}#person`,
    mainEntityOfPage: `${HUB_HOST}/team/${member.slug}`,
    name: member.name,
    url: `${HUB_HOST}/team/${member.slug}`,
    jobTitle: member.role,
    email: member.email,
    affiliation: {
      "@type": "Organization",
      "@id": `${HUB_HOST}/#org`,
      name: "Team Paradox",
      url: `${HUB_HOST}/`,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gorakhpur",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    sameAs: [
      `${member.host}/`,
      member.github,
      member.linkedin,
    ],
    knowsAbout: member.knowsAbout,
  };
}

export function buildProjectSoftwareJsonLd(project: {
  id: string;
  title: string;
  summary: string;
  owner: string;
  stack: string[];
  links: { label: string; href: string }[];
}) {
  const ownerMember = FEDERATED_MEMBERS.find((m) => m.slug === project.owner);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${HUB_HOST}/work/${project.id}#app`,
    name: project.title,
    description: project.summary,
    url: `${HUB_HOST}/work/${project.id}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web, Cross-platform",
    producer: {
      "@type": "Organization",
      "@id": `${HUB_HOST}/#org`,
      name: "Team Paradox",
      url: `${HUB_HOST}/`,
    },
    author: ownerMember
      ? {
          "@type": "Person",
          "@id": `${HUB_HOST}/team/${ownerMember.slug}#person`,
          name: ownerMember.name,
          url: `${HUB_HOST}/team/${ownerMember.slug}`,
        }
      : undefined,
    keywords: project.stack.join(", "),
    codeRepository: project.links.find((l) => l.href.includes("github.com"))?.href,
  };
}

