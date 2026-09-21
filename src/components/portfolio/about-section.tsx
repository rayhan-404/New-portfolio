"use client";

import Image from "next/image";
import { MapPin, Sparkles } from "lucide-react";
import { experience, person, stats } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { CountUp, Reveal, StaggerGroup, StaggerItem } from "./reveal";
import { SectionHeading } from "./section-heading";

export function AboutSection() {
  return (
    <section
      id="about"
      aria-label="About Rayhan Ahmed"
      className="relative scroll-mt-20 overflow-hidden px-5 py-24 sm:px-8 md:px-10 lg:py-32"
    >
      {/* watermark */}
      <span
        aria-hidden="true"
        className="text-outline font-display pointer-events-none absolute -top-4 right-0 hidden select-none text-[11rem] leading-none lg:block"
      >
        02
      </span>

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="02 · The Human Behind The Work"
          title="Engineer by craft, designer by obsession."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* Portrait card */}
          <Reveal>
            <div className="relative">
              <div className="panel relative overflow-hidden rounded-[2rem]">
                <div className="relative aspect-[4/5]">
                  <Image
                    src="/generated/hero-portrait.png"
                    alt={`Portrait of ${person.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 440px"
                    quality={82}
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-[image:var(--img-vignette)] opacity-70" />
                </div>

                {/* floating nameplate */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-2xl border border-[var(--line-strong)] bg-[rgba(11,7,5,0.62)] px-5 py-4 backdrop-blur-md">
                  <div>
                    <p className="font-display text-lg leading-tight">{person.name}</p>
                    <p className="font-tag mt-1 text-[9px] text-muted-foreground">
                      {person.role}
                    </p>
                  </div>
                  <span className="status-dot shrink-0" aria-hidden="true" />
                </div>

                {/* pixel accent */}
                <span aria-hidden="true" className="pixel pixel-float absolute right-6 top-6 h-4 w-4" />
              </div>

              {/* ember underline accent */}
              <div
                aria-hidden="true"
                className="absolute -bottom-3 left-8 right-8 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent"
              />
            </div>
          </Reveal>

          {/* Bio + stats + experience */}
          <div className="flex flex-col gap-8">
            <Reveal delay={0.08}>
              <div className="panel rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-ember" aria-hidden="true" />
                  <p className="font-tag text-[10px] text-ember">Philosophy</p>
                </div>
                <p className="mt-4 text-lg font-medium leading-relaxed text-foreground/95">
                  {person.philosophy}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  {person.longBio}
                </p>
                <p className="font-tag mt-6 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-ember" aria-hidden="true" />
                  {person.location} · {person.availability}
                </p>
              </div>
            </Reveal>

            {/* Stats */}
            <StaggerGroup className="grid grid-cols-3 gap-3 sm:gap-4">
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <div className="panel group h-full rounded-2xl p-4 text-center transition-colors duration-300 hover:border-ember/40 sm:p-5">
                    <p className="font-display text-2xl text-ember sm:text-3xl">
                      <CountUp value={s.value} suffix={s.suffix} decimals={s.value % 1 !== 0 ? 1 : 0} />
                    </p>
                    <p className="mt-1.5 text-[11px] font-semibold sm:text-xs">{s.label}</p>
                    <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
                      {s.detail}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>

            {/* Experience timeline */}
            <Reveal delay={0.12}>
              <div className="panel rounded-3xl p-6 sm:p-8">
                <p className="font-tag text-[10px] text-ember">Trajectory</p>
                <ol className="mt-6 flex flex-col">
                  {experience.map((job, i) => (
                    <li key={job.period} className="relative flex gap-5 pb-8 last:pb-0">
                      {/* rail */}
                      {i < experience.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-[7px] top-5 h-[calc(100%-14px)] w-px bg-[var(--line-strong)]"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className={`relative mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${
                          job.current
                            ? "border-ember bg-ember/30 shadow-[0_0_14px_rgba(232,99,44,0.55)]"
                            : "border-[var(--line-strong)] bg-transparent"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                          <h3 className="text-[15px] font-semibold">{job.role}</h3>
                          <span className="font-tag text-[9.5px] text-muted-foreground">
                            {job.period}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[13px] font-medium text-ember/90">
                          {job.company}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {job.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
