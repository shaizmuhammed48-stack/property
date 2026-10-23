const DEFAULT_IMAGE_HOSTS = [
  "lh3.googleusercontent.com",
  "lh4.googleusercontent.com",
  "lh5.googleusercontent.com",
  "lh6.googleusercontent.com",
  "images.unsplash.com",
  "res.cloudinary.com",
  "drive.google.com",
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "i.imgur.com",
];

function allowedHosts(): Set<string> {
  const extra = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_IMAGE_HOSTS, ...extra]);
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return true;
  if (/^127\./.test(host) || host === "0.0.0.0" || host === "::1") return true;
  if (/^10\./.test(host) || /^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  return false;
}

/**
 * Sheets often store pictures as `=IMAGE("https://…")`, plain URLs, or
 * `=HYPERLINK("…","view")`. Pull the first usable http(s) URL out of whatever
 * the cell actually contains.
 */
function extractUrlCandidate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const formula = trimmed.match(/(?:IMAGE|HYPERLINK)\s*\(\s*["']([^"']+)["']/i);
  const candidate = formula ? formula[1] : trimmed;

  if (/^\/\//.test(candidate)) return `https:${candidate}`;
  if (/^https?:\/\//i.test(candidate)) return candidate;

  // Last resort: a URL surrounded by labels or whitespace.
  const embedded = candidate.match(/https?:\/\/[^\s"'<>]+/i);
  return embedded ? embedded[0] : null;
}

/**
 * Accepts only http(s) image URLs, converts common Google Drive / Docs share
 * links, and rejects localhost/private-network addresses.
 */
export function validateImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const value = extractUrlCandidate(String(raw));
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (isPrivateHost(url.hostname)) return null;

    if (url.hostname === "drive.google.com" || url.hostname === "docs.google.com") {
      const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      const id = fileMatch?.[1] || url.searchParams.get("id");
      if (id && /^[\w-]+$/.test(id)) {
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
      }
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function isNextImageHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return allowedHosts().has(host) && host !== "drive.google.com";
  } catch {
    return false;
  }
}

export function splitImageList(raw?: string | null): string[] {
  if (!raw) return [];
  return String(raw)
    .split(/[\n|]+/)
    .flatMap((part) => part.split(/,\s*(?=https?:\/\/)/i))
    .map((part) => validateImageUrl(part))
    .filter((value): value is string => Boolean(value));
}

export function resolveImages(primary?: string | null, gallery?: string | null): {
  imageUrl: string;
  gallery: string[];
} {
  const galleryUrls = splitImageList(gallery);
  const primaryUrl = validateImageUrl(primary);
  const all = [...(primaryUrl ? [primaryUrl] : []), ...galleryUrls];
  const unique = Array.from(new Set(all));
  return {
    imageUrl: unique[0] || "",
    gallery: unique,
  };
}
