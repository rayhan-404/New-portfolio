"use client";

import { ArrowUp } from "lucide-react";
import { person, socials } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { scrollToSection } from "./side-rail";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-8 pt-12 sm:px-8 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="font-display text-2xl leading-none">
              Blue<span className="text-ember"> Nile</span>
            </p>
            <p className="font-tag mt-2 text-[9.5px] text-muted-foreground">
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
                    className="font-tag text-[10px] text-muted-foreground transition-colors duration-300 hover:text-ember"
                  >
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
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] transition-all duration-300 hover:border-ember hover:bg-ember hover:text-white active:scale-95"
          >
            <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Giant sign-off */}
        <p
          aria-hidden="true"
          className="font-display select-none text-center text-[clamp(3.4rem,13vw,10rem)] leading-[0.85] tracking-tight text-foreground/[0.05]"
        >
          BLUE NILE
        </p>

        <div className="hairline-t flex flex-col items-center justify-between gap-2 pt-5 sm:flex-row">
          <p className="font-tag text-[9px] text-muted-foreground/70">
            © {year} Blue Nile Studio — Rayhan Ahmed
          </p>
          <p className="font-tag text-[9px] text-muted-foreground/70">
            Designed & engineered with obsession
          </p>
        </div>
      </div>
    </footer>
  );
}
