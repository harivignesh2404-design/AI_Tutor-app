import { NextRequest, NextResponse } from "next/server";
import { getSession, isPremium } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Premium-only: return a YouTube search URL for the given query.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPremium(session.user.tier))
    return NextResponse.json({ error: "Premium feature" }, { status: 403 });
  const q = req.nextUrl.searchParams.get("q");
  if (!q)
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  return NextResponse.json({ url });
}
