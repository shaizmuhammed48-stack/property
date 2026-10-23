"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/format";
import type { ApiResponse } from "@/lib/types";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let payload: ApiResponse<{ username: string }> | null = null;
      try {
        payload = (await response.json()) as ApiResponse<{ username: string }>;
      } catch {
        payload = null;
      }

      if (!response.ok || !payload || !payload.ok) {
        if (payload && !payload.ok) {
          setError(payload.error.message);
          setFieldErrors(payload.error.fields || {});
        } else {
          setError("The advisor desk could not be reached. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      router.replace("/admin/enquiries");
      router.refresh();
    } catch {
      setError("The connection was interrupted. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
      {!configured ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-champagne/35 bg-champagne/10 px-4 py-3 font-sans text-[11px] leading-5 text-champagne-deep"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Admin credentials are not configured. Add <code>ADMIN_USERNAME</code> and{" "}
            <code>ADMIN_PASSWORD_HASH</code> to <code>.env.local</code>.
          </span>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 font-sans text-[12px] leading-5 text-on-error-container"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div>
        <label htmlFor="admin-username" className="form-label">
          Advisor username
        </label>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
            aria-hidden="true"
          />
          <input
            id="admin-username"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={cn("input-field pl-10", fieldErrors.username && "border-error")}
            placeholder="admin"
            autoComplete="username"
            aria-invalid={Boolean(fieldErrors.username)}
            required
          />
        </div>
        {fieldErrors.username ? (
          <p className="mt-1 font-sans text-[11px] text-error" role="alert">
            {fieldErrors.username}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="admin-password" className="form-label">
          Password
        </label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
            aria-hidden="true"
          />
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={cn("input-field pl-10 pr-12", fieldErrors.password && "border-error")}
            placeholder="••••••••••"
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-outline transition-colors hover:bg-surface-container hover:text-primary"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="mt-1 font-sans text-[11px] text-error" role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting || !configured}
        className="btn-primary w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Opening the desk…
          </>
        ) : (
          <>
            Enter the advisor desk
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 font-sans text-[10px] text-outline">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Protected by a signed, HttpOnly session cookie
      </p>
    </form>
  );
}
