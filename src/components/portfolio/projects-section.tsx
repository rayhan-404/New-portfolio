"use client";

import { useSiteContent } from "@/lib/use-site-data";
import { Reveal } from "./reveal";
import { RepoBrowser } from "./repo-browser";
import { SectionHeading } from "./section-heading";
import { SectionNumber } from "./section-number";

/**
 * Projects (v91) — the curated demo case studies are gone.
 * The grid is now the real thing: hand-added projects from the
 * admin panel on top, live GitHub repositories underneath —
 * everything the owner actually ships.
 */
export function ProjectsSection() {
  const { projects: custom } = useSiteContent();

  return (
    <section
      id="projects"
      aria-label="Projects"
      className="relative scroll-mt-20 overflow-hidden px-5 py-16 sm:px-8 sm:py-24 md:px-10 lg:py-32"
    >
      <SectionNumber
        index="03"
        speed={1.1}
        className="-top-4 right-0 hidden text-[11rem] lg:block"
      />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="03 · Projects"
          title="Built, shipped, public."
          description="Everything I've made lives here — hand-picked builds on top, live from my GitHub below. No mockups, no vaporware."
        />
        <Reveal delay={0.1} className="mt-9">
          <p className="font-tag text-[10px] text-muted-foreground lg:hidden">
            {custom.length > 0 && `${custom.length} featured · `}
            synced with GitHub
          </p>
        </Reveal>

        {/* Unified grid — admin projects + live GitHub repositories */}
        <RepoBrowser custom={custom} />
      </div>
    </section>
  );
}
