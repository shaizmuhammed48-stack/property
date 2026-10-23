import { apiError, apiOk, methodNotAllowed } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { getEnquiries } from "@/lib/enquiries";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return apiError("unauthorized", "Sign in to the advisor desk to view enquiries.", 401);
  }

  const { items, source, warning } = await getEnquiries();
  return apiOk({
    enquiries: items,
    count: items.length,
    source,
    warning: warning || null,
  });
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
