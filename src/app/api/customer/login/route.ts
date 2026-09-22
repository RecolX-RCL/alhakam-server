import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Customer login via 6-digit access code.
 * Returns the customer record (with charges & payments) on success.
 */
export async function POST(req: NextRequest) {
  try {
    const { accessCode } = await req.json();
    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json({ error: "الرمز مطلوب" }, { status: 400 });
    }
    const code = accessCode.trim();
    if (!/^\d{4,8}$/.test(code)) {
      return NextResponse.json(
        { error: "الرمز غير صالح (4 إلى 8 أرقام)" },
        { status: 400 }
      );
    }

    const customer = await db.customer.findUnique({
      where: { accessCode: code },
      include: {
        charges: { orderBy: { createdAt: "asc" } },
        payments: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!customer) {
      return NextResponse.json({ error: "لا يوجد زبون بهذا الرمز" }, { status: 404 });
    }
    return NextResponse.json({ customer });
  } catch (e) {
    console.error("[customer/login]", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
