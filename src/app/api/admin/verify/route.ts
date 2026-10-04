import { NextResponse } from "next/server";
import { isAdminRequest, verifyPasscode } from "@/lib/site-store";

export const dynamic = "force-dynamic";

/**
 * Admin passcode check. On success the client keeps the passcode in
 * sessionStorage and sends it as the x-admin-key header on every
 * mutating call. Also doubles as a cheap "is my saved key still
 * valid" probe (send the key as the candidate).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { key?: string };
    const key = String(body.key ?? "");
    if (!key) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const ok = await verifyPasscode(key);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

/** Convenience probe used by the panel on mount to restore a session. */
export async function GET(req: Request) {
  const valid = await isAdminRequest(req);
  return NextResponse.json({ ok: valid });
}
