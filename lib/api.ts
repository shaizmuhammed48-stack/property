import { NextResponse } from "next/server";
import type { ApiFailure } from "./types";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status, headers: NO_STORE });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  fields?: Record<string, string>
) {
  const error: ApiFailure["error"] = { code, message };
  if (fields && Object.keys(fields).length > 0) error.fields = fields;
  return NextResponse.json(
    { ok: false as const, error },
    { status, headers: NO_STORE }
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function methodNotAllowed(allowed: string[]) {
  return NextResponse.json(
    {
      ok: false as const,
      error: {
        code: "method_not_allowed",
        message: `Method not allowed. Use ${allowed.join(", ")}.`,
      },
    },
    { status: 405, headers: { ...NO_STORE, Allow: allowed.join(", ") } }
  );
}
