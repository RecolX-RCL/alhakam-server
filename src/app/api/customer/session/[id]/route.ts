import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Polling endpoint for the customer side. Returns the customer with their
 * charges & payments so the customer app can refresh in near real-time
 * when the admin adds a new payment.
 *
 * For the lightweight auth, the request must carry the accessCode as a
 * query param.
 */
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const accessCode = url.searchParams.get("code");
  if (!accessCode) {
    return NextResponse.json({ error: "الرمز مطلوب" }, { status: 400 });
  }
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer || customer.accessCode !== accessCode) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  const fresh = await db.customer.findUnique({
    where: { id },
    include: {
      charges: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "asc" } },
    },
  });
  return NextResponse.json({ customer: fresh });
}
