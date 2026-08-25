#!/usr/bin/env node
// Validate the JSON files in /content using the same Zod schemas the app uses.
// Usage:  node scripts/validate-content.mjs
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const CapabilityKey = z.enum([
  "product-ux", "frontend-motion", "backend-platform", "mobile",
  "ai-rag", "automation-systems", "security",
]);
const WorkStatus = z.enum(["Prototype", "Active", "Archived"]);

const LinkSchema = z.object({ label: z.string().min(1).max(60), href: z.string().url() });

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

const CapabilitySchema = z.object({
  key: CapabilityKey, label: z.string().min(2).max(80), note: z.string().min(2).max(200),
  members: z.array(z.string()).min(1), projects: z.array(z.string()).min(1),
});

const PrincipleSchema = z.object({
  n: z.string().regex(/^\d{2}$/), title: z.string().min(2).max(80), text: z.string().min(10).max(400),
});

const OSStepSchema = z.object({
  k: z.string().regex(/^\d{2}$/), t: z.string().min(2).max(40), d: z.string().min(10).max(200),
});

const SiteFileSchema = z.object({
  site: z.object({
    name: z.string(), url: z.string().url(), tagline: z.string(), subcopy: z.string(),
    foundingCity: z.string(), foundingCountry: z.string(),
    contactEmail: z.string().email(),
    manifesto: z.array(z.string()),
    heroCta: z.object({ primary: z.string(), secondary: z.string() }),
    footer: z.object({ credit: z.string(), version: z.string() }),
  }),
  social: z.object({ team: z.array(z.object({ id: z.string(), github: z.string().url(), linkedin: z.string().url() })) }),
});

const TeamFileSchema = z.object({
  team: z.array(TeamMemberSchema).min(1),
  meta: z.object({
    foundingCity: z.string(), foundingCountry: z.string(),
    contactEmail: z.string().email(), publicDisclosure: z.string(),
  }),
});

const ProjectsFileSchema = z.object({ projects: z.array(ProjectSchema).min(1) });

const CapabilitiesFileSchema = z.object({
  capabilities: z.array(CapabilitySchema).min(1),
  principles: z.array(PrincipleSchema).min(1),
  operatingSystem: z.array(OSStepSchema).min(1),
});

async function load(name) {
  const path = resolve(root, "content", name);
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw);
}

function check(label, schema, data) {
  const r = schema.safeParse(data);
  if (!r.success) {
    console.error(`\n✗ ${label}`);
    for (const i of r.error.issues.slice(0, 10)) {
      console.error(`  · ${i.path.join(".") || "(root)"} — ${i.message}`);
    }
    process.exitCode = 1;
    return false;
  }
  console.log(`✓ ${label}`);
  return true;
}

const team = await load("team.json");
const projects = await load("projects.json");
const capabilities = await load("capabilities.json");
const site = await load("site.json");

let ok = true;
ok = check("content/team.json", TeamFileSchema, team) && ok;
ok = check("content/projects.json", ProjectsFileSchema, projects) && ok;
ok = check("content/capabilities.json", CapabilitiesFileSchema, capabilities) && ok;
ok = check("content/site.json", SiteFileSchema, site) && ok;

// Cross-file integrity
if (ok) {
  const memberIds = new Set(team.team.map((m) => m.id));
  const projectIds = new Set(projects.projects.map((p) => p.id));
  const errors = [];
  for (const p of projects.projects) {
    if (!memberIds.has(p.owner)) errors.push(`projects/${p.id}.owner "${p.owner}" is not a known member id`);
  }
  for (const c of capabilities.capabilities) {
    for (const m of c.members) if (!memberIds.has(m)) errors.push(`capabilities/${c.key}.members includes unknown "${m}"`);
    for (const p of c.projects) if (!projectIds.has(p)) errors.push(`capabilities/${c.key}.projects includes unknown "${p}"`);
  }
  if (errors.length) {
    ok = false;
    console.error("\n✗ cross-file integrity");
    for (const e of errors) console.error(`  · ${e}`);
  } else {
    console.log("✓ cross-file integrity");
  }
}

if (ok) console.log("\nAll content is valid.\n");
else console.error("\nValidation failed.\n");