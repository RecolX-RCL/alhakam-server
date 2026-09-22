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
    const { description, amount, currency, status } = body;
    if (!description || typeof description !== "string" || description.trim().length < 2) {
      return NextResponse.json({ error: "الوصف مطلوب" }, { status: 400 });
    }
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

    const charge = await db.charge.create({
      data: {
        customerId: id,
        description: description.trim(),
        amount: num,
        currency,
        status: status === "completed" ? "completed" : "in_progress",
      },
    });
    return NextResponse.json({ charge });
  } catch (e) {
    console.error("[charges/create]", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
