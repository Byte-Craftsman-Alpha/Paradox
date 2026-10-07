"use client";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Github, Linkedin, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/lib/useTheme";
import { scrollToId } from "@/lib/scroll";
import type { Theme } from "@/lib/content";
import { EASE } from "@/lib/motion";

const NAV = [
  { id: "work", label: "Work", href: "/#work" },
  { id: "capabilities", label: "Capabilities", href: "/#capabilities" },
  { id: "team", label: "Team", href: "/#team" },
  { id: "achievements", label: "Timeline", href: "/#achievements" },
  { id: "network", label: "Network", href: "/network" },
  { id: "principles", label: "Principles", href: "/#principles" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleNavClick = (item: (typeof NAV)[number]) => {
    setOpen(false);
    if (item.href.startsWith("/#")) {
      const sectionId = item.href.replace("/#", "");
      if (pathname === "/") {
        if (typeof window !== "undefined" && window.history?.pushState) {
          window.history.pushState(null, "", `#${sectionId}`);
        }
        requestAnimationFrame(() => scrollToId(sectionId));
      } else {
        router.push(item.href);
      }
    } else {
      router.push(item.href);
    }
  };

  const cycleTheme = () => {
    const order: Theme[] = ["milk", "charcoal", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const handleSkipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById("main");
    if (main) {
      e.preventDefault();
      main.focus();
      scrollToId("main");
      if (typeof window !== "undefined" && window.history?.pushState) {
        window.history.pushState(null, "", "#main");
      }
    }
  };

  return (
    <>
      <a href="#main" className="skip-link" onClick={handleSkipToContent}>
        Skip to content
      </a>
      <motion.header
        initial={false}
        animate={{}}
        data-scrolled={scrolled}
        style={{
          borderColor: "var(--hairline)",
        }}
        className="fixed inset-x-0 top-0 z-50 backdrop-blur-[2px]"
      >
        <div
          className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5 sm:px-7"
          style={{
            background: "color-mix(in srgb, var(--bg) 86%, transparent)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                scrollToId("top");
              }
            }}
            className="group flex items-center gap-2 text-[13px] font-medium tracking-[0.18em] uppercase"
            aria-label="Team Paradox home"
          >
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-[var(--fg)]" />
            <span className="block">Team&nbsp;Paradox</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-[13px]" aria-label="Primary">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNavClick(n)}
                className="px-3 py-2 text-[var(--fg-soft)] hover:text-[var(--fg)] tracking-[0.02em] relative group"
                style={{ minHeight: 44 }}
              >
                <span className="relative">
                  {n.label}
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--fg)]"
                    style={{
                      transition: "none",
                    }}
                  />
                </span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/network"
              className="hidden lg:inline-flex items-center gap-1.5 h-8 px-2.5 text-[11px] uppercase tracking-[0.14em] border text-[var(--fg-soft)] hover:text-[var(--fg)] hover:border-[var(--fg)] mr-2"
              style={{ borderColor: "var(--hairline)" }}
              title="View federated spoke websites"
            >
              <Network size={13} strokeWidth={1.5} />
              <span>Network</span>
            </Link>

            <button
              onClick={cycleTheme}
              aria-label={`Theme: ${theme}. Click to switch.`}
              title={`Theme: ${theme}`}
              className="hidden md:flex h-9 items-center gap-2 px-3 text-[12px] uppercase tracking-[0.12em] text-[var(--fg-soft)] hover:text-[var(--fg)]"
              style={{ minHeight: 44, minWidth: 88 }}
            >
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-current" />
              <span>{theme}</span>
            </button>
            <a
              href="https://github.com/Byte-Craftsman-Alpha"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hidden md:flex h-11 w-11 items-center justify-center text-[var(--fg-soft)] hover:text-[var(--fg)]"
            >
              <Github size={16} strokeWidth={1.5} />
            </a>
            <a
              href="https://www.linkedin.com/in/byte-craftsman-alpha/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hidden md:flex h-11 w-11 items-center justify-center text-[var(--fg-soft)] hover:text-[var(--fg)]"
            >
              <Linkedin size={16} strokeWidth={1.5} />
            </a>
            <button
              ref={triggerRef}
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-sheet"
              className="md:hidden flex h-11 w-11 items-center justify-center"
              aria-label="Open menu"
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            id="mobile-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE } }}
            ref={dialogRef}
          >
            <div className="absolute inset-0 bg-[var(--bg)]" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between h-14 px-5 border-b" style={{ borderColor: "var(--hairline)" }}>
                <span className="text-[13px] tracking-[0.18em] uppercase">Team Paradox</span>
                <button
                  onClick={() => { setOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()); }}
                  aria-label="Close menu"
                  className="h-11 w-11 flex items-center justify-center"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex-1 px-5 py-8" aria-label="Mobile primary">
                <ul className="divide-y" style={{ borderColor: "var(--hairline)" }}>
                  {NAV.map((n, i) => (
                    <motion.li
                      key={n.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.04 + i * 0.05, duration: 0.32, ease: EASE } }}
                    >
                      <button
                        onClick={() => handleNavClick(n)}
                        className="w-full text-left py-4 text-[28px] leading-[1.1] tracking-[-0.01em] text-[var(--fg)]"
                      >
                        <span className="text-[var(--meta)] mr-3 text-[14px] align-middle font-mono">0{i + 1}</span>
                        {n.label}
                      </button>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-10 flex items-center justify-between">
                  <button
                    onClick={cycleTheme}
                    aria-label={`Theme: ${theme}`}
                    className="text-[12px] uppercase tracking-[0.12em] text-[var(--fg-soft)]"
                  >
                    Theme · {theme}
                  </button>
                  <div className="flex items-center gap-2">
                    <a href="https://github.com/Byte-Craftsman-Alpha" target="_blank" rel="noreferrer" aria-label="GitHub" className="h-11 w-11 flex items-center justify-center text-[var(--fg-soft)]">
                      <Github size={16} strokeWidth={1.5} />
                    </a>
                    <a href="https://www.linkedin.com/in/byte-craftsman-alpha/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="h-11 w-11 flex items-center justify-center text-[var(--fg-soft)]">
                      <Linkedin size={16} strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
