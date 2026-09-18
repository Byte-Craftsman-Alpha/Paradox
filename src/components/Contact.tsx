"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site, teamMembers } from "@/lib/content";
import { FEDERATED_MEMBERS } from "@/lib/seo";

type State = "idle" | "submitting" | "success" | "server-error" | "rate-limit" | "validation";

const RATE_KEY = "tp:contact:ts";

export function Contact() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: "",
    email: "",
    org: "",
    type: "Project",
    message: "",
    consent: false,
  });

  const onChange = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = k === "consent" ? (e.target as HTMLInputElement).checked : e.target.value;
    setValues((s) => ({ ...s, [k]: value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const validate = () => {
    const er: Record<string, string> = {};
    if (values.message.trim().length < 12) er.message = "Tell us a little more — at least 12 characters.";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) er.email = "Use a real email address.";
    if (!values.consent) er.consent = "We need consent to even try to reply.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { setState("validation"); return; }
    const last = Number(window.localStorage.getItem(RATE_KEY) ?? 0);
    if (Date.now() - last < 60_000) { setState("rate-limit"); return; }
    setState("submitting");
    // Honest mailto fallback — no fake success.
    try {
      const subject = encodeURIComponent(`[Paradox] ${values.type} — ${values.name || "Anonymous"}`);
      const body = encodeURIComponent(`Name: ${values.name}\nEmail: ${values.email}\nOrg: ${values.org}\nType: ${values.type}\n\n${values.message}`);
      const href = `mailto:${site.contactEmail}?subject=${subject}&body=${body}`;
      // Validation was real; open mail draft.
      window.location.href = href;
      window.localStorage.setItem(RATE_KEY, String(Date.now()));
      setState("success");
    } catch {
      setState("server-error");
    }
  };

  const inputBase = "w-full h-12 px-3 bg-transparent border text-[15px] focus:bg-transparent";

  return (
    <section
      id="contact"
      data-snap-section
      aria-label="Contact"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-7">
        <div className="grid grid-cols-12 gap-5 mb-10 sm:mb-14">
          <div className="col-span-12 md:col-span-3 text-[11px] uppercase tracking-[0.18em] text-[var(--meta)]">
            <span>08</span>
            <span className="ml-2">Contact</span>
          </div>
          <h2 className="col-span-12 md:col-span-9 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] tracking-[-0.02em] max-w-[20ch]">
            Bring us a problem worth untangling.
          </h2>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="grid grid-cols-12 gap-5"
          aria-describedby="contact-status"
        >
          <Field id="name" label="Name" optional col="col-span-12 md:col-span-6" error={errors.name}>
            <input
              id="name"
              type="text"
              value={values.name}
              onChange={onChange("name")}
              className={inputBase}
              style={{ borderColor: "var(--hairline)" }}
              autoComplete="name"
            />
          </Field>
          <Field id="email" label="Email" optional col="col-span-12 md:col-span-6" error={errors.email}>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={onChange("email")}
              className={inputBase}
              style={{ borderColor: "var(--hairline)" }}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field id="org" label="Organisation" optional col="col-span-12 md:col-span-6" error={errors.org}>
            <input
              id="org"
              type="text"
              value={values.org}
              onChange={onChange("org")}
              className={inputBase}
              style={{ borderColor: "var(--hairline)" }}
              autoComplete="organization"
            />
          </Field>
          <Field id="type" label="Inquiry type" col="col-span-12 md:col-span-6" error={errors.type}>
            <div className="relative">
              <select
                id="type"
                value={values.type}
                onChange={onChange("type")}
                className={`${inputBase} appearance-none pr-10`}
                style={{ borderColor: "var(--hairline)" }}
              >
                {["Project", "Collaboration", "Mentorship", "Speaking", "Other"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <span aria-hidden className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--meta)]">↓</span>
            </div>
          </Field>

          <Field id="message" label="Message" col="col-span-12" error={errors.message} hint="A paragraph. Plain words.">
            <textarea
              id="message"
              value={values.message}
              onChange={onChange("message")}
              rows={5}
              required
              aria-invalid={!!errors.message}
              className="w-full px-3 py-3 bg-transparent border text-[15px] resize-y min-h-[120px]"
              style={{ borderColor: "var(--hairline)" }}
            />
          </Field>

          <div className="col-span-12 grid grid-cols-12 gap-5 items-start">
            <div className="col-span-12 md:col-span-8 flex items-start gap-3">
              <input
                id="consent"
                type="checkbox"
                checked={values.consent}
                onChange={onChange("consent")}
                className="mt-1 h-4 w-4"
                aria-invalid={!!errors.consent}
              />
              <label htmlFor="consent" className="text-[13px] leading-[1.5] text-[var(--fg-soft)]">
                I agree you'll use this only to reply. No newsletter, no third parties. <span className="text-[var(--meta)]">(required)</span>
              </label>
            </div>
            <div className="col-span-12 md:col-span-4 md:text-right">
              <button
                type="submit"
                disabled={state === "submitting"}
                className="inline-flex items-center gap-3 h-12 px-5 border border-[var(--fg)] text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--fg)] hover:text-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === "submitting" ? (
                  <>
                    <Spinner /> Drafting email…
                  </>
                ) : (
                  <>Send — opens your email client</>
                )}
              </button>
            </div>
          </div>

          <div id="contact-status" role="status" aria-live="polite" className="col-span-12">
            {state === "success" && (
              <Banner tone="success" title="Email draft opened." body={`If your mail client didn't open, mail ${site.contactEmail} directly.`} />
            )}
            {state === "server-error" && (
              <Banner tone="error" title="Couldn't open mail client." body={`Mail ${site.contactEmail} directly. We've kept your message in this form.`} />
            )}
            {state === "rate-limit" && (
              <Banner tone="warn" title="Slow down." body="One draft per minute from this device. Try again in 60 seconds." />
            )}
            {state === "validation" && Object.keys(errors).length > 0 && (
              <Banner tone="warn" title="Please address the highlighted fields." body="Re-check what we asked for above." />
            )}
            {state === "idle" && (
              <p className="text-[12px] text-[var(--meta)] leading-[1.55] max-w-[64ch]">
                No backend yet. Hitting send opens your mail client with a prefilled draft to {site.contactEmail} — honest, no fake success state. If that fails, write to us directly.
              </p>
            )}
          </div>
        </form>

        <motion.footer
          id="site-footer"
          className="mt-24 sm:mt-32 pt-12 border-t flex flex-col gap-10"
          style={{ borderColor: "var(--hairline)" }}
        >
          <div className="grid grid-cols-12 gap-6 items-start">
            <div className="col-span-12 md:col-span-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-2">↳ Team Paradox</div>
              <div className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.1] tracking-[-0.02em] max-w-[26ch]">
                Five builders. One quiet operating system. The contradiction, engineered.
              </div>
              <p className="mt-3 text-[13px] text-[var(--fg-soft)] leading-[1.55] max-w-[38ch]">
                A student technology studio in Gorakhpur, Uttar Pradesh, India. Real systems, named leads, and verified evidence.
              </p>
            </div>

            <div className="col-span-6 sm:col-span-3 md:col-span-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-3">Studio Index</div>
              <ul className="space-y-2 text-[13px] text-[var(--fg-soft)]">
                <li><Link href="/" className="hover:text-[var(--fg)]">Home</Link></li>
                <li><Link href="/work" className="hover:text-[var(--fg)]">Work & Case Studies</Link></li>
                <li><Link href="/#team" className="hover:text-[var(--fg)]">Studio Team</Link></li>
                <li><Link href="/network" className="hover:text-[var(--fg)] font-medium text-[var(--fg)]">Federation Network →</Link></li>
                <li><Link href="/#principles" className="hover:text-[var(--fg)]">Operating Principles</Link></li>
              </ul>
            </div>

            <div className="col-span-6 sm:col-span-4 md:col-span-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-3">Member Portfolios (Spokes)</div>
              <ul className="space-y-2 text-[13px] text-[var(--fg-soft)]">
                {FEDERATED_MEMBERS.map((m) => (
                  <li key={m.slug} className="flex items-center justify-between gap-2">
                    <a
                      href={m.host}
                      target="_blank"
                      rel="noopener"
                      className="hover:text-[var(--fg)] inline-flex items-center gap-1.5"
                    >
                      {m.name} <ArrowUpRight size={12} className="text-[var(--meta)]" />
                    </a>
                    <Link
                      href={`/team/${m.slug}`}
                      className="text-[11px] uppercase tracking-wider text-[var(--meta)] hover:text-[var(--fg)]"
                    >
                      Role
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[12px] text-[var(--meta)]" style={{ borderColor: "var(--hairline)" }}>
            <div>
              © {new Date().getFullYear()} Team Paradox · Gorakhpur, Uttar Pradesh, India · <a href={`mailto:${site.contactEmail}`} className="hover:text-[var(--fg)]">{site.contactEmail}</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/network" className="hover:text-[var(--fg)]">Network</Link>
              <Link href="/work" className="hover:text-[var(--fg)]">Case Studies</Link>
              <a href="/llms.txt" target="_blank" className="hover:text-[var(--fg)] font-mono">llms.txt</a>
            </div>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
  optional,
  error,
  hint,
  col,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  optional?: boolean;
  error?: string;
  hint?: string;
  col?: string;
}) {
  return (
    <div className={col}>
      <label htmlFor={id} className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--meta)] mb-2">
        <span>{label}</span>
        <span>{optional && <span className="normal-case text-[var(--meta)] tracking-normal">optional</span>}</span>
      </label>
      {children}
      <div className="mt-1.5 min-h-[16px] text-[12px] leading-[1.4]">
        {error ? <span className="text-[var(--fg)] underline underline-offset-2" role="alert">{error}</span> : hint ? <span className="text-[var(--meta)]">{hint}</span> : null}
      </div>
    </div>
  );
}

function Banner({ tone, title, body }: { tone: "success" | "error" | "warn"; title: string; body: string }) {
  return (
    <div
      className="mt-6 border p-4 sm:p-5"
      style={{
        borderColor: "var(--hairline)",
        background: tone === "success" ? "var(--milk-2)" : tone === "warn" ? "var(--milk-3)" : "transparent",
      }}
    >
      <div className="text-[13px] uppercase tracking-[0.16em] text-[var(--meta)]">{tone === "success" ? "Success" : tone === "warn" ? "Heads up" : "Error"}</div>
      <div className="mt-1 text-[18px] tracking-[-0.01em]">{title}</div>
      <p className="mt-2 text-[14px] text-[var(--fg-soft)] max-w-[64ch]">{body}</p>
    </div>
  );
}

function Spinner() {
  return (
    <motion.span
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
      className="inline-block h-3.5 w-3.5 border border-current border-t-transparent rounded-full"
    />
  );
}
