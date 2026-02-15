import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-me"
);

export type UserTier = "free" | "premium";

export interface JWTPayload {
  sub: string;
  email: string;
  tier: UserTier;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}

export async function createToken(user: { id: string; email: string; tier: string }): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    tier: user.tier,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function getPayloadFromToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ user: { id: string; email: string; tier: UserTier }; payload: JWTPayload } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) return null;
  const payload = await getPayloadFromToken(token);
  if (!payload?.sub) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, tier: true },
  });
  if (!user) return null;
  return {
    user: { id: user.id, email: user.email, tier: user.tier as UserTier },
    payload,
  };
}

export function isPremium(tier: string): boolean {
  return tier === "premium";
}
