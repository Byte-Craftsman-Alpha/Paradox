import { describe, it, expect } from "vitest";
import { projects, teamMembers, capabilities, achievements, type CapabilityKey } from "../lib/content";

describe("filter logic", () => {
  it("filters projects by capability", () => {
    const filter: CapabilityKey = "ai-rag";
    const result = projects.projects.filter((p) => p.capabilities.includes(filter));
    expect(result.length).toBeGreaterThan(0);
    for (const r of result) expect(r.capabilities).toContain(filter);
  });

  it("filters members by capability", () => {
    const filter: CapabilityKey = "frontend-motion";
    const result = teamMembers.filter((m) => m.capabilities.includes(filter));
    expect(result.map((m) => m.id)).toContain("abhiuday");
  });

  it("ledger keeps member + project ids valid", () => {
    const memberIds = new Set(teamMembers.map((m) => m.id));
    const projectIds = new Set(projects.projects.map((p) => p.id));
    for (const c of capabilities) {
      for (const m of c.members) expect(memberIds.has(m)).toBe(true);
      for (const p of c.projects) expect(projectIds.has(p)).toBe(true);
    }
  });

  it("never falsely claims rules-based scoring as proprietary trained ML models", () => {
    const corpus = JSON.stringify(projects.projects).toLowerCase();
    expect(corpus).not.toMatch(/custom trained model/);
    expect(corpus).not.toMatch(/proprietary fine-tun/);
    // rules-based and heuristics are allowed and expected
    expect(corpus).toMatch(/deterministic|heuristic|rule/);
  });

  it("never invents agency client/testimonial/awards language", () => {
    const corpus = JSON.stringify({ projects: projects.projects, teamMembers, capabilities }).toLowerCase();
    expect(corpus).not.toMatch(/testimonial/);
    expect(corpus).not.toMatch(/our clients/);
    expect(corpus).not.toMatch(/client roster/);
    expect(corpus).not.toMatch(/awarded/);
  });

  it("owner ids match real team ids", () => {
    const memberIds = new Set(teamMembers.map((m) => m.id));
    for (const p of projects.projects) {
      expect(memberIds.has(p.owner)).toBe(true);
    }
  });

  it("Ananya is spelled correctly", () => {
    const m = teamMembers.find((x) => x.id === "ananya");
    expect(m?.name).toBe("Ananya Singh");
  });

  it("achievements timeline records valid project milestones and non-empty evidence", () => {
    const projectIds = new Set(projects.projects.map((p) => p.id));
    expect(achievements.length).toBeGreaterThan(0);
    for (const a of achievements) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.highlight.length).toBeGreaterThan(0);
      expect(a.summary.length).toBeGreaterThan(10);
      if (a.project) {
        expect(projectIds.has(a.project)).toBe(true);
      }
    }
  });
});
