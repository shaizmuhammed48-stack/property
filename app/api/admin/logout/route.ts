import { apiOk, methodNotAllowed } from "@/lib/api";
import { ADMIN_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = apiOk({ signedOut: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
