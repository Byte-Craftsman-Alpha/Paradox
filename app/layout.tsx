import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import "../src/index.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://teamparadox.in"),
  title: {
    default: "Team Paradox — Contradiction, engineered.",
    template: "%s — Team Paradox",
  },
  description:
    "Team Paradox is a five-member student tech team in Gorakhpur, India. We design and build thoughtful digital systems across product, web, mobile, AI and security.",
  applicationName: "Team Paradox",
  authors: [{ name: "Team Paradox" }],
  keywords: ["Team Paradox", "studio", "student tech team", "product", "AI", "RAG", "security", "Gorakhpur", "India"],
  creator: "Team Paradox",
  publisher: "Team Paradox",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://teamparadox.in/",
    siteName: "Team Paradox",
    title: "Team Paradox — Contradiction, engineered.",
    description:
      "A five-member student tech team designing and building thoughtful digital systems. Evidence over adjectives.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Paradox — Contradiction, engineered.",
    description:
      "A five-member student tech team. Evidence over adjectives.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFBF7" },
    { media: "(prefers-color-scheme: dark)", color: "#191A18" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={publicSans.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Team Paradox",
              url: "https://teamparadox.in/",
              description:
                "Five-member student tech team building digital systems across product, web, mobile, AI and security.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Gorakhpur",
                addressCountry: "IN",
              },
              sameAs: [
                "https://github.com/Anshika9838",
                "https://github.com/Byte-Craftsman-Alpha",
                "https://github.com/tripcoded",
                "https://github.com/Abhiuday02",
                "https://github.com/annie067",
              ],
              member: [
                { "@type": "Person", name: "Anshika Singh", sameAs: "https://www.linkedin.com/in/anshika-singh-aa6a7a330/" },
                { "@type": "Person", name: "Aditya Chaudhari", sameAs: "https://www.linkedin.com/in/byte-craftsman-alpha/" },
                { "@type": "Person", name: "Om Abhishek Tripathi", sameAs: "https://www.linkedin.com/in/om-abhishek-tripathi-57a261329/" },
                { "@type": "Person", name: "Abhiuday Pratap Singh", sameAs: "https://www.linkedin.com/in/abhiuday-pratap-singh-3745232b9/" },
                { "@type": "Person", name: "Ananya Singh", sameAs: "https://www.linkedin.com/in/ananya-singh-b53602326/" },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}