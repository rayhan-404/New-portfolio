"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Github, GitFork, Globe, RefreshCw, Star } from "lucide-react";
import { playSound } from "@/lib/sound";
import { Reveal } from "./reveal";
import { RepoDialog } from "./repo-dialog";
import type { Flags } from "@/lib/use-site-data";
import type { GithubRepo, ReposPayload } from "@/app/api/github/repos/route";

/**
 * RepoBrowser — "Live from GitHub" strip under the project cards.
 * Pulls public repos through the server-side proxy
 * (/api/github/repos — token stays in .env, never in the browser).
 *
 * Each card carries a serial number (01, 02, … by display order)
 * — the user-requested replacement for the old two-letter monogram.
 */

/* GitHub linguist language colors (exact hexes) */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Dart: "#00B4AB",
  Kotlin: "#A97BFF",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  PHP: "#4F5D95",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#F05138",
  Ruby: "#701516",
  Shell: "#89e051",
  Vue: "#41b883",
  "Jupyter Notebook": "#DA5B0B",
  Lua: "#000080",
};
const LANG_DEFAULT = "#8b8b8b";

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "done"; payload: ReposPayload };

function serialOf(i: number) {
  return (i + 1).toString().padStart(2, "0");
}

function shortDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return null;
  }
}

export function RepoBrowser({ flags = {} }: { flags?: Flags }) {
  const reduce = useReducedMotion();
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [selected, setSelected] = useState<{ repo: GithubRepo; serial: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  /* Admin curation: hidden repos drop out, featured ones pin to the
     front and wear a star badge. */
  const applyFlags = (repos: GithubRepo[]): GithubRepo[] => {
    const shown = repos.filter((r) => !flags[`repo:${r.name}`]?.hidden);
    return [
      ...shown.filter((r) => flags[`repo:${r.name}`]?.featured),
      ...shown.filter((r) => !flags[`repo:${r.name}`]?.featured),
    ];
  };

  /* Fetch on mount and whenever the retry button bumps reloadKey.
     setState only runs in the async continuation / event handlers —
     never synchronously inside the effect body. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/github/repos", { cache: "no-store" });
        const payload = (await res.json()) as ReposPayload;
        if (cancelled) return;
        if (!res.ok) {
          setState({ phase: "error", message: payload.error ?? "GitHub request failed" });
        } else if (payload.error && payload.repos.length === 0) {
          setState({ phase: "error", message: payload.error });
        } else {
          setState({ phase: "done", payload });
        }
      } catch {
        if (!cancelled)
          setState({ phase: "error", message: "Could not reach the GitHub service." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="mt-16">
      {/* strip heading */}
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="h-px w-10"
              style={{ background: "linear-gradient(90deg, transparent, var(--gold))" }}
              aria-hidden="true"
            />
            <p className="font-tag text-[10.5px] font-bold text-accent-ink">
              Live from GitHub
            </p>
            <span className="status-dot" aria-hidden="true" />
          </div>
          {state.phase === "done" && (
            <a
              href={state.payload.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("tap")}
              className="font-tag flex items-center gap-1.5 text-[10px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              @{state.payload.login}
              <span aria-hidden="true">·</span>
              {applyFlags(state.payload.repos).length} public repos
            </a>
          )}
        </div>
      </Reveal>

      {/* loading skeletons */}
      {state.phase === "loading" && (
        <div
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-label="Loading repositories"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="glass neu-decor h-[168px] animate-pulse rounded-2xl md:rounded-3xl p-6"
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* error fallback */}
      {state.phase === "error" && (
        <div className="glass neu-decor mt-6 flex flex-col items-start gap-3 rounded-2xl md:rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border">
              <Github className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Repositories are unavailable right now
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                {state.message} — the cards return automatically once GitHub
                answers again. A personal access token can be pasted in
                Admin → GitHub to lift the rate limit.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound("tap");
              setState({ phase: "loading" });
              setReloadKey((k) => k + 1);
            }}
            className="glass-chip inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-foreground transition-transform duration-300 hover:scale-[1.03] active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {/* repo cards */}
      {state.phase === "done" && applyFlags(state.payload.repos).length > 0 && (
        <motion.div
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {applyFlags(state.payload.repos).map((repo, i) => {
            const updated = shortDate(repo.updated_at);
            const serial = serialOf(i);
            const featured = Boolean(flags[`repo:${repo.name}`]?.featured);
            return (
              <div
                key={repo.name}
                role="button"
                tabIndex={0}
                onClick={() => {
                  playSound("chime");
                  setSelected({ repo, serial });
                  setDialogOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    playSound("chime");
                    setSelected({ repo, serial });
                    setDialogOpen(true);
                  }
                }}
                className="glass neu-decor group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl md:rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-neu-lg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
                aria-label={`Browse ${repo.name} — opens the repository browser`}
              >
                {/* hover aura */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.22),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                />
                {/* serial number — display order (01, 02, …) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-5 -right-2 font-display text-[6rem] leading-none text-foreground/[0.05] transition-colors duration-500 group-hover:text-foreground/[0.09]"
                >
                  {serial}
                </span>
                {/* primary→accent underline on hover */}
                <span
                  aria-hidden="true"
                  className="grad-underline pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[3px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="font-tag glass-chip shrink-0 rounded-full px-3 py-1 text-[9.5px] text-muted-foreground">
                      {serial}
                    </span>
                    {featured && (
                      <span className="font-tag flex shrink-0 items-center gap-1 rounded-full border border-star-ink/45 bg-star-ink/10 px-2.5 py-1 text-[9.5px] text-star-ink">
                        <Star className="h-3 w-3" aria-hidden="true" />
                        Featured
                      </span>
                    )}
                  </span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                </div>

                <h3 className="font-display mt-4 text-lg tracking-tight sm:text-xl">
                  {repo.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-foreground/70">
                  {repo.description ?? "No description yet — the code speaks for itself."}
                </p>

                <div className="mt-auto pt-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] font-medium tabular-nums text-foreground/75">
                    {repo.language && (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-[9px] w-[9px] shrink-0 rounded-full"
                          style={{ background: LANG_COLORS[repo.language] ?? LANG_DEFAULT }}
                          aria-hidden="true"
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-star" aria-hidden="true" />
                      {repo.stars}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      {repo.forks}
                    </span>
                    {updated && (
                      <span className="text-muted-foreground">Updated {updated}</span>
                    )}
                  </div>
                  <p className="font-tag mt-2.5 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[1.2px] text-accent-ink">
                    Browse files
                    {repo.homepage && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Globe className="h-3 w-3" aria-hidden="true" />
                        demo inside
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* done but zero repos */}
      {state.phase === "done" && state.payload.repos.length === 0 && (
        <div className="glass neu-decor mt-6 rounded-2xl md:rounded-3xl p-6">
          <p className="text-sm font-semibold text-foreground">No public repositories yet</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            New builds land here automatically — check back soon.
          </p>
        </div>
      )}

      {/* GitHub-style inside view — file tree + README, site-themed */}
      <RepoDialog
        repo={selected?.repo ?? null}
        serial={selected?.serial ?? ""}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
