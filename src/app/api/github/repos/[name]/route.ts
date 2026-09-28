import { NextRequest, NextResponse } from "next/server";

/**
 * Repo detail — the "inside of a repository" feed for the portfolio's
 * GitHub-style repo browser (file tree + README, site-themed client-side).
 *
 * GET /api/github/repos/:name           → root listing + README
 * GET /api/github/repos/:name?path=a/b  → folder listing
 * GET /api/github/repos/:name?file=a/b.ts → text file preview (truncated)
 *
 * Same env contract as /api/github/repos (GITHUB_USERNAME / GITHUB_TOKEN /
 * GITHUB_MOCK). Token never leaves the server.
 */

export const dynamic = "force-dynamic";

export interface RepoMeta {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  updated_at: string | null;
  default_branch: string;
}

export interface RepoEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
}

export interface RepoDetailPayload {
  login: string;
  repo: RepoMeta | null;
  path: string;
  items: RepoEntry[];
  readme: { name: string; markdown: string } | null;
  file: { name: string; path: string; content: string; truncated: boolean } | null;
  source: "github" | "mock";
  error?: string;
}

/* ── Local memory cache ─────────────────────────────────────── */

const TTL = 5 * 60 * 1000;
const cache = new Map<string, { at: number; payload: RepoDetailPayload }>();
const MAX_FILE_BYTES = 200 * 1024;

/* ── Mock fixture (offline / GITHUB_MOCK=1) ─────────────────── */

const MOCK_TREE: Record<string, RepoEntry[]> = {
  "": [
    { name: "src", path: "src", type: "dir", size: 0 },
    { name: "public", path: "public", type: "dir", size: 0 },
    { name: "README.md", path: "README.md", type: "file", size: 1420 },
    { name: "package.json", path: "package.json", type: "file", size: 640 },
  ],
  src: [
    { name: "app", path: "src/app", type: "dir", size: 0 },
    { name: "components", path: "src/components", type: "dir", size: 0 },
    { name: "lib", path: "src/lib", type: "dir", size: 0 },
    { name: "main.ts", path: "src/main.ts", type: "file", size: 312 },
  ],
  "src/app": [
    { name: "page.tsx", path: "src/app/page.tsx", type: "file", size: 2048 },
    { name: "layout.tsx", path: "src/app/layout.tsx", type: "file", size: 880 },
  ],
  "src/components": [{ name: "ui", path: "src/components/ui", type: "dir", size: 0 }],
  "src/components/ui": [{ name: "button.tsx", path: "src/components/ui/button.tsx", type: "file", size: 1200 }],
  "src/lib": [{ name: "utils.ts", path: "src/lib/utils.ts", type: "file", size: 420 }],
  public: [{ name: "favicon.ico", path: "public/favicon.ico", type: "file", size: 4302 }],
};

const MOCK_FILES: Record<string, string> = {
  "README.md":
    "# Mock Repository\n\nThis is the **mock fixture** served when `GITHUB_MOCK=1`.\n\n- File tree is browsable\n- Text files open as previews\n- Set `GITHUB_MOCK=0` for live GitHub data\n\n```ts\nconst hello = \"world\";\n```\n",
  "package.json":
    '{\n  "name": "mock-repo",\n  "private": true,\n  "scripts": { "dev": "next dev" }\n}\n',
  "src/main.ts": 'import { greet } from "./lib/utils";\n\nconsole.log(greet("M Rayhan"));\n',
  "src/app/page.tsx": "export default function Page() {\n  return <main>Hello from the mock tree</main>;\n}\n",
  "src/app/layout.tsx": "export default function Layout({ children }: { children: React.ReactNode }) {\n  return children;\n}\n",
  "src/components/ui/button.tsx": 'export function Button({ children }: { children: React.ReactNode }) {\n  return <button className="neu">{children}</button>;\n}\n',
  "src/lib/utils.ts": 'export function greet(name: string) {\n  return `Hello, ${name}!`;\n}\n',
};

function mockDetail(login: string, name: string, path: string, filePath: string | null): RepoDetailPayload {
  const list = filePath ? (MOCK_TREE[filePath.split("/").slice(0, -1).join("/")] ?? []) : MOCK_TREE[path] ?? [];
  let file: RepoDetailPayload["file"] = null;
  if (filePath) {
    const content = MOCK_FILES[filePath];
    if (content !== undefined) {
      file = { name: filePath.split("/").pop() ?? filePath, path: filePath, content, truncated: false };
    }
  }
  const isRoot = path === "";
  return {
    login,
    repo: {
      name,
      description: "Mock repository for offline development",
      html_url: `https://github.com/${login}/${name}`,
      homepage: null,
      language: "TypeScript",
      stars: 12,
      forks: 3,
      topics: ["mock"],
      updated_at: new Date().toISOString(),
      default_branch: "main",
    },
    path,
    items: list,
    readme:
      isRoot && !filePath
        ? { name: "README.md", markdown: MOCK_FILES["README.md"] }
        : null,
    file,
    source: "mock",
  };
}

/* ── GitHub fetchers ────────────────────────────────────────── */

function ghHeaders(raw = false): Record<string, string> {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: raw
      ? "application/vnd.github.raw+json"
      : "application/vnd.github+json",
    "User-Agent": "m-rayhan-portfolio",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BINARY_EXT =
  /\.(png|jpe?g|gif|webp|svg|ico|bmp|tiff?|avif|mp4|webm|mov|mp3|wav|ogg|zip|gz|tar|rar|7z|pdf|woff2?|ttf|eot|otf|exe|dll|so|dylib|class|jar|wasm)$/i;

interface GhMeta {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  updated_at: string | null;
  default_branch: string;
}

interface GhContent {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  content?: string | null;
  encoding?: string;
}

async function ghJson<T>(url: string, raw = false): Promise<T> {
  const res = await fetch(url, { headers: ghHeaders(raw), cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Not found on GitHub");
    if (res.status === 403) throw new Error("GitHub rate limit reached — add GITHUB_TOKEN to .env");
    throw new Error(`GitHub API responded ${res.status}`);
  }
  return (await res.json()) as T;
}

/* ── GET handler ────────────────────────────────────────────── */

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ name: string }> }
) {
  const { name: rawName } = await ctx.params;
  const name = decodeURIComponent(rawName);
  const login = process.env.GITHUB_USERNAME?.trim() || "rayhan-404";
  const mock = process.env.GITHUB_MOCK?.trim() === "1";

  const sp = req.nextUrl.searchParams;
  const path = (sp.get("path") ?? "").replace(/^\/+|\/+$/g, "");
  const filePath = (sp.get("file") ?? "").replace(/^\/+|\/+$/g, "") || null;

  const key = `${login}/${name}/${path}/${filePath ?? ""}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json({ ...hit.payload, source: hit.payload.source });
  }

  if (mock) {
    const payload = mockDetail(login, name, path, filePath);
    cache.set(key, { at: Date.now(), payload });
    return NextResponse.json(payload);
  }

  try {
    const meta = await ghJson<GhMeta>(
      `https://api.github.com/repos/${encodeURIComponent(login)}/${encodeURIComponent(name)}`
    );

    const ref = meta.default_branch || "main";

    /* File preview mode */
    let file: RepoDetailPayload["file"] = null;
    if (filePath) {
      if (BINARY_EXT.test(filePath)) {
        file = {
          name: filePath.split("/").pop() ?? filePath,
          path: filePath,
          content: "",
          truncated: false,
        };
      } else {
        const raw = await ghJson<GhContent>(
          `https://api.github.com/repos/${encodeURIComponent(login)}/${encodeURIComponent(
            name
          )}/contents/${filePath.split("/").map(encodeURIComponent).join("")}?ref=${ref}`
        );
        let content = "";
        let truncated = false;
        if (raw.encoding === "base64" && typeof raw.content === "string") {
          const decoded = Buffer.from(raw.content, "base64").toString("utf-8");
          if (decoded.length > MAX_FILE_BYTES) {
            content = decoded.slice(0, MAX_FILE_BYTES);
            truncated = true;
          } else {
            content = decoded;
          }
        }
        file = { name: raw.name, path: raw.path, content, truncated };
      }
    }

    /* Folder listing — also shown alongside a file preview (the file's
       own directory), so the tree stays browsable while previewing */
    const listDir = filePath ? filePath.split("/").slice(0, -1).join("/") : path;
    let items: RepoEntry[] = [];
    let readme: RepoDetailPayload["readme"] = null;

    {
      const listing = await ghJson<GhContent[]>(
        `https://api.github.com/repos/${encodeURIComponent(login)}/${encodeURIComponent(
          name
        )}/contents/${listDir ? listDir.split("/").map(encodeURIComponent).join("/") : ""}?ref=${ref}`
      );
      items = listing
        .map((e) => ({ name: e.name, path: e.path, type: e.type, size: e.size }))
        .sort((a, b) =>
          a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1
        );

      /* README only at the repo root */
      if (listDir === "" && !filePath) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(login)}/${encodeURIComponent(name)}/readme`,
            { headers: ghHeaders(true), cache: "no-store" }
          );
          if (res.ok) {
            const md = await res.text();
            const rd = (await res.json().catch(() => null)) as { name?: string } | null;
            readme = { name: rd?.name ?? "README.md", markdown: md.slice(0, MAX_FILE_BYTES * 2) };
          }
        } catch {
          /* README is optional */
        }
      }
    }

    const payload: RepoDetailPayload = {
      login,
      repo: {
        name: meta.name,
        description: meta.description,
        html_url: meta.html_url,
        homepage: meta.homepage,
        language: meta.language,
        stars: meta.stargazers_count,
        forks: meta.forks_count,
        topics: meta.topics?.slice(0, 4) ?? [],
        updated_at: meta.updated_at,
        default_branch: ref,
      },
      path,
      items,
      readme,
      file,
      source: "github",
    };

    cache.set(key, { at: Date.now(), payload });
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "GitHub request failed";
    const stale = cache.get(key);
    if (stale) return NextResponse.json({ ...stale.payload, error: message });
    return NextResponse.json(
      {
        login,
        repo: null,
        path,
        items: [],
        readme: null,
        file: null,
        source: "github",
        error: message,
      } satisfies RepoDetailPayload,
      { status: 200 }
    );
  }
}
