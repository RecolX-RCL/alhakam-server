import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Customer confirms a payment by id. Anyone who knows the payment id can
 * confirm; in practice the customer learns the id only via their session.
 *
 * The customer's access code is required in the body to ensure the caller
 * really is the customer (lightweight check).
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const { accessCode } = body;
    if (!accessCode) {
      return NextResponse.json({ error: "الرمز مطلوب" }, { status: 400 });
    }

    const payment = await db.payment.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!payment) {
      return NextResponse.json({ error: "الدفعة غير موجودة" }, { status: 404 });
    }
    if (payment.customer.accessCode !== accessCode) {
      return NextResponse.json({ error: "الرمز غير مطابق" }, { status: 403 });
    }
    if (payment.status === "confirmed") {
      return NextResponse.json({ payment });
    }

    const updated = await db.payment.update({
      where: { id },
      data: { status: "confirmed", confirmedAt: new Date() },
    });
    return NextResponse.json({ payment: updated });
  } catch (e) {
    console.error("[payments/confirm]", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
