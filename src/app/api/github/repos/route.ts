import { NextResponse } from "next/server";

/**
 * GitHub repositories — server-side proxy for the portfolio's
 * "Live from GitHub" repo browser.
 *
 * Env contract (.env — never exposed to the browser):
 *   GITHUB_USERNAME  GitHub handle whose public repos are listed
 *   GITHUB_TOKEN     optional fine-grained PAT — raises the rate limit;
 *                    when empty the public API is used (60 req/h, cached)
 *   GITHUB_MOCK      "1" → serve the built-in fixture (no network), "0" → live
 *
 * Responses are cached in local memory for 10 minutes per the stack's
 * no-extra-middleware rule, so the browser never hits GitHub directly.
 */

export const dynamic = "force-dynamic";

export interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  updated_at: string | null;
}

/* ── Local memory cache (single dev server process) ─────────── */

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { at: number; payload: ReposPayload } | null = null;

export interface ReposPayload {
  source: "github" | "mock" | "empty";
  login: string;
  profileUrl: string;
  repos: GithubRepo[];
  cached?: boolean;
  error?: string;
}

/* ── Mock fixture (GITHUB_MOCK=1 / offline development) ─────── */

const MOCK_REPOS: GithubRepo[] = [
  {
    name: "pulseai",
    description:
      "AI health assistant that turns symptom checklists into structured triage reports — Next.js, Gemini, Prisma.",
    html_url: "https://github.com/rayhan-404/pulseai",
    homepage: null,
    language: "TypeScript",
    stars: 14,
    forks: 3,
    topics: ["ai", "nextjs", "health"],
    updated_at: "2026-09-20T10:00:00Z",
  },
  {
    name: "auraui",
    description:
      "Neumorphic + glassmorphism component kit with a token-first theming engine and zero-runtime styling.",
    html_url: "https://github.com/rayhan-404/auraui",
    homepage: null,
    language: "TypeScript",
    stars: 9,
    forks: 2,
    topics: ["design-system", "react", "tailwind"],
    updated_at: "2026-09-11T10:00:00Z",
  },
  {
    name: "ecotrack",
    description:
      "Daily carbon footprint tracker with streaks, charts and a Firebase sync layer for offline-first use.",
    html_url: "https://github.com/rayhan-404/ecotrack",
    homepage: null,
    language: "Dart",
    stars: 7,
    forks: 1,
    topics: ["flutter", "firebase", "climate"],
    updated_at: "2026-08-30T10:00:00Z",
  },
  {
    name: "devcanvas",
    description:
      "Collaborative whiteboard for developers — CRDT sync, shape tools and code-snippet pins on an infinite canvas.",
    html_url: "https://github.com/rayhan-404/devcanvas",
    homepage: null,
    language: "JavaScript",
    stars: 5,
    forks: 2,
    topics: ["canvas", "websocket", "crdt"],
    updated_at: "2026-08-12T10:00:00Z",
  },
];

/* ── GitHub fetch + mapping ─────────────────────────────────── */

interface RawRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  updated_at: string | null;
  fork: boolean;
  archived: boolean;
}

async function fetchRepos(login: string): Promise<GithubRepo[]> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "m-rayhan-portfolio",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=100&sort=updated&type=owner`,
    { headers, cache: "no-store" }
  );

  if (res.status === 404) {
    throw new Error(`GitHub user "${login}" not found`);
  }
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    throw new Error("GitHub rate limit reached — add GITHUB_TOKEN to .env");
  }
  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status}`);
  }

  const raw = (await res.json()) as RawRepo[];

  return raw
    .filter((r) => !r.fork && !r.archived)
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        String(b.updated_at).localeCompare(String(a.updated_at))
    )
    .map((r) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      topics: r.topics?.slice(0, 3) ?? [],
      updated_at: r.updated_at,
    }));
}

/* ── GET /api/github/repos ──────────────────────────────────── */

export async function GET() {
  const login = process.env.GITHUB_USERNAME?.trim() || "rayhan-404";
  const mock = process.env.GITHUB_MOCK?.trim() === "1";

  const payload: ReposPayload = {
    source: mock ? "mock" : "github",
    login,
    profileUrl: `https://github.com/${login}`,
    repos: [],
  };

  if (mock) {
    payload.repos = MOCK_REPOS;
    return NextResponse.json(payload);
  }

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...cache.payload, cached: true });
  }

  try {
    payload.repos = await fetchRepos(login);
    cache = { at: Date.now(), payload };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "GitHub request failed";
    // Serve stale cache if we have one, else a soft-empty payload the
    // browser can render a graceful fallback from.
    if (cache) {
      return NextResponse.json({ ...cache.payload, cached: true, error: message });
    }
    return NextResponse.json({ ...payload, error: message }, { status: 200 });
  }
}
