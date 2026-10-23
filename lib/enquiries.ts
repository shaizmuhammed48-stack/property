import "server-only";
import {
  callAppsScript,
  isAdminTokenConfigured,
  isAppsScriptConfigured,
} from "./apps-script";
import {
  appendLocalEnquiry,
  findLocalDuplicate,
  listLocalEnquiries,
  updateLocalEnquiryStatus,
} from "./local-store";
import { normalizeEnquiriesPayload } from "./normalize";
import { getProperties } from "./properties";
import type { EnquiriesResult, Enquiry, EnquiryInput, EnquiryStatus } from "./types";

export type CreateEnquiryResult = {
  enquiry: Enquiry;
  duplicate: boolean;
  source: "apps-script" | "local";
};

/** The sheet bridge uses lower-case status labels, including "in progress". */
const SHEET_STATUS: Record<EnquiryStatus, string> = {
  New: "new",
  Contacted: "contacted",
  Interested: "in progress",
  Closed: "closed",
};

function sheetRowId(id: string) {
  const match = id.trim().match(/^ROW-(\d+)$/i);
  return match ? Number(match[1]) : null;
}

function blankEnquiry(id: string, status: EnquiryStatus): Enquiry {
  return {
    id,
    buyerName: "",
    phone: "",
    email: "",
    propertyId: "",
    propertyName: "",
    preferredLocation: "",
    budget: "",
    propertyType: "",
    bedrooms: "",
    message: "",
    status,
    createdAt: "",
    source: "website",
  };
}

export function createEnquiryId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ENQ-${stamp}-${random}`;
}

export async function createEnquiry(input: EnquiryInput): Promise<CreateEnquiryResult> {
  if (isAppsScriptConfigured()) {
    const isGeneral = !(input.propertyId || "").trim();
    let propertyId = (input.propertyId || "").trim();
    let message = input.message || "";

    // The lightweight sheet bridge requires an existing property reference, so
    // general briefs are attached to the first residence and flagged in the
    // message. The bundled bridge understands the `general` flag directly.
    if (!propertyId) {
      const { items } = await getProperties();
      propertyId = items[0]?.id || "";
      message = `[General enquiry] ${message}`.trim();
    }
    if (!propertyId) {
      throw new Error("No residence is available to receive this enquiry.");
    }

    const payload = await callAppsScript<{ row?: number } | undefined>({
      action: "addEnquiry",
      method: "POST",
      body: {
        id: propertyId,
        propertyId,
        general: isGeneral,
        name: input.buyerName,
        buyerName: input.buyerName,
        phone: input.phone,
        email: input.email || "",
        message,
        propertyName: input.propertyName || "",
        preferredLocation: input.preferredLocation || "",
        budget: input.budget || "",
        propertyType: input.propertyType || "",
        bedrooms: input.bedrooms || "",
      },
    });

    const row = payload && typeof payload === "object" ? Number(payload.row) : 0;
    const duplicate = Boolean(
      payload &&
        typeof payload === "object" &&
        (payload as { duplicate?: boolean }).duplicate
    );
    const enquiry: Enquiry = {
      id: Number.isFinite(row) && row > 0 ? `ROW-${row}` : createEnquiryId(),
      buyerName: input.buyerName,
      phone: input.phone,
      email: input.email || "",
      propertyId,
      propertyName: input.propertyName || "",
      preferredLocation: input.preferredLocation || "",
      budget: input.budget || "",
      propertyType: input.propertyType || "",
      bedrooms: input.bedrooms || "",
      message: input.message || "",
      status: "New",
      createdAt: new Date().toISOString(),
      source: "website",
    };

    return { enquiry, duplicate, source: "apps-script" };
  }

  const duplicate = await findLocalDuplicate({
    phone: input.phone,
    propertyId: input.propertyId,
  });
  if (duplicate) {
    return { enquiry: duplicate, duplicate: true, source: "local" };
  }

  const enquiry: Enquiry = {
    id: createEnquiryId(),
    buyerName: input.buyerName,
    phone: input.phone,
    email: input.email || "",
    propertyId: input.propertyId || "",
    propertyName: input.propertyName || "",
    preferredLocation: input.preferredLocation || "",
    budget: input.budget || "",
    propertyType: input.propertyType || "",
    bedrooms: input.bedrooms || "",
    message: input.message || "",
    status: "New",
    createdAt: new Date().toISOString(),
    source: "website",
  };

  await appendLocalEnquiry(enquiry);
  return { enquiry, duplicate: false, source: "local" };
}

async function fetchEnquiriesPayload() {
  try {
    return await callAppsScript<unknown>({
      action: "enquiries",
      admin: isAdminTokenConfigured(),
    });
  } catch (error) {
    // Older deployments of the bundled bridge expose listEnquiries instead.
    if (!isAdminTokenConfigured()) throw error;
    return callAppsScript<unknown>({
      action: "listEnquiries",
      method: "POST",
      admin: true,
      body: {},
    });
  }
}

export async function getEnquiries(): Promise<EnquiriesResult> {
  if (!isAppsScriptConfigured()) {
    return {
      items: await listLocalEnquiries(),
      source: "mock",
      warning:
        "Preview enquiry desk. Connect the Google Apps Script bridge to read and update live buyer enquiries.",
    };
  }

  try {
    const payload = await fetchEnquiriesPayload();
    const items = normalizeEnquiriesPayload(payload);

    if (items.length > 0) {
      const { items: properties } = await getProperties();
      const names = new Map(
        properties.map((property) => [property.id.trim().toUpperCase(), property.name])
      );
      for (const enquiry of items) {
        if (!enquiry.propertyName && enquiry.propertyId) {
          enquiry.propertyName = names.get(enquiry.propertyId.trim().toUpperCase()) || "";
        }
      }
    }

    return { items, source: "apps-script" };
  } catch (error) {
    console.error("[enquiries] Apps Script fetch failed:", error);
    return {
      items: await listLocalEnquiries(),
      source: "mock",
      warning:
        "The live CRM bridge is temporarily unavailable. Local preview enquiries are shown instead.",
    };
  }
}

export async function setEnquiryStatus(id: string, status: EnquiryStatus) {
  if (isAppsScriptConfigured()) {
    const row = sheetRowId(id);
    if (row !== null) {
      await callAppsScript({
        action: "updateEnquiry",
        method: "POST",
        admin: isAdminTokenConfigured(),
        body: { row, status: SHEET_STATUS[status] },
      });
      return blankEnquiry(id, status);
    }

    const payload = await callAppsScript<unknown>({
      action: "updateEnquiryStatus",
      method: "POST",
      body: { id, status },
    });
    const parsed = payload as { enquiry?: unknown } | undefined;
    const rows = parsed?.enquiry ? [parsed.enquiry] : Array.isArray(payload) ? payload : [];
    const [enquiry] = normalizeEnquiriesPayload(rows);
    return enquiry || null;
  }
  return updateLocalEnquiryStatus(id, status);
}
