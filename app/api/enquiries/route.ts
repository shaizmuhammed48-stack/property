import { apiError, apiOk, readJson, methodNotAllowed } from "@/lib/api";
import { AppsScriptError } from "@/lib/apps-script";
import { createEnquiry } from "@/lib/enquiries";
import { getPropertyById } from "@/lib/properties";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { enquirySchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`enquiry:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.ok) {
    return apiError(
      "rate_limited",
      `Too many enquiries from this connection. Please try again in ${limit.retryAfterSeconds} seconds, or call our private desk.`,
      429
    );
  }

  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return apiError("invalid_body", "Submit the enquiry as a JSON object.", 400);
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_failed",
      "Please correct the highlighted fields and try again.",
      422,
      fieldErrors(parsed.error)
    );
  }

  let propertyName: string | undefined;
  let preferredLocation = parsed.data.preferredLocation;
  const propertyId = parsed.data.propertyId;
  if (propertyId) {
    const { property } = await getPropertyById(propertyId);
    if (!property) {
      return apiError(
        "unknown_property",
        "The selected residence is no longer in the index. Please choose another or send a general enquiry.",
        422,
        { propertyId: "This residence is no longer available." }
      );
    }
    propertyName = property.name;
    if (!preferredLocation) {
      preferredLocation = [property.landmark, property.city].filter(Boolean).join(", ");
    }
  }

  try {
    const result = await createEnquiry({
      ...parsed.data,
      preferredLocation,
      propertyName,
    });

    return apiOk(
      {
        enquiry: result.enquiry,
        duplicate: result.duplicate,
        source: result.source,
        message: result.duplicate
          ? "We already received this enquiry. An advisor will be in touch shortly."
          : "Your enquiry has reached the private desk.",
      },
      result.duplicate ? 200 : 201
    );
  } catch (error) {
    console.error("[api/enquiries] Could not save enquiry:", error);
    if (error instanceof AppsScriptError) {
      return apiError(
        "enquiry_unavailable",
        "Our enquiry desk is temporarily unavailable. Please try again, or reach us on WhatsApp.",
        502
      );
    }
    return apiError(
      "enquiry_failed",
      "We could not record the enquiry just now. Please try again or call the private desk.",
      500
    );
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
