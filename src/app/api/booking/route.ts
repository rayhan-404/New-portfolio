import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const bookingSchema = z.object({
  topic: z.string().trim().min(2).max(60),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  timeSlot: z.string().trim().min(3).max(40),
  email: z.string().trim().email("Invalid email address").max(120),
});

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "booking"));
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid booking" },
      { status: 422 }
    );
  }

  try {
    const saved = await db.bookingRequest.create({
      data: {
        topic: parsed.data.topic,
        date: parsed.data.date,
        timeSlot: parsed.data.timeSlot,
        email: parsed.data.email,
      },
    });
    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (error) {
    console.error("[api/booking] persist failed:", error);
    return NextResponse.json(
      { error: "Could not schedule right now. Please email directly." },
      { status: 500 }
    );
  }
}
