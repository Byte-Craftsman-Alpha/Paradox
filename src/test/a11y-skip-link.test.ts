import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("accessibility: skip to content and focus target integrity", () => {
  const root = path.resolve(__dirname, "../..");

  it("ensures Header contains the primary skip link pointing to #main", () => {
    const headerCode = fs.readFileSync(path.join(root, "src/components/Header.tsx"), "utf-8");
    expect(headerCode).toMatch(/href="#main"/);
    expect(headerCode).toMatch(/className="skip-link"/);
    expect(headerCode).toMatch(/Skip to content/);
    expect(headerCode).toMatch(/handleSkipToContent/);
  });

  it("ensures no duplicate skip links exist in app/page.tsx", () => {
    const pageCode = fs.readFileSync(path.join(root, "app/page.tsx"), "utf-8");
    const matches = pageCode.match(/Skip to content/g);
    expect(matches).toBeNull();
  });

  it("ensures all routes define a programmatically focusable <main id=\"main\"> with tabIndex={-1}", () => {
    const pageFiles = [
      "app/page.tsx",
      "app/work/page.tsx",
      "app/work/[id]/page.tsx",
      "app/team/[id]/page.tsx",
      "app/network/page.tsx",
      "app/system/page.tsx",
      "app/not-found.tsx",
      "app/error.tsx",
    ];

    for (const relPath of pageFiles) {
      const code = fs.readFileSync(path.join(root, relPath), "utf-8");
      expect(code, `Expected ${relPath} to contain <main id="main"`).toMatch(/<main[^>]*id="main"/);
      expect(code, `Expected ${relPath} to have tabIndex={-1}`).toMatch(/<main[^>]*tabIndex=\{-1\}/);
      expect(code, `Expected ${relPath} to have focus:outline-none`).toMatch(/<main[^>]*focus:outline-none/);
    }
  });

  it("ensures css defines viewport-pinned .skip-link with focus styles", () => {
    const css = fs.readFileSync(path.join(root, "src/index.css"), "utf-8");
    expect(css).toMatch(/\.skip-link\s*\{[^}]*position:\s*fixed/);
    expect(css).toMatch(/\.skip-link:focus/);
    expect(css).toMatch(/\.skip-link:focus-visible/);
  });
});

