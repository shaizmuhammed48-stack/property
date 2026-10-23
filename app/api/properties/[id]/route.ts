import { apiError, apiOk } from "@/lib/api";
import { getPropertyById } from "@/lib/properties";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decoded = decodeURIComponent(id || "").trim();
  if (!decoded || decoded.length > 100) {
    return apiError("invalid_id", "A valid property reference is required.", 400);
  }

  const { property, source, warning } = await getPropertyById(decoded);
  if (!property) {
    return apiError(
      "property_not_found",
      "That residence is not part of the current index.",
      404
    );
  }

  return apiOk({ property, source, warning: warning || null });
}
