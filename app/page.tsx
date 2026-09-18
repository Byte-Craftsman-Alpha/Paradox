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

export const metadata: Metadata = {
  title: "Team Paradox — Student tech studio in Gorakhpur",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "https://www.teamparadox.in/",
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