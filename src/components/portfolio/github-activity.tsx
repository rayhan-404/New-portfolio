"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, GitCommitHorizontal, Star, FolderGit2 } from "lucide-react";
import { CountUp, Reveal } from "./reveal";
import { Spotlight } from "./spotlight";
import type { ActivityPayload, CalendarWeek } from "@/app/api/github/activity/route";

/**
 * GithubActivity (v94) — the receipts for "synced with GitHub".
 *
 * Sits under the repo grid in the Projects section: commit / repo /
 * star counters plus the real contribution calendar for the last
 * 12 months, fetched from /api/github/activity (GraphQL via the
 * stored PAT, server-cached for an hour).
 *
 * Every colour rides the accent pool (color-mix on --primary), so
 * the heatmap re-tints with the palette and stays grayscale under
 * the mono accent. Fails silent: no data → the panel never renders.
 */

/* accent-mixed ramp — quiet ink → full pool hue */
const LEVEL_BG = [
  "color-mix(in srgb, var(--foreground) 7%, transparent)",
  "color-mix(in srgb, var(--primary) 30%, transparent)",
  "color-mix(in srgb, var(--primary) 55%, transparent)",
  "color-mix(in srgb, var(--primary) 78%, transparent)",
  "var(--primary)",
];

const CELL = "h-2 w-2 sm:h-2.5 sm:w-2.5";
const GAP = "gap-[3px]";

function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* month labels — a column gets a label when its first real day
   opens a month no earlier column has announced (pure: the running
   "last announced month" lives inside the function) */
function computeMonthLabels(weeks: CalendarWeek[]): (string | null)[] {
  let lastMonth = -1;
  return weeks.map((week) => {
    const first = week.days.find((d): d is NonNullable<typeof d> => d !== null);
    if (!first) return null;
    const date = new Date(`${first.date}T00:00:00`);
    const month = date.getMonth();
    if (date.getDate() <= 7 && month !== lastMonth) {
      lastMonth = month;
      return date.toLocaleDateString("en-US", { month: "short" });
    }
    return null;
  });
}

/* ── loading placeholder — card-shaped, one shimmer pass ─────── */

function ActivitySkeleton() {
  return (
    <div className="glass neu-decor relative overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-32 rounded-full bg-(--bg2)" />
        <div className="h-6 w-24 rounded-full bg-(--bg2)" />
      </div>
      <div className="mt-7 grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-6 w-12 rounded-md bg-(--bg2)" />
            <div className="h-2.5 w-16 rounded-full bg-(--bg2)" />
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-[3px]">
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="flex gap-[3px]">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="h-2 w-2 rounded-[2px] bg-(--bg2) sm:h-2.5 sm:w-2.5" />
            ))}
          </div>
        ))}
      </div>
      <div className="skeleton-shimmer pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}

/* ── section ─────────────────────────────────────────────────── */

export function GithubActivity() {
  const [payload, setPayload] = useState<ActivityPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/github/activity", { cache: "no-store" });
        const data = (await res.json()) as ActivityPayload;
        if (!alive) return;
        if (!data || data.error) {
          /* stale-but-served payloads still carry real weeks */
          if (data?.weeks) setPayload(data);
          else setFailed(true);
          return;
        }
        setPayload(data);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (failed) return null;
  if (!payload) return <ActivitySkeleton />;

  const { login, profileUrl, commits, totalContributions, repos, stars, weeks } = payload;

  /* month labels — see computeMonthLabels above */
  const monthLabels: (string | null)[] = weeks
    ? computeMonthLabels(weeks)
    : [];

  const stats = [
    { icon: GitCommitHorizontal, value: commits, label: "Commits", sub: "past 12 months" },
    { icon: FolderGit2, value: repos, label: "Repositories", sub: "public" },
    { icon: Star, value: stars, label: "Stars", sub: "earned" },
  ];

  return (
    <Reveal>
      <div className="glass neu-decor spot-host relative overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8">
        <Spotlight />

        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-tag flex items-center gap-2 text-[10px] text-accent-ink">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            GitHub activity
          </p>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="glass-chip font-tag group/link inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[9px] text-muted-foreground transition-all duration-300 hover:text-primary active:scale-95"
          >
            @{login}
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </a>
        </div>

        {/* counters */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="flex items-baseline gap-1.5">
                <stat.icon className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                <CountUp
                  value={stat.value}
                  className="font-display text-xl font-extrabold tabular-nums tracking-[-0.02em] text-foreground sm:text-2xl"
                />
              </span>
              <span className="text-[12px] font-semibold leading-none text-foreground/85">
                {stat.label}
              </span>
              <span className="font-tag text-[8.5px] text-muted-foreground">{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* calendar */}
        {weeks && weeks.length > 0 && (
          <div className="mt-8">
            <p className="font-tag text-[9px] text-muted-foreground">
              <CountUp value={totalContributions} /> contributions in the last 12 months
            </p>

            <div className="no-scrollbar mt-3 overflow-x-auto pb-1" role="img"
              aria-label={`Contribution calendar for the last 12 months — ${totalContributions} contributions`}>
              <div className={`flex min-w-max ${GAP}`}>
                {/* weekday gutter — a spacer first (aligning with the
                    month-label row), then Mon / Wed / Fri; hidden on
                    narrow phones so the grid gets the full width */}
                <div className={`hidden flex-col ${GAP} sm:flex`} aria-hidden="true">
                  <span className={CELL} />
                  {["Mon", "", "Wed", "", "Fri", "", ""].map((d, i) => (
                    <span
                      key={i}
                      className={`${CELL} flex items-center justify-end pr-1.5 font-tag text-[8px] leading-none text-muted-foreground`}
                    >
                      {d}
                    </span>
                  ))}
                </div>

                {/* month labels + day cells, one flex column per week */}
                <div className={`flex flex-col ${GAP}`}>
                  <div className={`flex ${GAP}`}>
                    {monthLabels.map((label, i) => (
                      <span
                        key={`m-${i}`}
                        className={`${CELL} relative leading-none`}
                        aria-hidden="true"
                      >
                        {label && (
                          <span className="font-tag absolute left-0 top-0 whitespace-nowrap text-[8px] text-muted-foreground">
                            {label}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                  <div className={`flex ${GAP}`}>
                    {weeks.map((week, w) => (
                      <div key={`w-${w}`} className={`flex flex-col ${GAP}`}>
                        {week.days.map((day, d) =>
                          day ? (
                            <span
                              key={d}
                              className={`${CELL} rounded-[2px]`}
                              style={{ background: LEVEL_BG[day.level] }}
                              title={`${day.count} contribution${day.count === 1 ? "" : "s"} · ${formatDay(day.date)}`}
                            />
                          ) : (
                            <span key={d} className={`${CELL} rounded-[2px] opacity-0`} />
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* legend */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-tag text-[8.5px] text-muted-foreground">Less</p>
              <div className={`flex ${GAP}`} aria-hidden="true">
                {LEVEL_BG.map((bg, i) => (
                  <span key={i} className={`${CELL} rounded-[2px]`} style={{ background: bg }} />
                ))}
              </div>
              <p className="font-tag text-[8.5px] text-muted-foreground">More</p>
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
}
