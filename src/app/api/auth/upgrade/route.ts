// Demo only: set user tier to premium. In production, use Stripe/payment.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { tier: "premium" },
  });
  const token = await createToken({ id: user.id, email: user.email, tier: user.tier });
  const res = NextResponse.json({ user: { id: user.id, email: user.email, tier: user.tier } });
  res.cookies.set("auth", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
  return res;
}
