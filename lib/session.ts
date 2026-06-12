import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cg_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Prefer SESSION_SECRET; otherwise persist a generated secret so dev
// sessions and magic links survive server restarts.
function getSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const secretPath = path.join(process.cwd(), ".data", "session-secret");
  try {
    const existing = fs.readFileSync(secretPath, "utf8").trim();
    if (existing) return existing;
  } catch {
    // fall through and generate one
  }
  const secret = crypto.randomBytes(32).toString("hex");
  fs.mkdirSync(path.dirname(secretPath), { recursive: true });
  fs.writeFileSync(secretPath, secret, { mode: 0o600 });
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string): {
  token: string;
  expiresAt: Date;
} {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: expiresAt.getTime() })
  ).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifySessionToken(
  token: string | undefined
): { userId: string } | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.sub !== "string" || typeof data.exp !== "number") return null;
    if (data.exp < Date.now()) return null;
    return { userId: data.sub };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    expires: expiresAt,
    path: "/",
  };
}

export async function createSession(userId: string): Promise<void> {
  const { token, expiresAt } = createSessionToken(userId);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Only allows same-site relative paths for post-login redirects. */
export function sanitizeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}
