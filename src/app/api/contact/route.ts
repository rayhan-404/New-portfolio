import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Invalid email address").max(120),
  eventType: z.string().trim().min(2).max(40),
  message: z.string().trim().min(10, "Message is too short").max(4000),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot — must stay empty
});

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "contact"));
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many messages. Try again in ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid submission" },
      { status: 422 }
    );
  }

  // Honeypot filled → silently accept to fool bots, store nothing
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  try {
    const saved = await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        eventType: parsed.data.eventType,
        message: parsed.data.message,
      },
    });
    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (error) {
    console.error("[api/contact] persist failed:", error);
    return NextResponse.json(
      { error: "Could not deliver your message right now. Please email directly." },
      { status: 500 }
    );
  }
}
