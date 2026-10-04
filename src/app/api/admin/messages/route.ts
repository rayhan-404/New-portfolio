import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/site-store";

export const dynamic = "force-dynamic";

/**
 * Admin inbox — contact-form messages and booking requests, newest
 * first. Read-only: the site keeps collecting, the panel reviews.
 */
export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const [messages, bookings] = await Promise.all([
      db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      db.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    ]);
    return NextResponse.json({ messages, bookings });
  } catch {
    return NextResponse.json(
      { error: "could not load messages" },
      { status: 500 }
    );
  }
}
