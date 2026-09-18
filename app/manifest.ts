import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Team Paradox — Student Tech Studio",
    short_name: "Team Paradox",
    description:
      "Five students in Gorakhpur building real systems in product, web, mobile, AI and security. EduPortal, ARIA, Theft Alert — evidence over adjectives.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFBF7",
    theme_color: "#111111",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

