import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Seed route: populates the database with a few demo customers + charges +
 * payments so the user can immediately see the app working.
 * Idempotent — will not duplicate if customers already exist.
 */
export async function POST() {
  const existing = await db.customer.count();
  if (existing > 0) {
    return NextResponse.json({ ok: true, message: "already seeded" });
  }

  const c1 = await db.customer.create({
    data: { name: "أحمد محمد", phone: "0991234567", notes: "زبون قديم", accessCode: "123456" },
  });
  const c2 = await db.customer.create({
    data: { name: "سامر خليل", phone: "0944444123", notes: null, accessCode: "654321" },
  });
  const c3 = await db.customer.create({
    data: { name: "غسان علي", phone: null, notes: "بيت الساعة", accessCode: "987654" },
  });

  await db.charge.create({
    data: { customerId: c1.id, description: "شبابيك ألمنيوم، عدد 5", amount: 700, currency: "USD", status: "completed" },
  });
  await db.charge.create({
    data: { customerId: c1.id, description: "باب دخلي sliding", amount: 250, currency: "USD", status: "in_progress" },
  });
  await db.payment.create({
    data: { customerId: c1.id, amount: 400, currency: "USD", status: "confirmed" },
  });
  await db.payment.create({
    data: { customerId: c1.id, amount: 100, currency: "USD", status: "pending", note: "دفعة جديدة" },
  });

  await db.charge.create({
    data: { customerId: c2.id, description: "كاونتر مطبخ + رف", amount: 450000, currency: "SYP", status: "in_progress" },
  });
  await db.payment.create({
    data: { customerId: c2.id, amount: 200000, currency: "SYP", status: "confirmed" },
  });

  await db.charge.create({
    data: { customerId: c3.id, description: "واجهة زجاج", amount: 350, currency: "USD", status: "in_progress" },
  });

  return NextResponse.json({ ok: true, seeded: [c1.id, c2.id, c3.id] });
}
