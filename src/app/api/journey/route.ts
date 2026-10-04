import { NextResponse } from "next/server";
import {
  getJourneyStops,
  isAdminRequest,
  replaceJourneyStops,
  type JourneyRow,
} from "@/lib/site-store";

export const dynamic = "force-dynamic";

/**
 * Journey timeline — DB-backed so the admin panel controls it.
 *
 * GET (public) → { stops } — ordered rows; the six default chapters
 *                are auto-seeded on first read.
 * PUT (admin)  → { stops: [...] } — full ordered replacement (edits,
 *                adds, deletes and reorders all funnel through this).
 */
export async function GET() {
  try {
    const stops = await getJourneyStops();
    return NextResponse.json({ stops });
  } catch {
    return NextResponse.json({ stops: [], error: "journey unavailable" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { stops?: Partial<JourneyRow>[] };
    if (!Array.isArray(body.stops) || body.stops.length === 0) {
      return NextResponse.json({ error: "stops array required" }, { status: 400 });
    }
    const cleaned = body.stops.map((s) => ({
      period: String(s.period ?? "").slice(0, 40),
      title: String(s.title ?? "").slice(0, 80),
      icon: String(s.icon ?? "rocket").slice(0, 20),
      place: String(s.place ?? "").slice(0, 80),
      location: s.location ? String(s.location).slice(0, 120) : null,
      description: String(s.description ?? "").slice(0, 600),
      tag: String(s.tag ?? "").slice(0, 40),
      degree: s.degree ? String(s.degree).slice(0, 120) : null,
      current: Boolean(s.current),
    }));
    if (cleaned.some((s) => !s.period || !s.title)) {
      return NextResponse.json(
        { error: "every stop needs at least a period and a title" },
        { status: 400 }
      );
    }
    const stops = await replaceJourneyStops(cleaned);
    return NextResponse.json({ ok: true, stops });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "update failed" },
      { status: 400 }
    );
  }
}
