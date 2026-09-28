"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  Github,
  GitFork,
  Star,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { playSound } from "@/lib/sound";
import type { GithubRepo } from "@/app/api/github/repos/route";
import type { RepoDetailPayload } from "@/app/api/github/repos/[name]/route";

/**
 * RepoDialog — "inside of a repository", GitHub-style but wearing the
 * site's neumorphic theme. Left: browsable file tree (folders navigate,
 * text files open as previews). Right: the rendered README, or the
 * file preview. Data comes from the server-side proxy — the browser
 * never touches GitHub directly.
 */

/* GitHub linguist colors (subset shared with the repo cards) */
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

type DetailState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "done"; payload: RepoDetailPayload };

export function RepoDialog({
  repo,
  serial,
  open,
  onOpenChange,
}: {
  repo: GithubRepo | null;
  serial: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, setState] = useState<DetailState>({ phase: "loading" });
  const [path, setPath] = useState("");
  const [file, setFile] = useState<string | null>(null);

  const name = repo?.name ?? "";

  /* Fetch whenever the dialog is open or the browse session moves.
     setState runs only in the async continuation — never synchronously
     inside the effect body. Navigation handlers flip the phase to
     "loading" themselves (event context). */
  useEffect(() => {
    if (!open || !name) return;
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (path) params.set("path", path);
        if (file) params.set("file", file);
        const qs = params.toString();
        const res = await fetch(
          `/api/github/repos/${encodeURIComponent(name)}${qs ? `?${qs}` : ""}`,
          { cache: "no-store" }
        );
        const payload = (await res.json()) as RepoDetailPayload;
        if (cancelled) return;
        if (!res.ok || payload.error) {
          setState({ phase: "error", message: payload.error ?? "GitHub request failed" });
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
  }, [open, name, path, file]);

  /* Closing the dialog resets the browse session (event context —
     Radix invokes onOpenChange from user interactions). */
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPath("");
      setFile(null);
      setState({ phase: "loading" });
    }
    onOpenChange(next);
  };

  const openFolder = (p: string) => {
    playSound("tap");
    setState({ phase: "loading" });
    setFile(null);
    setPath(p);
  };

  const openFile = (p: string) => {
    playSound("tap");
    setState({ phase: "loading" });
    setFile(p);
  };

  const goUp = () => {
    playSound("tap");
    setState({ phase: "loading" });
    setFile(null);
    setPath(path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");
  };

  const jumpRoot = () => {
    playSound("tap");
    setState({ phase: "loading" });
    setFile(null);
    setPath("");
  };

  const segs = path ? path.split("/") : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[min(96vw,64rem)] max-w-[64rem] flex-col gap-0 overflow-hidden rounded-[1.75rem] border-border bg-[var(--bg)] p-0 shadow-[var(--shadow-neu-lg)]">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-border/60 px-5 pb-4 pt-5 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="font-tag glass-chip shrink-0 rounded-full px-2.5 py-0.5 text-[9.5px] text-muted-foreground">
                  {serial}
                </span>
                <DialogTitle className="font-display truncate text-xl tracking-tight sm:text-2xl">
                  {name}
                </DialogTitle>
                {repo?.language && (
                  <span className="hidden items-center gap-1.5 text-[12px] font-medium text-foreground/75 sm:inline-flex">
                    <span
                      className="h-[9px] w-[9px] shrink-0 rounded-full"
                      style={{ background: LANG_COLORS[repo.language] ?? LANG_DEFAULT }}
                      aria-hidden="true"
                    />
                    {repo.language}
                  </span>
                )}
              </div>
              <DialogDescription className="mt-1.5 line-clamp-1 text-[13px] text-muted-foreground">
                {repo?.description ?? "Repository"}
              </DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 text-star" aria-hidden="true" />
                {repo?.stars ?? 0}
              </span>
              <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-foreground">
                <GitFork className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                {repo?.forks ?? 0}
              </span>
              {repo && (
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound("chime")}
                  aria-label="Open on GitHub"
                  title="Open on GitHub"
                  className="glass-chip flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:text-primary active:scale-90"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="mt-3 flex items-center gap-1 overflow-x-auto text-[12px] font-medium text-muted-foreground">
            <button
              type="button"
              onClick={jumpRoot}
              className={`shrink-0 rounded-md px-1.5 py-0.5 transition-colors duration-200 hover:text-foreground ${
                path === "" ? "text-foreground" : ""
              }`}
            >
              {name}
            </button>
            {segs.map((seg, i) => {
              const segPath = segs.slice(0, i + 1).join("/");
              const isLast = i === segs.length - 1 && !file;
              return (
                <span key={segPath} className="flex shrink-0 items-center gap-1">
                  <ChevronRight className="h-3 w-3 opacity-60" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => openFolder(segPath)}
                    className={`rounded-md px-1.5 py-0.5 transition-colors duration-200 hover:text-foreground ${
                      isLast ? "text-foreground" : ""
                    }`}
                  >
                    {seg}
                  </button>
                </span>
              );
            })}
            {file && (
              <span className="flex shrink-0 items-center gap-1">
                <ChevronRight className="h-3 w-3 opacity-60" aria-hidden="true" />
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-primary">
                  {file.split("/").pop()}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:overflow-hidden">
          {/* File tree */}
          <div className="min-h-0 border-b border-border/60 lg:border-b-0 lg:border-r lg:overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2.5 sm:px-5">
              <p className="font-tag text-[9.5px] font-bold uppercase tracking-[1.4px] text-muted-foreground">
                Files
              </p>
              {(path || file) && (
                <button
                  type="button"
                  onClick={goUp}
                  className="glass-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-muted-foreground transition-all duration-300 hover:text-foreground active:scale-95"
                >
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  Back
                </button>
              )}
            </div>

            {state.phase === "loading" && (
              <div className="space-y-1.5 px-4 pb-4 sm:px-5" role="status" aria-label="Loading files">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-9 animate-pulse rounded-xl bg-primary/[0.06]" aria-hidden="true" />
                ))}
              </div>
            )}

            {state.phase === "error" && (
              <p className="px-4 pb-5 text-[12.5px] leading-relaxed text-muted-foreground sm:px-5">
                {state.message}
              </p>
            )}

            {state.phase === "done" && (
              <ul className="space-y-1 px-3 pb-4 sm:px-4">
                {state.payload.items.map((entry) => (
                  <li key={entry.path}>
                    <button
                      type="button"
                      onClick={() =>
                        entry.type === "dir" ? openFolder(entry.path) : openFile(entry.path)
                      }
                      className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 hover:bg-primary/[0.06] active:scale-[0.99]"
                    >
                      {entry.type === "dir" ? (
                        <>
                          <Folder className="h-4 w-4 shrink-0 text-[var(--accent-ref)]" aria-hidden="true" />
                          <FolderOpen className="hidden h-4 w-4 shrink-0 text-[var(--accent-ref)] group-hover:block" aria-hidden="true" />
                        </>
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/90">
                        {entry.name}
                      </span>
                      {entry.type === "file" && (
                        <span className="font-tag shrink-0 text-[9px] text-muted-foreground/70">
                          {entry.size < 1024 ? `${entry.size} B` : `${(entry.size / 1024).toFixed(1)} KB`}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                {state.payload.items.length === 0 && (
                  <li className="px-2.5 py-3 text-[12.5px] text-muted-foreground">
                    Nothing here — this folder is empty.
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Content: README or file preview */}
          <div className="min-h-0 lg:overflow-y-auto">
            {state.phase === "loading" && (
              <div className="space-y-3 p-5 sm:p-6" aria-hidden="true">
                <div className="h-7 w-1/3 animate-pulse rounded-lg bg-primary/[0.06]" />
                <div className="h-3.5 w-full animate-pulse rounded bg-primary/[0.05]" />
                <div className="h-3.5 w-5/6 animate-pulse rounded bg-primary/[0.05]" />
                <div className="h-3.5 w-4/6 animate-pulse rounded bg-primary/[0.05]" />
              </div>
            )}

            {state.phase === "error" && (
              <div className="p-5 sm:p-6">
                <p className="text-[13px] text-muted-foreground">{state.message}</p>
              </div>
            )}

            {state.phase === "done" && state.payload.file && (
              <div className="p-4 sm:p-5">
                <p className="font-tag mb-2.5 text-[9.5px] font-bold uppercase tracking-[1.4px] text-muted-foreground">
                  {state.payload.file.path}
                  {state.payload.file.truncated && " — truncated preview"}
                </p>
                {state.payload.file.content ? (
                  <pre
                    className="max-h-[52vh] overflow-auto rounded-2xl p-4 text-[12px] leading-relaxed lg:max-h-[62vh]"
                    style={{ background: "var(--code-bg)", color: "#f3e7d5" }}
                  >
                    <code>{state.payload.file.content}</code>
                  </pre>
                ) : (
                  <p className="text-[13px] text-muted-foreground">
                    Binary file — preview isn&apos;t available. Open it on GitHub instead.
                  </p>
                )}
              </div>
            )}

            {state.phase === "done" && !state.payload.file && state.payload.readme && (
              <article className="repo-readme p-5 sm:p-6">
                <p className="font-tag mb-3 text-[9.5px] font-bold uppercase tracking-[1.4px] text-muted-foreground">
                  {state.payload.readme.name}
                </p>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (p) => <h2 className="font-display mt-2 mb-3 text-[1.35rem] tracking-tight text-foreground first:mt-0" {...p} />,
                    h2: (p) => <h3 className="font-display mt-6 mb-2.5 text-[1.15rem] tracking-tight text-foreground" {...p} />,
                    h3: (p) => <h4 className="font-display mt-5 mb-2 text-[1rem] text-foreground" {...p} />,
                    a: (p) => <a className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary" target="_blank" rel="noopener noreferrer" {...p} />,
                    ul: (p) => <ul className="my-3 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-foreground/80" {...p} />,
                    ol: (p) => <ol className="my-3 list-decimal space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-foreground/80" {...p} />,
                    p: (p) => <p className="my-3 text-[13.5px] leading-relaxed text-foreground/80" {...p} />,
                    strong: (p) => <strong className="font-bold text-foreground" {...p} />,
                    blockquote: (p) => <blockquote className="my-3 border-l-2 border-primary/40 pl-4 text-foreground/70 italic" {...p} />,
                    code: ({ className, children, ...rest }) => {
                      const isBlock = typeof className === "string" && className.includes("language-");
                      if (isBlock) {
                        return (
                          <code
                            className="block overflow-x-auto rounded-xl p-3.5 text-[12px] leading-relaxed"
                            style={{ background: "var(--code-bg)", color: "#f3e7d5" }}
                            {...rest}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="rounded-md bg-primary/[0.08] px-1.5 py-0.5 text-[12px] font-semibold text-primary" {...rest}>
                          {children}
                        </code>
                      );
                    },
                    pre: (p) => <pre className="my-3" {...p} />,
                    table: (p) => (
                      <div className="my-3 overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-[12.5px]" {...p} />
                      </div>
                    ),
                    th: (p) => <th className="border-b border-border bg-primary/[0.05] px-3 py-2 text-left font-bold text-foreground" {...p} />,
                    td: (p) => <td className="border-b border-border/60 px-3 py-2 text-foreground/80" {...p} />,
                    img: (p) => <img className="my-3 inline-block max-w-full rounded-lg" loading="lazy" alt="" {...p} />,
                  }}
                >
                  {state.payload.readme.markdown}
                </ReactMarkdown>
              </article>
            )}

            {state.phase === "done" && !state.payload.file && !state.payload.readme && (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-center text-[13px] text-muted-foreground">
                  No README at the root — pick a file from the tree to preview it.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* footer hint */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 px-5 py-2.5 sm:px-7">
          <p className="font-tag truncate text-[9px] uppercase tracking-[1.2px] text-muted-foreground">
            Browsing live data — served through the portfolio&apos;s GitHub proxy
          </p>
          {repo?.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("chime")}
              className="font-tag inline-flex shrink-0 items-center gap-1 text-[9.5px] font-bold text-accent-ink hover:underline"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              Live demo
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
