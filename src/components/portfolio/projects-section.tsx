"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects, type Project, type ProjectCategory } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal } from "./reveal";
import { ProjectDialog } from "./project-dialog";
import { SectionHeading } from "./section-heading";

const FILTERS: { id: ProjectCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fullstack", label: "Full-Stack" },
  { id: "design", label: "Design Systems" },
];

export function ProjectsSection() {
  const [filter, setFilter] = useState<ProjectCategory>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  const open = (p: Project) => {
    playSound("chime");
    setSelected(p);
    setDialogOpen(true);
  };

  return (
    <section
      id="projects"
      aria-label="Featured projects"
      className="relative scroll-mt-20 px-5 py-24 sm:px-8 md:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="01 · Selected Works"
            title="Projects engineered for production."
            description="A selection of systems I designed and built end-to-end — each one ships with real telemetry, accessibility, and performance budgets."
          />
          <Reveal delay={0.15}>
            <p className="font-tag hidden text-[10px] text-muted-foreground/70 lg:block">
              {projects.length} case studies — 2021 / {new Date().getFullYear()}
            </p>
          </Reveal>
        </div>

        {/* Filters */}
        <Reveal delay={0.1} className="mt-9">
          <div
            className="panel inline-flex flex-wrap items-center gap-1 rounded-full p-1.5"
            role="tablist"
            aria-label="Filter projects"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => {
                  playSound("tap");
                  setFilter(f.id);
                }}
                className={`relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                  filter === f.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter === f.id && (
                  <motion.span
                    layoutId="project-filter-pill"
                    className="absolute inset-0 rounded-full border border-ember/50 bg-ember/15"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Grid */}
        <motion.div layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={p.flagship ? "sm:col-span-2" : ""}
              >
                <button
                  onClick={() => open(p)}
                  className="panel group relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-6 text-left transition-all duration-500 hover:-translate-y-1.5 hover:border-ember/40 hover:panel-strong sm:p-7"
                  aria-label={`Open details for ${p.title}`}
                >
                  {/* ember aura on hover */}
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(232,99,44,0.28),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  {/* index number */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-5 -right-2 font-display text-[6rem] leading-none text-foreground/[0.045] transition-colors duration-500 group-hover:text-ember/10"
                  >
                    {p.id.slice(0, 2).toUpperCase()}
                  </span>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-tag rounded-full border border-[var(--line)] px-3 py-1 text-[9.5px] text-muted-foreground">
                      {p.tag}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] transition-all duration-300 group-hover:border-ember group-hover:bg-ember group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </div>

                  <h3 className="font-display mt-5 text-xl tracking-tight sm:text-2xl">
                    {p.title}
                    <span className="text-muted-foreground/60"> · {p.subtitle}</span>
                  </h3>
                  <p
                    className={`mt-2.5 text-sm leading-relaxed text-muted-foreground ${p.flagship ? "max-w-xl" : ""}`}
                  >
                    {firstSentence(p.description)}
                  </p>

                  <div className="mt-auto pt-5">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tech.slice(0, p.flagship ? 5 : 3).map((t) => (
                        <span
                          key={t}
                          className="font-tag rounded-full border border-[var(--line)] px-2.5 py-1 text-[9.5px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                      {p.metrics.slice(0, p.flagship ? 3 : 2).map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground/85"
                        >
                          <span className="h-1 w-1 rounded-full bg-ember" aria-hidden="true" />
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ProjectDialog project={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
}

/** First sentence, preserving abbreviations like "Next.js". */
function firstSentence(text: string): string {
  const sentence = text.split(". ")[0];
  return sentence.length > 180 ? `${sentence.slice(0, 177).trimEnd()}…` : sentence;
}
