import { apiOk } from "@/lib/api";
import { getProperties } from "@/lib/properties";

export const dynamic = "force-dynamic";

export async function GET() {
  const { items, source, warning } = await getProperties();
  return apiOk({
    properties: items,
    count: items.length,
    source,
    warning: warning || null,
  });
}
