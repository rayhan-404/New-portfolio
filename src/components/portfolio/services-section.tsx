"use client";

import { ArrowRight } from "lucide-react";
import { services } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal, StaggerGroup, StaggerItem } from "./reveal";
import { SectionHeading } from "./section-heading";
import { scrollToSection } from "./side-rail";

export function ServicesSection() {
  return (
    <section
      id="services"
      aria-label="Services offered"
      className="relative scroll-mt-20 px-5 py-24 sm:px-8 md:px-10 lg:py-32"
    >
      {/* watermark */}
      <span
        aria-hidden="true"
        className="text-outline font-display pointer-events-none absolute -top-4 left-0 hidden select-none text-[11rem] leading-none lg:block"
      >
        04
      </span>

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="04 · What I Can Do For You"
            title="Services built around outcomes."
          />
          <Reveal delay={0.15}>
            <button
              onClick={() => {
                playSound("notch");
                scrollToSection("contact");
              }}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:border-ember hover:bg-ember hover:text-white active:scale-95"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>

        <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <StaggerItem key={service.index}>
              <article className="panel group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-ember/45 sm:p-8">
                {/* hover aura */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(232,99,44,0.22),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                />
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-4xl text-foreground/15 transition-colors duration-500 group-hover:text-ember/70">
                    {service.index}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-2 flex gap-1.5"
                  >
                    <span className="h-2 w-2 bg-foreground/25 transition-colors duration-500 group-hover:bg-ember" />
                    <span className="h-2 w-2 bg-foreground/15" />
                  </span>
                </div>

                <h3 className="font-display mt-5 text-xl tracking-tight sm:text-2xl">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>

                <div className="mt-auto pt-6">
                  <div className="hairline-t flex flex-wrap gap-x-4 gap-y-1.5 pt-4">
                    {service.deliverables.map((d) => (
                      <span
                        key={d}
                        className="font-tag inline-flex items-center gap-1.5 text-[9.5px] text-muted-foreground"
                      >
                        <span className="h-1 w-1 rounded-full bg-ember" aria-hidden="true" />
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
