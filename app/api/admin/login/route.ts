import { apiError, apiOk, methodNotAllowed, readJson } from "@/lib/api";
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminConfigured,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { adminLoginSchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return apiError(
      "rate_limited",
      `Too many sign-in attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
      429
    );
  }

  if (!isAdminConfigured()) {
    return apiError(
      "admin_not_configured",
      "The advisor desk is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH and AUTH_SECRET.",
      503
    );
  }

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return apiError("invalid_body", "Submit your username and password.", 400);
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_failed",
      "Enter your username and password.",
      422,
      fieldErrors(parsed.error)
    );
  }

  if (!verifyAdminCredentials(parsed.data.username, parsed.data.password)) {
    // Deliberately generic so the response does not reveal which field was wrong.
    return apiError("invalid_credentials", "Invalid username or password.", 401);
  }

  const username = parsed.data.username.trim();
  const token = createSessionToken(username);
  const response = apiOk({ username });
  response.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions);
  return response;
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
