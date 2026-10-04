import { NextResponse } from "next/server";
import {
  getContact,
  getCustomProjects,
  getDesign,
  getGithub,
  getHero,
  getSkills,
  isAdminRequest,
  setContact,
  setCustomProjects,
  setDesign,
  setGithub,
  setHero,
  setPasscode,
  setSkills,
  type BioParagraph,
  type ContactSocial,
  type DesignSettings,
  type SkillMeterDef,
} from "@/lib/site-store";

export const dynamic = "force-dynamic";

/**
 * Site settings — the admin panel's store.
 *
 * GET  (public)  → { design, hero, projects, contact, skills }
 *                  merged over defaults; the site renders from this
 *                  on every load.
 * PUT  (admin)   → partial update of any blob, guarded by the
 *                  x-admin-key header.
 */
export async function GET() {
  try {
    const [design, hero, projects, contact, skills] = await Promise.all([
      getDesign(),
      getHero(),
      getCustomProjects(),
      getContact(),
      getSkills(),
    ]);
    return NextResponse.json({ design, hero, projects, contact, skills });
  } catch {
    return NextResponse.json({ error: "settings unavailable" }, { status: 500 });
  }
}

/** cuid-ish id for admin-created projects (no db row needed). */
function newId(): string {
  return `cp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function PUT(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      design?: Partial<DesignSettings>;
      hero?: {
        greeting?: string;
        name?: string;
        role?: string;
        paragraphs?: BioParagraph[];
      };
      projects?: unknown;
      contact?: {
        email?: string;
        phone?: string;
        location?: string;
        socials?: ContactSocial[];
      };
      skills?: { meters?: SkillMeterDef[]; chips?: string[] };
      github?: { username?: string; token?: string };
      passcode?: string;
    };

    if (body.design) {
      await setDesign({
        accent: String(body.design.accent ?? "mono"),
        theme: body.design.theme === "light" ? "light" : "dark",
      });
    }
    if (body.hero) {
      const current = await getHero();
      await setHero({
        greeting: String(body.hero.greeting ?? current.greeting),
        name: String(body.hero.name ?? current.name),
        role: String(body.hero.role ?? current.role),
        paragraphs: Array.isArray(body.hero.paragraphs)
          ? body.hero.paragraphs.map((p) => ({
              style: p.style === "lead" || p.style === "closing" ? p.style : "body",
              text: String(p.text ?? ""),
            }))
          : current.paragraphs,
      });
    }
    if (Array.isArray(body.projects)) {
      await setCustomProjects(
        body.projects.map((p) => {
          const row = p as Record<string, unknown>;
          const title = String(row.title ?? "").trim().slice(0, 90);
          if (!title) throw new Error("every project needs a title");
          return {
            id: String(row.id ?? "").trim() || newId(),
            title,
            description: String(row.description ?? "").slice(0, 900),
            tag: row.tag ? String(row.tag).slice(0, 40) : undefined,
            tech: Array.isArray(row.tech)
              ? row.tech.map((t) => String(t).slice(0, 30)).filter(Boolean).slice(0, 10)
              : [],
            link: row.link ? String(row.link).slice(0, 300) : undefined,
            repo: row.repo ? String(row.repo).slice(0, 90) : undefined,
            featured: Boolean(row.featured),
          };
        })
      );
    }
    if (body.contact) {
      const current = await getContact();
      await setContact({
        email: body.contact.email?.trim() || current.email,
        phone: body.contact.phone ?? current.phone,
        location: body.contact.location ?? current.location,
        socials: Array.isArray(body.contact.socials)
          ? body.contact.socials
              .map((s) => ({
                label: String(s.label ?? "").slice(0, 40),
                href: String(s.href ?? "").slice(0, 300),
              }))
              .filter((s) => s.label && s.href)
          : current.socials,
      });
    }
    if (body.skills) {
      const current = await getSkills();
      await setSkills({
        meters: Array.isArray(body.skills.meters)
          ? body.skills.meters
              .map((m) => ({
                name: String(m.name ?? "").slice(0, 60),
                level: Math.max(1, Math.min(100, Math.round(Number(m.level) || 0))),
              }))
              .filter((m) => m.name)
          : current.meters,
        chips: Array.isArray(body.skills.chips)
          ? body.skills.chips.map((c) => String(c).slice(0, 40)).filter(Boolean)
          : current.chips,
      });
    }
    if (body.github) {
      const current = await getGithub();
      await setGithub({
        username: body.github.username ?? current.username,
        token: body.github.token ?? current.token,
      });
    }
    if (body.passcode) {
      await setPasscode(String(body.passcode));
    }

    const [design, hero, projects, contact, skills] = await Promise.all([
      getDesign(),
      getHero(),
      getCustomProjects(),
      getContact(),
      getSkills(),
    ]);
    return NextResponse.json({ ok: true, design, hero, projects, contact, skills });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "update failed" },
      { status: 400 }
    );
  }
}
