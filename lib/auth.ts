import "server-only";
import {
  createHash,
  createHmac,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "ke_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminSession = { username: string; expiresAt: number };

function safeEqual(left: string, right: string): boolean {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  try {
    const trimmed = storedHash.trim();
    let salt: string;
    let hash: string;

    if (trimmed.startsWith("scrypt$")) {
      const [, saltPart, hashPart] = trimmed.split("$");
      salt = saltPart;
      hash = hashPart;
    } else if (trimmed.startsWith("scrypt:")) {
      const [, saltPart, hashPart] = trimmed.split(":");
      salt = saltPart;
      hash = hashPart;
    } else {
      return false;
    }

    if (!salt || !hash) return false;
    const expected = Buffer.from(hash, "base64url");
    const actual = scryptSync(password, Buffer.from(salt, "base64url"), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME || "";
  const expectedHash = process.env.ADMIN_PASSWORD_HASH || "";
  if (!expectedUsername || !expectedHash) return false;
  const usernameOk = safeEqual(username.trim(), expectedUsername.trim());
  const passwordOk = verifyPasswordHash(password, expectedHash);
  return usernameOk && passwordOk;
}

function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 24) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to a random value of at least 24 characters.");
  }
  // Development fallback keeps local sessions stable without exposing the password.
  const fallback = createHash("sha256")
    .update(`dev-only:${process.env.ADMIN_PASSWORD_HASH || "unconfigured"}`)
    .digest("hex");
  return fallback;
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(username: string): string {
  const payload: AdminSession = {
    username,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readSessionToken(token?: string | null): AdminSession | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (!safeEqual(signature, sign(encoded))) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminSession;
    if (!payload.username || typeof payload.expiresAt !== "number") return null;
    if (payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return readSessionToken(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function isAdminConfigured(): boolean {
  const credentials = Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH);
  if (!credentials) return false;
  if (process.env.NODE_ENV === "production") {
    const secret = process.env.AUTH_SECRET || "";
    return secret.length >= 24;
  }
  return true;
}
