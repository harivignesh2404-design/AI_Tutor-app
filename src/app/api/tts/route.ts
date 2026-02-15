import { NextRequest, NextResponse } from "next/server";
import { getSession, isPremium } from "@/lib/auth";
import { openai } from "@/lib/openai";

// Free: alloy (simpler). Premium: nova (higher quality).
const VOICE_FREE = "alloy";
const VOICE_PREMIUM = "nova";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!openai)
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const { text } = body;
    if (!text || typeof text !== "string")
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    const truncated = text.slice(0, 4096);
    const voice = isPremium(session.user.tier) ? VOICE_PREMIUM : VOICE_FREE;
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "nova",
      input: truncated,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
