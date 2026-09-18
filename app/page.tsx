import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Work } from "@/components/Work";
import { Capabilities } from "@/components/Capabilities";
import { Team } from "@/components/Team";
import { OperatingSystem } from "@/components/OperatingSystem";
import { Principles } from "@/components/Principles";
import { Contact } from "@/components/Contact";
import { FilterProvider } from "@/components/FilterProvider";
import { SectionIndicatorMount } from "@/components/SectionIndicatorMount";
import { HUB_HOST } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Team Paradox — Student tech studio in Gorakhpur",
  description:
    "Five students in Gorakhpur building real systems in product, web, mobile, AI and security. EduPortal, ARIA, Theft Alert — evidence over adjectives.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Team Paradox — Student tech studio in Gorakhpur",
    description:
      "Five students in Gorakhpur building real systems in product, web, mobile, AI and security. Evidence over adjectives.",
    url: HUB_HOST,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Team Paradox Studio Hub",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Paradox — Student tech studio in Gorakhpur",
    description:
      "Five students in Gorakhpur building real systems in product, web, mobile, AI and security. Evidence over adjectives.",
    images: ["/opengraph-image"],
  },
};

export default function HomePage() {
  return (
    <>
      <a className="sr-only" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <FilterProvider>
          <Hero />
          <Manifesto />
          <Work />
          <Capabilities />
          <Team />
          <OperatingSystem />
          <Principles />
          <Contact />
          <SectionIndicatorMount />
        </FilterProvider>
      </main>
    </>
  );
}