import { NextResponse } from "next/server";
import {
  getDesign,
  getGithub,
  getHero,
  isAdminRequest,
  setDesign,
  setGithub,
  setHero,
  setPasscode,
  type BioParagraph,
  type DesignSettings,
} from "@/lib/site-store";

export const dynamic = "force-dynamic";

/**
 * Site settings — the admin panel's store.
 *
 * GET  (public)  → { design, hero }  merged over defaults; the site
 *                  renders from this on every load.
 * PUT  (admin)   → { design? , hero?, passcode? } — partial updates,
 *                  guarded by the x-admin-key header.
 */
export async function GET() {
  try {
    const [design, hero] = await Promise.all([getDesign(), getHero()]);
    return NextResponse.json({ design, hero });
  } catch {
    return NextResponse.json({ error: "settings unavailable" }, { status: 500 });
  }
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

    const [design, hero] = await Promise.all([getDesign(), getHero()]);
    return NextResponse.json({ ok: true, design, hero });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "update failed" },
      { status: 400 }
    );
  }
}
