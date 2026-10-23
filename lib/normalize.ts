import type { Enquiry, EnquiryStatus, Property } from "./types";
import { resolveImages } from "./images";

type UnknownRecord = Record<string, unknown>;

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toRecord(row: unknown, headers?: string[]): UnknownRecord {
  if (Array.isArray(row) && headers) {
    return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
  }
  if (row && typeof row === "object") return row as UnknownRecord;
  return {};
}

function normalizedMap(record: UnknownRecord): Map<string, unknown> {
  const map = new Map<string, unknown>();
  for (const [key, value] of Object.entries(record)) {
    map.set(normalizeKey(key), value);
  }
  return map;
}

function pick(map: Map<string, unknown>, aliases: string[]): unknown {
  for (const alias of aliases) {
    const value = map.get(normalizeKey(alias));
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return undefined;
}

function text(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function integer(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const match = text(value).match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

/**
 * Parses sheet prices written as 9600000, "96,00,000", "₹96 Lakh",
 * "1.2 Cr" or "₹1,20,00,000". Plain values below 1000 are treated as lakh,
 * which is the convention used in most Kerala property sheets.
 */
export function parsePrice(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value <= 0) return 0;
    return value < 1000 ? Math.round(value * 100000) : Math.round(value);
  }
  const raw = text(value).toLowerCase();
  if (!raw || /request|call|tbd|na/.test(raw)) return 0;
  const numeric = Number.parseFloat(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric)) return 0;
  if (/cr|crore/.test(raw)) return Math.round(numeric * 10000000);
  if (/lakh|lac|\bl\b/.test(raw)) return Math.round(numeric * 100000);
  if (numeric > 0 && numeric < 1000) return Math.round(numeric * 100000);
  return Math.round(numeric);
}

export function parseArea(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const raw = text(value).toLowerCase();
  if (!raw) return 0;
  const numeric = Number.parseFloat(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric)) return 0;
  if (/cent/.test(raw)) return Math.round(numeric * 435.6);
  return Math.round(numeric);
}

function bool(value: unknown): boolean {
  const raw = text(value).toLowerCase();
  return ["true", "yes", "1", "y", "featured", "premium", "signature", "verified"].includes(raw);
}

function list(value: unknown): string[] {
  const raw = text(value);
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[\n,;|•]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 14);
}

function isoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" && value > 20000 && value < 80000) {
    // Google Sheets / Excel serial date
    return new Date(Math.round((value - 25569) * 86400 * 1000)).toISOString();
  }
  const raw = text(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString();
}

export function normalizeProperty(record: UnknownRecord, index = 0): Property {
  const map = normalizedMap(record);

  const city = text(pick(map, ["city", "town", "municipality"]));
  const landmark = text(
    pick(map, ["landmark", "locality", "location", "neighbourhood", "neighborhood", "area name"])
  );
  const district = text(pick(map, ["district", "region"]));
  const galleryValue = pick(map, [
    "gallery",
    "galleryurls",
    "galleryimages",
    "galleryimage",
    "imageurls",
    "imagegallery",
    "images",
    "photos",
    "propertyimages",
    "otherimages",
  ]);
  const imageValue = pick(map, [
    "cardimage",
    "cardimageurl",
    "cardimagelink",
    "imageurl",
    "imagelink",
    "propertyimage",
    "listingimage",
    "coverimage",
    "coverphoto",
    "image",
    "photourl",
    "photo",
    "picture",
    "pictureurl",
    "img",
    "thumbnail",
  ]);
  const images = resolveImages(
    text(imageValue) || undefined,
    text(galleryValue) || undefined
  );

  const name = text(pick(map, ["name", "propertyname", "project", "title", "projectname"]));
  const description = text(
    pick(map, ["description", "about", "details", "summary", "overview"])
  );

  return {
    id:
      text(pick(map, ["id", "propertyid", "ref", "reference", "code", "propertycode"])) ||
      `P${String(index + 1).padStart(3, "0")}`,
    name: name || "Kerala Residence",
    city: city || district || "Kerala",
    district: district || city || "Kerala",
    landmark: landmark || city || "Kerala",
    price: parsePrice(pick(map, ["price", "prize", "amount", "value", "cost", "budget"])),
    bedrooms: integer(pick(map, ["bedrooms", "beds", "bedroom", "bhk", "bed"])),
    bathrooms: integer(pick(map, ["bathrooms", "baths", "bathroom", "bath"])),
    areaSqft: parseArea(
      pick(map, ["areasqft", "area", "sqft", "squarefeet", "builtuparea", "carpetarea", "size"])
    ),
    propertyType:
      text(pick(map, ["propertytype", "type", "category", "configuration"])) || "Residence",
    imageUrl: images.imageUrl,
    gallery: images.gallery,
    keyFeatures: list(
      pick(map, ["keyfeatures", "features", "amenities", "highlights", "facilities"])
    ),
    description,
    status: text(pick(map, ["status", "possession", "availability", "constructionstatus"])) ||
      "Enquire for availability",
    featured: bool(pick(map, ["featured", "isfeatured", "showonhome", "homepage"])),
    premium: bool(pick(map, ["premium", "ispremium", "signature", "luxury"])),
    reraVerified: bool(pick(map, ["reraverified", "rera", "verified", "kvera"])),
    createdAt: isoDate(
      pick(map, ["createdat", "dateadded", "addedon", "created", "timestamp", "listeddate"])
    ),
  };
}

export function normalizeEnquiry(record: UnknownRecord, index = 0): Enquiry {
  const map = normalizedMap(record);
  const rowValue = pick(map, ["row", "rownumber", "sheetrow"]);
  const explicitId = text(pick(map, ["enquiryid", "leadid", "reference", "enquiryreference"]));
  const legacySheetRow = rowValue !== undefined && !explicitId;

  const createdAt = isoDate(
    pick(map, ["createdat", "date", "enquirydate", "timestamp", "submittedat"])
  );

  // The lightweight sheet bridge stores {row, id, name, phone, message, status}
  // where "id" is the *property* reference and "row" identifies the enquiry.
  if (legacySheetRow) {
    const row = text(rowValue) || String(index + 1);
    const rawMessage = text(
      pick(map, ["message", "notes", "note", "requirement", "comments"])
    );
    const isGeneral = /^\[general enquiry\]\s*/i.test(rawMessage);
    return {
      id: `ROW-${row}`,
      buyerName: text(pick(map, ["name", "buyername", "buyer", "fullname", "clientname"])) ||
        "Unnamed buyer",
      phone: text(pick(map, ["phone", "phonenumber", "mobile", "whatsapp", "contact"])),
      email: text(pick(map, ["email", "emailaddress", "mail"])),
      propertyId: isGeneral ? "" : text(pick(map, ["id"])),
      propertyName: text(pick(map, ["propertyname", "projectname"])),
      preferredLocation: text(
        pick(map, ["preferredlocation", "location", "preferredarea", "area"])
      ),
      budget: text(pick(map, ["budget", "pricerange", "budgetrange"])),
      propertyType: text(pick(map, ["propertytype", "type", "preferredpropertytype"])),
      bedrooms: text(pick(map, ["bedrooms", "bhk", "preferredbedrooms", "beds"])),
      message: rawMessage.replace(/^\[general enquiry\]\s*/i, ""),
      status: normalizeStatus(
        text(pick(map, ["status", "enquirystatus", "stage", "leadstatus"]))
      ),
      createdAt: createdAt || "",
      source: "website",
    };
  }

  const rawMessage = text(
    pick(map, ["message", "notes", "note", "requirement", "comments"])
  );
  const isGeneral = /^\[general enquiry\]\s*/i.test(rawMessage);

  return {
    id:
      text(pick(map, ["id", "enquiryid", "leadid", "reference"])) ||
      `ENQ-${String(index + 1).padStart(4, "0")}`,
    buyerName: text(pick(map, ["buyername", "name", "buyer", "fullname", "clientname"])) ||
      "Unnamed buyer",
    phone: text(pick(map, ["phone", "phonenumber", "mobile", "whatsapp", "contact"])),
    email: text(pick(map, ["email", "emailaddress", "mail"])),
    propertyId: isGeneral
      ? ""
      : text(pick(map, ["propertyid", "property", "propertyref", "projectid"])),
    propertyName: isGeneral
      ? ""
      : text(pick(map, ["propertyname", "projectname", "property"])),
    preferredLocation: text(
      pick(map, ["preferredlocation", "location", "preferredarea", "area"])
    ),
    budget: text(pick(map, ["budget", "price", "pricerange", "budgetrange"])),
    propertyType: text(pick(map, ["propertytype", "type", "preferredpropertytype"])),
    bedrooms: text(pick(map, ["bedrooms", "bhk", "preferredbedrooms", "beds"])),
    message: rawMessage.replace(/^\[general enquiry\]\s*/i, ""),
    status: normalizeStatus(text(pick(map, ["status", "enquirystatus", "stage", "leadstatus"]))),
    createdAt: createdAt || new Date().toISOString(),
    source: "website",
  };
}

export function normalizeStatus(value: string): EnquiryStatus {
  const raw = value.toLowerCase().trim();
  if (["contacted", "contact", "called", "follow up", "followup"].includes(raw)) {
    return "Contacted";
  }
  if (["interested", "in progress", "inprogress", "progress", "negotiation", "site visit"].includes(raw)) {
    return "Interested";
  }
  if (["closed", "won", "lost", "completed", "sold"].includes(raw)) {
    return "Closed";
  }
  return "New";
}

function payloadRows(payload: unknown): { rows: unknown[]; headers?: string[] } {
  if (Array.isArray(payload)) return { rows: payload };
  if (!payload || typeof payload !== "object") return { rows: [] };
  const obj = payload as UnknownRecord;
  if (obj.ok === true && obj.data !== undefined) return payloadRows(obj.data);
  if (Array.isArray(obj.rows)) {
    return {
      rows: obj.rows,
      headers: Array.isArray(obj.headers) ? obj.headers.map(String) : undefined,
    };
  }
  if (Array.isArray(obj.data)) return { rows: obj.data };
  if (Array.isArray(obj.properties)) return { rows: obj.properties };
  if (Array.isArray(obj.enquiries)) return { rows: obj.enquiries };
  return { rows: [] };
}

export function normalizePropertiesPayload(payload: unknown): Property[] {
  const { rows, headers } = payloadRows(payload);
  return rows
    .map((row, index) => normalizeProperty(toRecord(row, headers), index))
    .filter((property) => Boolean(property.id));
}

export function normalizeEnquiriesPayload(payload: unknown): Enquiry[] {
  const { rows, headers } = payloadRows(payload);
  return rows
    .map((row, index) => normalizeEnquiry(toRecord(row, headers), index))
    .filter((enquiry) => Boolean(enquiry.id));
}
