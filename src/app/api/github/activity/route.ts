import { NextResponse } from "next/server";
import { getGithub } from "@/lib/site-store";

/**
 * GitHub activity — real, verifiable evidence for the "synced with
 * GitHub" claim: commit/repo/star counts plus the actual contribution
 * calendar for the last 12 months.
 *
 * Primary source is the GitHub GraphQL API (the stored classic PAT
 * supports it) — `contributionsCollection` is the only sanctioned way
 * to read the contribution calendar. If the token is missing or the
 * GraphQL call fails, a REST fallback serves the counts without the
 * calendar (repos + stars from /users/:login, commits from search).
 *
 * Responses are cached in local memory for 60 minutes per the stack's
 * no-extra-middleware rule; the last good payload is served past its
 * TTL if GitHub is unreachable, so the section never blanks.
 */

export const dynamic = "force-dynamic";

export interface CalendarDay {
  date: string; // yyyy-mm-dd
  count: number;
  /** 0 (quiet) → 4 (busiest) — rendered as an accent-mixed ramp */
  level: number;
}

export interface CalendarWeek {
  /** exactly 7 slots (Sun→Sat); null = outside the 12-month window */
  days: (CalendarDay | null)[];
}

export interface ActivityPayload {
  source: "github" | "mock" | "empty";
  login: string;
  profileUrl: string;
  /** commit contributions, last 12 months */
  commits: number;
  /** all public contributions (commits + issues + PRs + reviews) */
  totalContributions: number;
  /** public, non-fork repositories */
  repos: number;
  /** stars across the public repos */
  stars: number;
  weeks: CalendarWeek[] | null;
  cached?: boolean;
  error?: string;
}

/* ── Local memory cache (single dev server process) ─────────── */

const CACHE_TTL_MS = 60 * 60 * 1000;
let cache: { at: number; key: string; payload: ActivityPayload } | null = null;

/* ── helpers ────────────────────────────────────────────────── */

function levelOf(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

interface GraphQlCalendar {
  data?: {
    user?: {
      contributionsCollection?: {
        totalCommitContributions?: number;
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: {
            contributionDays?: ({ date: string | null; contributionCount: number } | null)[];
          }[];
        };
      };
      repositories?: {
        totalCount?: number;
        nodes?: ({ stargazerCount?: number } | null)[];
      };
    };
  };
  errors?: { message: string }[];
}

async function fetchViaGraphQL(
  login: string,
  token: string
): Promise<Omit<ActivityPayload, "source" | "login" | "profileUrl">> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          totalCommitContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          totalCount
          nodes { stargazerCount }
        }
      }
    }`;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "m-rayhan-portfolio",
    },
    body: JSON.stringify({ query, variables: { login } }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`GitHub GraphQL responded ${res.status}`);
  const json = (await res.json()) as GraphQlCalendar;
  if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "GraphQL error");

  const collection = json.data?.user?.contributionsCollection;
  const repoList = json.data?.user?.repositories;
  if (!collection || !repoList) throw new Error("GraphQL payload missing user data");

  const weeks: CalendarWeek[] = (collection.contributionCalendar?.weeks ?? []).map(
    (week) => ({
      days: (week.contributionDays ?? []).map((day) =>
        day?.date
          ? { date: day.date, count: day.contributionCount, level: levelOf(day.contributionCount) }
          : null
      ),
    })
  );

  return {
    commits: collection.totalCommitContributions ?? 0,
    totalContributions: collection.contributionCalendar?.totalContributions ?? 0,
    repos: repoList.totalCount ?? 0,
    stars: (repoList.nodes ?? []).reduce((sum, n) => sum + (n?.stargazerCount ?? 0), 0),
    weeks,
  };
}

/* REST fallback — counts only, no calendar */
async function fetchViaRest(
  login: string,
  token: string
): Promise<Omit<ActivityPayload, "source" | "login" | "profileUrl">> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "m-rayhan-portfolio",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const [reposRes, commitsRes] = await Promise.all([
    fetch(
      `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=100&type=owner`,
      { headers, cache: "no-store" }
    ),
    fetch(`https://api.github.com/search/commits?q=author:${encodeURIComponent(login)}`, {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!reposRes.ok) throw new Error(`GitHub API responded ${reposRes.status}`);

  const rawRepos = (await reposRes.json()) as {
    fork: boolean;
    stargazers_count: number;
  }[];
  const owned = rawRepos.filter((r) => !r.fork);

  let commits = 0;
  if (commitsRes.ok) {
    const search = (await commitsRes.json()) as { total_count?: number };
    commits = search.total_count ?? 0;
  }

  return {
    commits,
    totalContributions: commits,
    repos: owned.length,
    stars: owned.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0),
    weeks: null,
  };
}

/* ── Mock fixture (GITHUB_MOCK=1 / offline development) ─────── */

function mockWeeks(): CalendarWeek[] {
  /* deterministic pseudo-activity — stable across reloads so the
     offline layout matches what the live calendar will look like */
  const weeks: CalendarWeek[] = [];
  const start = new Date();
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay()); // back to Sunday
  for (let w = 0; w < 53; w++) {
    const days: (CalendarDay | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      if (date.getTime() > Date.now()) {
        days.push(null);
        continue;
      }
      const seed = Math.abs(Math.sin(w * 12.9898 + d * 78.233) * 43758.5453) % 1;
      const weekend = d === 0 || d === 6 ? 0.35 : 1;
      const count = Math.floor(seed * 9 * weekend);
      days.push({
        date: date.toISOString().slice(0, 10),
        count,
        level: levelOf(count),
      });
    }
    weeks.push({ days });
  }
  return weeks;
}

/* ── GET /api/github/activity ───────────────────────────────── */

export async function GET() {
  const mock = process.env.GITHUB_MOCK?.trim() === "1";

  const gh = await getGithub();
  const login = gh.username || "rayhan-404";
  const key = `${login}|${gh.token ? "tok" : "anon"}|${mock ? "mock" : "live"}`;

  if (mock) {
    const payload: ActivityPayload = {
      source: "mock",
      login,
      profileUrl: `https://github.com/${login}`,
      commits: 327,
      totalContributions: 412,
      repos: 24,
      stars: 31,
      weeks: mockWeeks(),
    };
    return NextResponse.json(payload);
  }

  if (cache && cache.key === key && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...cache.payload, cached: true });
  }

  const payload: ActivityPayload = {
    source: "github",
    login,
    profileUrl: `https://github.com/${login}`,
    commits: 0,
    totalContributions: 0,
    repos: 0,
    stars: 0,
    weeks: null,
  };

  try {
    /* classic PAT → full calendar; fine-grained/absent → REST counts */
    const data = gh.token
      ? await fetchViaGraphQL(login, gh.token).catch(() => fetchViaRest(login, gh.token))
      : await fetchViaRest(login, "");
    Object.assign(payload, data);
    cache = { at: Date.now(), key, payload };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "GitHub request failed";
    if (cache && cache.key === key) {
      return NextResponse.json({ ...cache.payload, cached: true, error: message });
    }
    return NextResponse.json({ ...payload, error: message }, { status: 200 });
  }
}
