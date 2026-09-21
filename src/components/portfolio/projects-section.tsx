"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Layers, Palette, Puzzle } from "lucide-react";
import { projects, type Project, type ProjectCategory } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal } from "./reveal";
import { ProjectDialog } from "./project-dialog";
import { SectionHeading } from "./section-heading";

const FILTERS: { id: ProjectCategory; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "fullstack", label: "Full-Stack" },
  { id: "design", label: "Design Systems" },
];

const accentGradient: Record<Project["accent"], string> = {
  green: "linear-gradient(135deg, rgba(48,209,88,0.35), rgba(0,199,190,0.12))",
  mint: "linear-gradient(135deg, rgba(0,199,190,0.32), rgba(48,209,88,0.10))",
  orange: "linear-gradient(135deg, rgba(255,159,10,0.32), rgba(255,55,95,0.12))",
  rose: "linear-gradient(135deg, rgba(255,55,95,0.30), rgba(255,159,10,0.10))",
};

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
    <section id="projects" aria-label="Featured projects" className="relative scroll-mt-28 px-5 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="02 · Featured Works"
          title="Handcrafted projects, battle-tested in production."
          description="A selection of systems I designed and engineered end-to-end — each one ships with real telemetry, accessibility, and performance budgets."
        />

        {/* Filters */}
        <Reveal delay={0.1} className="mt-8">
          <div className="glass inline-flex flex-wrap items-center gap-1 rounded-full p-1.5" role="tablist" aria-label="Filter projects">
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
                    className="glass-strong absolute inset-0 rounded-full"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Bento grid */}
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
                  className="glass group relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] p-6 text-left transition-all duration-500 hover:-translate-y-1.5 hover:bg-[var(--glass-bg-strong)] sm:p-7"
                  aria-label={`Open details for ${p.title}`}
                >
                  {/* accent aura */}
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                    style={{ background: accentGradient[p.accent] }}
                    aria-hidden="true"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <ProjectGlyph id={p.id} />
                      {p.tag}
                    </span>
                    <span className="glass flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:bg-[var(--accent)]">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
                    {p.title}
                    <span className="text-muted-foreground/60"> · {p.subtitle}</span>
                  </h3>
                  <p className={`mt-2.5 text-sm leading-relaxed text-muted-foreground ${p.flagship ? "max-w-xl" : ""}`}>
                    {firstSentence(p.description)}
                  </p>

                  <div className="mt-auto pt-5">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tech.slice(0, p.flagship ? 5 : 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-[var(--glass-border)] px-2.5 py-1 font-mono text-[10.5px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                      {p.metrics.slice(0, p.flagship ? 3 : 2).map((m) => (
                        <span key={m} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground/80">
                          <span className="h-1 w-1 rounded-full bg-[var(--apple-green)]" aria-hidden="true" />
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

function ProjectGlyph({ id }: { id: string }) {
  if (id === "pulseai") return <Layers className="h-3 w-3 text-[var(--apple-green)]" />;
  if (id === "auraui") return <Palette className="h-3 w-3 text-[var(--apple-mint)]" />;
  if (id === "ecotrack") return <Puzzle className="h-3 w-3 text-[var(--apple-green)]" />;
  return <Puzzle className="h-3 w-3 text-[var(--apple-orange)]" />;
}

/** First sentence, preserving abbreviations like "Next.js". */
function firstSentence(text: string): string {
  const sentence = text.split(". ")[0];
  return sentence.length > 180 ? `${sentence.slice(0, 177).trimEnd()}…` : sentence;
}
