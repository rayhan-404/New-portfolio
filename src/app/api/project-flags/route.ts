import { NextResponse } from "next/server";
import {
  getProjectFlags,
  isAdminRequest,
  replaceProjectFlags,
  type FlagMap,
} from "@/lib/site-store";

export const dynamic = "force-dynamic";

/**
 * Per-project visibility / pinning overrides.
 *
 * GET (public) → { flags } — the site filters curated cards and live
 *                GitHub repos through this map.
 * PUT (admin)  → { flags } — full map replacement.
 */
export async function GET() {
  try {
    const flags = await getProjectFlags();
    return NextResponse.json({ flags });
  } catch {
    return NextResponse.json({ flags: {} });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { flags?: FlagMap };
    if (!body.flags || typeof body.flags !== "object") {
      return NextResponse.json({ error: "flags object required" }, { status: 400 });
    }
    await replaceProjectFlags(body.flags);
    return NextResponse.json({ ok: true, flags: await getProjectFlags() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "update failed" },
      { status: 400 }
    );
  }
}
