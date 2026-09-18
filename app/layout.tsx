import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import { HUB_HOST, buildHubGraphJsonLd } from "@/lib/seo";
import "../src/index.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(HUB_HOST),
  title: {
    default: "Team Paradox — Student tech studio in Gorakhpur",
    template: "%s — Team Paradox",
  },
  description:
    "Five students in Gorakhpur building real systems in product, web, mobile, AI and security. EduPortal, ARIA, Theft Alert — evidence over adjectives.",
  applicationName: "Team Paradox",
  authors: [{ name: "Team Paradox", url: HUB_HOST }],
  generator: "Next.js",
  keywords: [
    "Team Paradox",
    "Team Paradox Gorakhpur",
    "student tech studio",
    "Gorakhpur tech studio",
    "product engineering",
    "AI",
    "RAG",
    "security",
    "EduPortal",
    "Theft Alert",
    "ARIA",
    "Uttar Pradesh",
    "India",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Team Paradox",
  publisher: "Team Paradox",
  category: "technology",
  classification: "Technology & Software Engineering",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Team Paradox",
    title: "Team Paradox — Student tech studio in Gorakhpur",
    description:
      "Five students in Gorakhpur building real systems in product, web, mobile, AI and security. EduPortal, ARIA, Theft Alert — evidence over adjectives.",
    url: HUB_HOST,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Team Paradox — Student Tech Studio in Gorakhpur",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
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
  const jsonLdGraph = buildHubGraphJsonLd();

  return (
    <html lang="en-IN" className={publicSans.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdGraph),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}