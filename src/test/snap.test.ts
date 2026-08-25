describe("EASE curve", () => {
  it("starts slow and ends ease-out", () => {
    const EASE = [0.22, 1, 0.36, 1] as const;
    function bezier(t: number, p: number[]) {
      const cp = [0, ...p, 1];
      while (cp.length > 1) {
        for (let i = 0; i < cp.length - 1; i++) cp[i] = cp[i] * (1 - t) + cp[i + 1] * t;
        cp.length = cp.length - 1;
      }
      return cp[0];
    }
    const early = bezier(0.1, [...EASE]);
    const late = bezier(0.9, [...EASE]);
    expect(late).toBeGreaterThan(early);
    expect(late).toBeGreaterThan(0.9);
    expect(early).toBeLessThan(0.18);
  });
});
