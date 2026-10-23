import { apiError, apiOk, methodNotAllowed, readJson } from "@/lib/api";
import { AppsScriptError } from "@/lib/apps-script";
import { getAdminSession } from "@/lib/auth";
import { setEnquiryStatus } from "@/lib/enquiries";
import { fieldErrors, updateStatusSchema } from "@/lib/validation";
import type { EnquiryStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return apiError("unauthorized", "Sign in to the advisor desk to update enquiries.", 401);
  }

  const { id } = await params;
  const enquiryId = decodeURIComponent(id || "").trim();
  if (!enquiryId || enquiryId.length > 120) {
    return apiError("invalid_id", "A valid enquiry reference is required.", 400);
  }

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return apiError("invalid_body", "Submit the new status as JSON.", 400);
  }

  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_failed",
      "Choose one of New, Contacted, Interested or Closed.",
      422,
      fieldErrors(parsed.error)
    );
  }

  try {
    const enquiry = await setEnquiryStatus(
      enquiryId,
      parsed.data.status as EnquiryStatus
    );
    if (!enquiry) {
      return apiError("enquiry_not_found", "That enquiry could not be found.", 404);
    }
    return apiOk({ enquiry });
  } catch (error) {
    console.error("[api/admin/enquiries] Status update failed:", error);
    if (error instanceof AppsScriptError) {
      return apiError(
        "crm_unavailable",
        "The live CRM bridge did not accept the update. Please retry.",
        502
      );
    }
    return apiError("update_failed", "The enquiry status could not be updated.", 500);
  }
}

export function GET() {
  return methodNotAllowed(["PATCH"]);
}
