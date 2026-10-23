import "server-only";
import { callAppsScript, isAppsScriptConfigured } from "./apps-script";
import { MOCK_PROPERTIES } from "./mock-data";
import { normalizePropertiesPayload } from "./normalize";
import type { Property, PropertiesResult } from "./types";

function sortNewest(items: Property[]): Property[] {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

type PropertyAction = "list" | "properties";
let propertyAction: PropertyAction | null = null;

async function fetchPropertyPayload() {
  const candidates: PropertyAction[] =
    propertyAction === null ? ["list", "properties"] : [propertyAction];
  let lastError: unknown;

  for (const action of candidates) {
    try {
      const payload = await callAppsScript<unknown>({
        action,
        revalidateSeconds: 60,
      });
      propertyAction = action;
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function getProperties(): Promise<PropertiesResult> {
  if (!isAppsScriptConfigured()) {
    return {
      items: MOCK_PROPERTIES,
      source: "mock",
      warning:
        "Preview catalogue in use. Connect the Google Apps Script bridge to publish the live spreadsheet.",
    };
  }

  try {
    const payload = await fetchPropertyPayload();
    const items = normalizePropertiesPayload(payload);
    if (items.length === 0) {
      return {
        items: MOCK_PROPERTIES,
        source: "mock",
        warning:
          "The live sheet returned no property rows. Showing the preview catalogue until the sheet is populated.",
      };
    }
    return { items: sortNewest(items), source: "apps-script" };
  } catch (error) {
    console.error("[properties] Apps Script fetch failed:", error);
    return {
      items: MOCK_PROPERTIES,
      source: "mock",
      warning:
        "The live property bridge is temporarily unavailable. Showing the curated preview catalogue.",
    };
  }
}

export async function getPropertyById(id: string): Promise<{
  property: Property | null;
  source: PropertiesResult["source"];
  warning?: string;
}> {
  const result = await getProperties();
  const property =
    result.items.find((item) => item.id.toLowerCase() === id.toLowerCase()) || null;
  return { property, source: result.source, warning: result.warning };
}

export function getRelatedProperties(
  properties: Property[],
  current: Property,
  limit = 3
): Property[] {
  const scored = properties
    .filter((item) => item.id !== current.id)
    .map((item) => {
      let score = 0;
      if (item.city.toLowerCase() === current.city.toLowerCase()) score += 3;
      if (item.district.toLowerCase() === current.district.toLowerCase()) score += 2;
      if (item.propertyType.toLowerCase() === current.propertyType.toLowerCase()) score += 1;
      if (Math.abs(item.price - current.price) <= 2000000) score += 1;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price);
  return scored.slice(0, limit).map(({ item }) => item);
}

export function getCityCounts(properties: Property[]): { city: string; district: string; count: number; image: string }[] {
  const map = new Map<string, { city: string; district: string; count: number; image: string }>();
  for (const property of properties) {
    const key = property.city.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        city: property.city,
        district: property.district,
        count: 1,
        image: property.imageUrl,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
