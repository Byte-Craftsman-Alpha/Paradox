import { z } from "zod";
import teamJson from "../../content/team.json";
import projectsJson from "../../content/projects.json";
import capabilitiesJson from "../../content/capabilities.json";
import siteJson from "../../content/site.json";

export const CapabilityKey = z.enum([
  "product-ux",
  "frontend-motion",
  "backend-platform",
  "mobile",
  "ai-rag",
  "automation-systems",
  "security",
]);
export type CapabilityKey = z.infer<typeof CapabilityKey>;

export type Theme = "milk" | "charcoal" | "system";

export const WorkStatus = z.enum(["Prototype", "Active", "Archived"]);
export type WorkStatus = z.infer<typeof WorkStatus>;

const LinkSchema = z.object({
  label: z.string().min(1).max(60),
  href: z.string().url(),
});

const TeamMemberSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(2).max(80),
  role: z.string().min(2).max(120),
  discipline: z.string().min(2).max(160),
  github: z.string().url(),
  linkedin: z.string().url(),
  responsibility: z.string().min(10).max(600),
  stack: z.array(z.string().min(1).max(60)).min(1).max(40),
  evidence: z.array(z.string().min(1).max(240)).min(1).max(10),
  capabilities: z.array(CapabilityKey).min(1),
  initials: z.string().min(1).max(3),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

const ProjectSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  title: z.string().min(1).max(80),
  summary: z.string().min(20).max(320),
  problem: z.string().min(20).max(600),
  owner: z.string(),
  ownerRole: z.string().min(2).max(120),
  status: WorkStatus,
  year: z.string().min(4).max(40),
  stack: z.array(z.string().min(1).max(60)).min(1).max(40),
  architecture: z.array(z.string().min(1).max(280)).min(1).max(20),
  decisions: z.array(z.string().min(1).max(280)).min(1).max(20),
  limitations: z.array(z.string().min(1).max(280)).min(1).max(20),
  links: z.array(LinkSchema).min(1).max(6),
  capabilities: z.array(CapabilityKey).min(1),
  index: z.string().regex(/^\d{2}$/),
});
export type Project = z.infer<typeof ProjectSchema>;

const CapabilitySchema = z.object({
  key: CapabilityKey,
  label: z.string().min(2).max(80),
  note: z.string().min(2).max(200),
  members: z.array(z.string()).min(1),
  projects: z.array(z.string()).min(1),
});

const PrincipleSchema = z.object({
  n: z.string().regex(/^\d{2}$/),
  title: z.string().min(2).max(80),
  text: z.string().min(10).max(400),
});

const OSStepSchema = z.object({
  k: z.string().regex(/^\d{2}$/),
  t: z.string().min(2).max(40),
  d: z.string().min(10).max(200),
});

const SocialEntry = z.object({
  id: z.string(),
  github: z.string().url(),
  linkedin: z.string().url(),
});

const SiteSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  tagline: z.string(),
  subcopy: z.string(),
  foundingCity: z.string(),
  foundingCountry: z.string(),
  contactEmail: z.string().email(),
  manifesto: z.array(z.string()),
  heroCta: z.object({ primary: z.string(), secondary: z.string() }),
  footer: z.object({ credit: z.string(), version: z.string() }),
});

const TeamFileSchema = z.object({
  team: z.array(TeamMemberSchema).min(1),
  meta: z.object({
    foundingCity: z.string(),
    foundingCountry: z.string(),
    contactEmail: z.string().email(),
    publicDisclosure: z.string(),
  }),
});

const ProjectsFileSchema = z.object({
  projects: z.array(ProjectSchema).min(1),
});

const CapabilitiesFileSchema = z.object({
  capabilities: z.array(CapabilitySchema).min(1),
  principles: z.array(PrincipleSchema).min(1),
  operatingSystem: z.array(OSStepSchema).min(1),
});

const SiteFileSchema = z.object({
  site: SiteSchema,
  social: z.object({ team: z.array(SocialEntry) }),
});

function parseOrThrow<T>(label: string, schema: z.ZodType<T>, raw: unknown): T {
  const res = schema.safeParse(raw);
  if (!res.success) {
    const issues = res.error.issues
      .slice(0, 5)
      .map((i) => `  · ${i.path.join(".")} — ${i.message}`)
      .join("\n");
    throw new Error(`[content] ${label} failed validation:\n${issues}`);
  }
  return res.data;
}

export const team = parseOrThrow("content/team.json", TeamFileSchema, teamJson);
export const projects = parseOrThrow("content/projects.json", ProjectsFileSchema, projectsJson);
export const capabilityFile = parseOrThrow(
  "content/capabilities.json",
  CapabilitiesFileSchema,
  capabilitiesJson,
);
export const siteFile = parseOrThrow("content/site.json", SiteFileSchema, siteJson);

export const teamMembers: TeamMember[] = team.team;
export const capabilities = capabilityFile.capabilities;
export const principles = capabilityFile.principles;
export const osSteps = capabilityFile.operatingSystem;
export const site = siteFile.site;
export const socialTeam = siteFile.social.team;

export function memberById(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}

export function projectsByCapability(key: CapabilityKey): Project[] {
  return projects.projects.filter((p) => p.capabilities.includes(key));
}

export function membersByCapability(key: CapabilityKey): TeamMember[] {
  return teamMembers.filter((m) => m.capabilities.includes(key));
}

export function projectsByOwner(id: string): Project[] {
  return projects.projects.filter((p) => p.owner === id);
}

// Re-export the source-of-truth type aliases to keep current call sites working
export type { CapabilityKey as CapabilityKeyType };
export type { TeamMember as TeamMemberData };
export type { Project as ProjectData };