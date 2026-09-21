"use client";

import { ArrowUp } from "lucide-react";
import { person } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto px-5 pb-8 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="glass rounded-[2rem] px-6 py-5 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="glass-strong flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm font-bold">
                {person.monogram}
              </span>
              <div>
                <p className="text-sm font-semibold">{person.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  © {year} · Crafted with Next.js 16 & Tailwind CSS
                </p>
              </div>
            </div>

            <nav aria-label="Footer">
              <ul role="list" className="flex items-center gap-5 text-[13px] font-medium text-muted-foreground">
                {["about", "projects", "skills", "contact"].map((id) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        playSound("tap");
                        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="capitalize transition-colors hover:text-foreground"
                    >
                      {id}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              onClick={() => {
                playSound("tap");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="glass-strong inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
