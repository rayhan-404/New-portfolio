"use client";

import { ArrowUp } from "lucide-react";
import { person, socials } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { scrollToSection } from "./nav";

/* Brand-colored dots before each social link — the reference's
   brand-identity pattern (GitHub/X hues flip per theme for contrast). */
const SOCIAL_DOT: Record<string, string> = {
  GitHub: "var(--gh)",
  LinkedIn: "#0A66C2",
  "X / Twitter": "var(--x)",
  Dribbble: "#EA4C89",
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-8 pt-12 sm:px-8 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            {/* Script wordmark — echoes the hero's Lobster name lockup */}
            <p className="font-script text-[1.65rem] leading-none text-foreground">
              M<span className="text-gold"> Rayhan</span>
            </p>
            <p className="font-tag mt-2.5 text-[9.5px] text-muted-foreground">
              {person.role}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-tag inline-flex items-center gap-2 text-[10px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="h-[7px] w-[7px] shrink-0 rounded-full"
                      style={{ background: SOCIAL_DOT[s.label] ?? "var(--primary)" }}
                    />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            onClick={() => {
              playSound("tap");
              scrollToSection("home");
            }}
            aria-label="Back to top"
            className="glass-chip group flex h-11 w-11 items-center justify-center rounded-full text-primary transition-all duration-300 hover:shadow-[var(--shadow-neu)] active:scale-95"
          >
            <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Giant sign-off */}
        <p
          aria-hidden="true"
          className="font-display select-none text-center text-[clamp(3.4rem,13vw,10rem)] leading-[0.85] tracking-tight text-foreground/[0.05]"
        >
          M RAYHAN
        </p>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-border pt-5 sm:flex-row">
          <p className="font-tag text-[9px] text-muted-foreground">
            © {year} M Rayhan
          </p>
          <p className="font-tag text-[9px] text-muted-foreground">
            Designed & engineered with obsession
          </p>
        </div>
      </div>
    </footer>
  );
}
