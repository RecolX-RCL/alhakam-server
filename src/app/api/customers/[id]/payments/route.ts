import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!verifyAdminAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const { amount, currency, note } = body;
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      return NextResponse.json({ error: "المبلغ غير صالح" }, { status: 400 });
    }
    if (currency !== "USD" && currency !== "SYP") {
      return NextResponse.json({ error: "العملة غير صالحة" }, { status: 400 });
    }
    const customer = await db.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ error: "الزبون غير موجود" }, { status: 404 });
    }

    // New payments created by admin start as "pending" — the customer must
    // confirm them before they are counted as paid.
    const payment = await db.payment.create({
      data: {
        customerId: id,
        amount: num,
        currency,
        note: note?.trim() || null,
        status: "pending",
      },
    });
    return NextResponse.json({ payment });
  } catch (e) {
    console.error("[payments/create]", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
