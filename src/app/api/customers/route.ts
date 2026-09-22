import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/auth";
import { generateAccessCode } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!verifyAdminAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      charges: true,
      payments: true,
    },
  });

  // Compute per-currency totals
  const data = customers.map((c) => {
    const chargesByCurrency = c.charges.reduce(
      (acc, ch) => {
        acc[ch.currency] = (acc[ch.currency] ?? 0) + ch.amount;
        return acc;
      },
      {} as Record<string, number>
    );
    const paymentsByCurrency = c.payments.reduce(
      (acc, p) => {
        if (p.status === "confirmed") {
          acc[p.currency] = (acc[p.currency] ?? 0) + p.amount;
        }
        return acc;
      },
      {} as Record<string, number>
    );
    const pendingPayments = c.payments.filter((p) => p.status === "pending");

    const usdCharges = chargesByCurrency.USD ?? 0;
    const usdPaid = paymentsByCurrency.USD ?? 0;
    const sypCharges = chargesByCurrency.SYP ?? 0;
    const sypPaid = paymentsByCurrency.SYP ?? 0;

    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      notes: c.notes,
      accessCode: c.accessCode,
      createdAt: c.createdAt,
      totals: {
        USD: { charges: usdCharges, paid: usdPaid, remaining: usdCharges - usdPaid },
        SYP: { charges: sypCharges, paid: sypPaid, remaining: sypCharges - sypPaid },
        pendingCount: pendingPayments.length,
      },
      hasPendingPayments: pendingPayments.length > 0,
    };
  });

  return NextResponse.json({ customers: data });
}

export async function POST(req: NextRequest) {
  if (!verifyAdminAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, notes } = body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "الاسم مطلوب (حرفان على الأقل)" },
        { status: 400 }
      );
    }

    // Generate a unique 6-digit code
    const existing = await db.customer.findMany({ select: { accessCode: true } });
    const existingSet = new Set(existing.map((c) => c.accessCode));
    const accessCode = generateAccessCode(existingSet);

    const customer = await db.customer.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        notes: notes?.trim() || null,
        accessCode,
      },
    });

    return NextResponse.json({ customer });
  } catch (e) {
    console.error("[customers/create]", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
