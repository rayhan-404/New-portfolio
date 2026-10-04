import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { journey } from "@/lib/portfolio-data";
import {
  DEFAULT_ACCENT,
  DEFAULT_CONTACT,
  DEFAULT_HERO,
  DEFAULT_PASSCODE,
  DEFAULT_PROJECTS,
  DEFAULT_SKILLS,
  DEFAULT_THEME,
  type BioParagraph,
  type ContactContent,
  type CustomProject,
  type DesignSettings,
  type GithubSettings,
  type HeroContent,
  type SkillsContent,
} from "@/lib/site-defaults";

export * from "@/lib/site-defaults";

/* ═══════════════════════════════════════════════════════════════
   Site store — server-side access to the admin panel's data.
   JSON blobs in SiteSetting keyed by name, JourneyStop rows for
   the timeline, ProjectFlag rows for per-project overrides.
   ═══════════════════════════════════════════════════════════════ */

/* ── SiteSetting JSON blobs ───────────────────────────────────── */

async function readSetting<T>(key: string): Promise<T | null> {
  try {
    const row = await db.siteSetting.findUnique({ where: { key } });
    return row ? (JSON.parse(row.value) as T) : null;
  } catch {
    return null;
  }
}

async function writeSetting(key: string, value: unknown): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}

export async function getDesign(): Promise<DesignSettings> {
  const saved = await readSetting<Partial<DesignSettings>>("design");
  return {
    accent: saved?.accent ?? DEFAULT_ACCENT,
    theme: saved?.theme === "light" ? "light" : DEFAULT_THEME,
  };
}

export async function setDesign(next: DesignSettings): Promise<void> {
  await writeSetting("design", {
    accent: next.accent,
    theme: next.theme === "light" ? "light" : "dark",
  });
}

export async function getHero(): Promise<HeroContent> {
  const saved = await readSetting<Partial<HeroContent>>("hero");
  if (!saved) return DEFAULT_HERO;
  return {
    greeting: saved.greeting ?? DEFAULT_HERO.greeting,
    name: saved.name ?? DEFAULT_HERO.name,
    role: saved.role ?? DEFAULT_HERO.role,
    paragraphs:
      Array.isArray(saved.paragraphs) && saved.paragraphs.length > 0
        ? saved.paragraphs
        : DEFAULT_HERO.paragraphs,
  };
}

export async function setHero(next: HeroContent): Promise<void> {
  await writeSetting("hero", next);
}

export async function getGithub(): Promise<GithubSettings> {
  const saved = await readSetting<Partial<GithubSettings>>("github");
  return {
    username: saved?.username ?? process.env.GITHUB_USERNAME ?? "rayhan-404",
    token: saved?.token ?? process.env.GITHUB_TOKEN ?? "",
  };
}

export async function setGithub(next: GithubSettings): Promise<void> {
  await writeSetting("github", {
    username: next.username.trim() || "rayhan-404",
    token: next.token.trim(),
  });
}

/* ── Projects / Contact / Skills (v91) ───────────────────────── */

export async function getCustomProjects(): Promise<CustomProject[]> {
  const saved = await readSetting<CustomProject[]>("projects");
  return Array.isArray(saved) ? saved : DEFAULT_PROJECTS;
}

export async function setCustomProjects(list: CustomProject[]): Promise<void> {
  await writeSetting("projects", list);
}

export async function getContact(): Promise<ContactContent> {
  const saved = await readSetting<Partial<ContactContent>>("contact");
  return {
    email: saved?.email?.trim() || DEFAULT_CONTACT.email,
    phone: saved?.phone ?? DEFAULT_CONTACT.phone,
    location: saved?.location ?? DEFAULT_CONTACT.location,
    socials:
      Array.isArray(saved?.socials) && saved!.socials.length > 0
        ? saved!.socials
        : DEFAULT_CONTACT.socials,
  };
}

export async function setContact(next: ContactContent): Promise<void> {
  await writeSetting("contact", next);
}

export async function getSkills(): Promise<SkillsContent> {
  const saved = await readSetting<Partial<SkillsContent>>("skills");
  return {
    meters:
      Array.isArray(saved?.meters) && saved!.meters.length > 0
        ? saved!.meters
        : DEFAULT_SKILLS.meters,
    chips: Array.isArray(saved?.chips) ? saved!.chips : DEFAULT_SKILLS.chips,
  };
}

export async function setSkills(next: SkillsContent): Promise<void> {
  await writeSetting("skills", next);
}

/* ── Admin passcode (stored as a sha-256 hash) ────────────────── */

function hashOf(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** Verify a candidate passcode. First run: the default passcode is
    accepted and seeded, so the panel works out of the box. */
export async function verifyPasscode(candidate: string): Promise<boolean> {
  const saved = await readSetting<{ hash: string }>("admin");
  if (!saved) {
    if (candidate === DEFAULT_PASSCODE) {
      await writeSetting("admin", { hash: hashOf(DEFAULT_PASSCODE) });
      return true;
    }
    return false;
  }
  return saved.hash === hashOf(candidate);
}

export async function setPasscode(next: string): Promise<void> {
  const trimmed = next.trim();
  if (trimmed.length < 4) throw new Error("Passcode needs at least 4 characters");
  await writeSetting("admin", { hash: hashOf(trimmed) });
}

/** Header check for every mutating admin API call. */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const key = req.headers.get("x-admin-key") ?? "";
  if (!key) return false;
  const saved = await readSetting<{ hash: string }>("admin");
  return saved ? saved.hash === hashOf(key) : key === DEFAULT_PASSCODE;
}

/* ── Journey stops (auto-seeded from the static data once) ────── */

export interface JourneyRow {
  id: string;
  period: string;
  title: string;
  icon: string;
  place: string;
  location: string | null;
  description: string;
  tag: string;
  degree: string | null;
  current: boolean;
  order: number;
}

export async function getJourneyStops(): Promise<JourneyRow[]> {
  let rows = await db.journeyStop.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) {
    await db.journeyStop.createMany({
      data: journey.map((e, i) => ({ ...e, order: i })),
    });
    rows = await db.journeyStop.findMany({ orderBy: { order: "asc" } });
  }
  return rows;
}

export async function replaceJourneyStops(
  stops: Omit<JourneyRow, "id" | "order">[]
): Promise<JourneyRow[]> {
  await db.$transaction([
    db.journeyStop.deleteMany(),
    db.journeyStop.createMany({
      data: stops.map((s, i) => ({ ...s, order: i })),
    }),
  ]);
  return db.journeyStop.findMany({ orderBy: { order: "asc" } });
}

/* ── Project flags ────────────────────────────────────────────── */

export interface FlagMap {
  [id: string]: { hidden: boolean; featured: boolean };
}

export async function getProjectFlags(): Promise<FlagMap> {
  const rows = await db.projectFlag.findMany();
  const map: FlagMap = {};
  for (const r of rows) {
    map[r.id] = { hidden: r.hidden, featured: r.featured };
  }
  return map;
}

export async function replaceProjectFlags(map: FlagMap): Promise<void> {
  await db.$transaction([
    db.projectFlag.deleteMany(),
    db.projectFlag.createMany({
      data: Object.entries(map).map(([id, f]) => ({
        id,
        hidden: Boolean(f.hidden),
        featured: Boolean(f.featured),
      })),
    }),
  ]);
}
