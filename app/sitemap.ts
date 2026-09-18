import type { MetadataRoute } from "next";
import { HUB_HOST, FEDERATED_MEMBERS } from "@/lib/seo";
import { projects } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const coreRoutes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
    { path: "/network", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/work", changeFrequency: "weekly" as const, priority: 0.9 },
  ];

  const teamRoutes = FEDERATED_MEMBERS.map((m) => ({
    path: `/team/${m.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const projectRoutes = projects.projects.map((p) => ({
    path: `/work/${p.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const allRoutes = [...coreRoutes, ...teamRoutes, ...projectRoutes];

  return allRoutes.map((r) => ({
    url: `${HUB_HOST}${r.path || "/"}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

