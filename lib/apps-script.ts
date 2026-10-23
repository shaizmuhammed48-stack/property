import "server-only";
import type { ApiResponse } from "./types";

const BASE_URL = (process.env.GOOGLE_APPS_SCRIPT_URL || "").trim();
const ADMIN_TOKEN = (process.env.GOOGLE_APPS_SCRIPT_ADMIN_TOKEN || "").trim();

export class AppsScriptError extends Error {
  code: string;
  constructor(message: string, code = "apps_script_error") {
    super(message);
    this.name = "AppsScriptError";
    this.code = code;
  }
}

export function isAppsScriptConfigured() {
  return Boolean(BASE_URL);
}

export function isAdminTokenConfigured() {
  return Boolean(ADMIN_TOKEN);
}

export function getSpreadsheetId() {
  return (process.env.GOOGLE_SHEETS_ID || "").trim();
}

type CallOptions = {
  action: string;
  id?: string;
  admin?: boolean;
  method?: "GET" | "POST";
  body?: unknown;
  /** Cache public reads for this many seconds (0 keeps the request dynamic). */
  revalidateSeconds?: number;
};

export async function callAppsScript<T>({
  action,
  id,
  admin = false,
  method = "GET",
  body,
  revalidateSeconds = 0,
}: CallOptions): Promise<T> {
  if (!BASE_URL) {
    throw new AppsScriptError(
      "Google Apps Script bridge is not configured. Set GOOGLE_APPS_SCRIPT_URL.",
      "not_configured"
    );
  }

  if (admin && !ADMIN_TOKEN) {
    throw new AppsScriptError(
      "Google Apps Script admin token is not configured. Set GOOGLE_APPS_SCRIPT_ADMIN_TOKEN.",
      "admin_not_configured"
    );
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("action", action);
  if (id) url.searchParams.set("id", id);
  // Apps Script web apps do not expose custom request headers to doGet/doPost,
  // so authenticated reads include the shared token server-to-server. Admin
  // writes use a POST body instead, keeping the token out of the URL.
  if (admin && ADMIN_TOKEN && method === "GET") {
    url.searchParams.set("adminToken", ADMIN_TOKEN);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (method === "POST") headers["Content-Type"] = "application/json";
  if (admin && ADMIN_TOKEN) headers.Authorization = `Bearer ${ADMIN_TOKEN}`;

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body:
        method === "POST"
          ? JSON.stringify({
              action,
              ...(body as object),
              ...(admin && ADMIN_TOKEN ? { adminToken: ADMIN_TOKEN } : {}),
            })
          : undefined,
      ...(revalidateSeconds > 0
        ? { next: { revalidate: revalidateSeconds } }
        : { cache: "no-store" as RequestCache }),
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new AppsScriptError(
      error instanceof Error
        ? `Could not reach the property bridge: ${error.message}`
        : "Could not reach the property bridge.",
      "network_error"
    );
  }

  const raw = await response.text();
  let payload: ApiResponse<T>;
  try {
    payload = JSON.parse(raw) as ApiResponse<T>;
  } catch {
    throw new AppsScriptError(
      `The property bridge returned an invalid response (HTTP ${response.status}).`,
      "invalid_response"
    );
  }

  if (!payload || typeof payload !== "object" || !("ok" in payload)) {
    throw new AppsScriptError("The property bridge returned an unexpected payload.", "invalid_payload");
  }

  if (!payload.ok) {
    throw new AppsScriptError(
      payload.error?.message || "The property bridge rejected the request.",
      payload.error?.code || "apps_script_error"
    );
  }

  // Most bridges wrap results in { ok, data }, but the lightweight sheet
  // bridge sometimes returns { ok, row } / { ok, updated } directly.
  const data = (payload as { data?: unknown }).data;
  return (data !== undefined ? data : payload) as T;
}
