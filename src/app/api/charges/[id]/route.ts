import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!verifyAdminAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await db.charge.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!verifyAdminAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const { status } = body;
    if (status !== "in_progress" && status !== "completed") {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }
    const updated = await db.charge.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ charge: updated });
  } catch {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
}
