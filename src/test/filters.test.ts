import { projects, teamMembers, capabilities } from "../data/team";

describe("filter logic", () => {
  it("filters projects by capability", () => {
    const filter = "ai-rag" as const;
    const result = projects.filter((p) => p.capabilities.includes(filter));
    expect(result.length).toBeGreaterThan(0);
    for (const r of result) expect(r.capabilities).toContain(filter);
  });

  it("filters members by capability", () => {
    const filter = "frontend-motion" as const;
    const result = teamMembers.filter((m) => m.capabilities.includes(filter));
    expect(result.map((m) => m.id)).toContain("abhiuday");
  });

  it("ledger keeps member + project ids valid", () => {
    const memberIds = new Set(teamMembers.map((m) => m.id));
    const projectIds = new Set(projects.map((p) => p.id));
    for (const c of capabilities) {
      for (const m of c.members) expect(memberIds.has(m)).toBe(true);
      for (const p of c.projects) expect(projectIds.has(p)).toBe(true);
    }
  });

  it("never claims rules-based scoring as trained ML", () => {
    const corpus = JSON.stringify(projects).toLowerCase();
    expect(corpus).not.toMatch(/trained model/);
    expect(corpus).not.toMatch(/fine-tun(ed|ing)/);
    // rules-based is allowed
    expect(corpus).toMatch(/deterministic|heuristic|rule/);
  });

  it("never invents client/testimonial/awards language", () => {
    const corpus = JSON.stringify({ projects, teamMembers, capabilities }).toLowerCase();
    expect(corpus).not.toMatch(/testimonial/);
    expect(corpus).not.toMatch(/clients?/);
    expect(corpus).not.toMatch(/awarded/);
  });

  it("owner names match real team ids", () => {
    const ownerByMember = new Map(teamMembers.map((m) => [m.name, m.id]));
    for (const p of projects) {
      expect(ownerByMember.get(p.owner)).toBeTruthy();
    }
  });

  it("Ananya is spelled correctly", () => {
    const m = teamMembers.find((x) => x.id === "ananya");
    expect(m?.name).toBe("Ananya Singh");
  });
});
