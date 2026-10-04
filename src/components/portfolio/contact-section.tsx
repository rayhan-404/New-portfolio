"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  Dribbble,
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { person } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { useSiteContent } from "@/lib/use-site-data";
import { Reveal } from "./reveal";
import { SectionNumber } from "./section-number";

/**
 * Contact (v91) — "Reach me".
 *
 * The old form/booking/facts layout is gone. What's left is what
 * actually matters: email, phone and the socials — as big,
 * tactile, brand-coloured cards the visitor can't miss.
 * Everything is editable in Admin → Contact.
 */

/* Brand icon + colour per social label (mono theme overrides the
   colours through the same CSS vars the footer uses). */
function brandFor(label: string): { Icon: typeof Globe; color: string } {
  const l = label.toLowerCase();
  if (l.includes("github")) return { Icon: Github, color: "var(--gh)" };
  if (l.includes("linkedin")) return { Icon: Linkedin, color: "var(--linkedin)" };
  if (l.includes("dribbble")) return { Icon: Dribbble, color: "var(--dribbble)" };
  if (l.includes("x") || l.includes("twitter")) return { Icon: Twitter, color: "var(--x)" };
  if (l.includes("facebook")) return { Icon: Facebook, color: "#1877f2" };
  if (l.includes("instagram")) return { Icon: Instagram, color: "#e1306c" };
  if (l.includes("youtube")) return { Icon: Youtube, color: "#ff0000" };
  return { Icon: Globe, color: "var(--primary)" };
}

function domainOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`, { description: value });
  } catch {
    toast.info(label, { description: value });
  }
}

export function ContactSection() {
  const { contact } = useSiteContent();
  const [copied, setCopied] = useState<string | null>(null);

  const telHref = `tel:${contact.phone.replace(/[^+\d]/g, "")}`;

  const copy = async (value: string, label: string) => {
    playSound("pop");
    await copyText(value, label);
    setCopied(label);
    setTimeout(() => setCopied((c) => (c === label ? null : c)), 1600);
  };

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative scroll-mt-20 overflow-hidden px-5 py-16 sm:px-8 sm:py-24 md:px-10 lg:py-32"
    >
      {/* ghost numeral — same recipe as the other sections */}
      <SectionNumber
        index="05"
        className="-top-4 right-0 hidden text-[11rem] lg:block"
      />

      <div className="mx-auto max-w-6xl">
        {/* ── the heading is just: Reach me. ─────────────────────── */}
        <Reveal>
          <h2 className="font-display text-[clamp(3.2rem,10vw,7rem)] leading-[0.92] tracking-[-0.03em]">
            Reach <span className="font-script text-gold">me.</span>
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5">
            <span className="flex items-center gap-2.5">
              <span className="status-dot" aria-hidden="true" />
              <span className="font-tag text-[10px] tracking-[0.18em] text-foreground/80 uppercase">
                {person.availability}
              </span>
            </span>
            <span aria-hidden="true" className="hidden h-3 w-px bg-border sm:block" />
            <span className="font-tag text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {contact.location}
            </span>
          </div>
        </Reveal>

        {/* ── direct channels ────────────────────────────────────── */}
        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          {/* Email — the mega card */}
          <Reveal className="lg:col-span-7">
            <a
              href={`mailto:${contact.email}`}
              onClick={() => playSound("chime")}
              className="glass neu-decor group relative flex h-full min-h-[210px] flex-col justify-between overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-neu-lg)] sm:min-h-[230px] sm:p-8 md:rounded-3xl"
              aria-label={`Email ${contact.email}`}
            >
              {/* gmail wash — var-driven so mono de-chromes it */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(234,67,53,0.07),transparent_55%)] transition-opacity duration-500 group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(234,67,53,0.16),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
              />

              <div className="relative z-[1] flex items-start justify-between gap-3">
                <span className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--gmail-1),var(--gmail-2))] text-white shadow-[0_6px_16px_rgba(234,67,53,0.28)] md:rounded-2xl">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="font-tag block text-[9.5px] tracking-[0.2em] text-muted-foreground uppercase">
                      Email
                    </span>
                    <span className="mt-0.5 block text-[13px] font-semibold text-foreground/85">
                      Write to me — I reply fast
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    copy(contact.email, "Email");
                  }}
                  aria-label="Copy email address"
                  className="glass-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:text-(--gmail-1) active:scale-90"
                >
                  {copied === "Email" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative z-[1] mt-6">
                <p className="font-display break-all text-[clamp(1.35rem,3.6vw,2.3rem)] leading-tight tracking-tight transition-colors duration-300 group-hover:text-(--gmail-1)">
                  {contact.email}
                </p>
                <p className="font-tag mt-3 flex items-center gap-2 text-[9.5px] font-bold tracking-[1.2px] text-accent-ink uppercase">
                  Open mail app
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </p>
              </div>
            </a>
          </Reveal>

          {/* Phone */}
          <Reveal delay={0.06} className="lg:col-span-5">
            <a
              href={telHref}
              onClick={() => playSound("chime")}
              className="glass neu-decor group relative flex h-full min-h-[210px] flex-col justify-between overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-neu-lg)] sm:min-h-[230px] sm:p-8 md:rounded-3xl"
              aria-label={`Call ${contact.phone}`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.2),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
              />
              <div className="relative z-[1] flex items-start justify-between gap-3">
                <span className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--primary2,var(--primary)))] text-white shadow-[0_6px_16px_rgba(var(--primary-rgb)/0.35)] md:rounded-2xl">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="font-tag block text-[9.5px] tracking-[0.2em] text-muted-foreground uppercase">
                      Phone
                    </span>
                    <span className="mt-0.5 block text-[13px] font-semibold text-foreground/85">
                      Call or message anytime
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    copy(contact.phone, "Number");
                  }}
                  aria-label="Copy phone number"
                  className="glass-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:text-primary active:scale-90"
                >
                  {copied === "Number" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative z-[1] mt-6">
                <p className="font-display text-[clamp(1.5rem,4vw,2.4rem)] leading-tight tracking-tight tabular-nums">
                  {contact.phone}
                </p>
                <p className="font-tag mt-3 flex items-center gap-2 text-[9.5px] font-bold tracking-[1.2px] text-accent-ink uppercase">
                  Tap to call
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </p>
              </div>
            </a>
          </Reveal>

          {/* Socials — brand tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
            {contact.socials.map((s, i) => {
              const { Icon, color } = brandFor(s.label);
              return (
                <Reveal key={`${s.label}-${i}`} delay={0.05 + i * 0.05}>
                  <motion.a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playSound("tap")}
                    whileTap={{ scale: 0.97 }}
                    className="glass neu-decor group relative flex h-full min-h-[104px] items-center justify-between gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-neu-lg)]"
                    aria-label={`${s.label} — opens in a new tab`}
                  >
                    {/* brand wash */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${color} 14%, transparent), transparent 60%)`,
                      }}
                    />
                    <span className="relative z-[1] flex min-w-0 items-center gap-3.5">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border transition-colors duration-300"
                        style={{ color }}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-foreground">
                          {s.label}
                        </span>
                        <span className="font-tag mt-0.5 block truncate text-[9px] tracking-[0.14em] text-muted-foreground lowercase">
                          {domainOf(s.href)}
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="relative z-[1] h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:rotate-45 group-hover:text-foreground"
                    />
                  </motion.a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
