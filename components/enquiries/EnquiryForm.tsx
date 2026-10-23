"use client";

import { useId, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  TriangleAlert,
  User,
} from "lucide-react";
import {
  BEDROOM_OPTIONS,
  PROPERTY_TYPES,
  WHATSAPP_NUMBER,
} from "@/lib/constants";
import { cn, formatCompactPrice } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { ApiResponse, Enquiry } from "@/lib/types";

type EnquiryProperty = {
  id: string;
  name: string;
  city: string;
  landmark: string;
  propertyType: string;
  bedrooms: number;
  price: number;
};

type FormState = {
  buyerName: string;
  phone: string;
  email: string;
  preferredLocation: string;
  budget: string;
  propertyType: string;
  bedrooms: string;
  message: string;
};

type SuccessState = {
  enquiry: Enquiry;
  duplicate: boolean;
};

const QUICK_MESSAGES = [
  "Is it available for immediate possession?",
  "Please share the floor plan and brochure.",
  "What are the EMI and payment options?",
  "I would like to book a private viewing.",
];

function initialState(property?: EnquiryProperty): FormState {
  return {
    buyerName: "",
    phone: "",
    email: "",
    preferredLocation: property
      ? [property.landmark, property.city].filter(Boolean).join(", ")
      : "",
    budget: property && property.price ? formatCompactPrice(property.price) : "",
    propertyType: property?.propertyType || "",
    bedrooms:
      property && property.bedrooms ? String(Math.min(5, property.bedrooms)) : "",
    message: "",
  };
}

export function EnquiryForm({
  property,
  className,
  compact = false,
  title,
  description,
  submitLabel,
}: {
  property?: EnquiryProperty;
  className?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const [form, setForm] = useState<FormState>(() => initialState(property));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const propertyTypes = useMemo(
    () =>
      Array.from(
        new Set([
          ...PROPERTY_TYPES,
          ...(property?.propertyType ? [property.propertyType] : []),
        ])
      ),
    [property?.propertyType]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    if (formError) setFormError("");
  }

  function chooseQuickMessage(message: string) {
    update("message", form.message === message ? "" : message);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setErrors({});
    setFormError("");

    const localErrors: Record<string, string> = {};
    if (!form.buyerName.trim()) localErrors.buyerName = "Please share your name.";
    const digits = form.phone.replace(/[^\d]/g, "");
    if (!form.phone.trim()) {
      localErrors.phone = "A phone number is required.";
    } else if (digits.length < 10 || digits.length > 15) {
      localErrors.phone = "Enter a valid phone number with 10–15 digits.";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      localErrors.email = "Enter a valid email address.";
    }
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      setFormError("Please correct the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, propertyId: property?.id || "" }),
      });

      let payload: ApiResponse<SuccessState> | null = null;
      try {
        payload = (await response.json()) as ApiResponse<SuccessState>;
      } catch {
        payload = null;
      }

      if (!response.ok || !payload || !payload.ok) {
        if (payload && !payload.ok) {
          setErrors(payload.error.fields || {});
          setFormError(payload.error.message);
        } else {
          setFormError(
            "We could not send the enquiry just now. Please try again or reach us on WhatsApp."
          );
        }
        return;
      }

      setSuccess(payload.data);
      setForm(initialState(property));
    } catch {
      setFormError(
        "The connection was interrupted. Please check your network and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const reference = success.enquiry.id;
    return (
      <div
        className={cn(
          "enquiry-success-card rounded-xl border border-primary/[0.07] bg-surface-container-lowest p-6 shadow-ambient sm:p-8",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-serif text-[1.75rem] leading-tight text-primary">
          {success.duplicate ? "Already with the private desk." : "Your brief is with the desk."}
        </h3>
        <p className="mt-2 font-sans text-sm leading-7 text-on-surface-variant">
          {success.duplicate
            ? "We received this enquiry recently, so there is no need to send it again. An advisor will be in touch on the number provided."
            : "Thank you — a senior Kerala advisor will respond within one business day with a short, relevant shortlist."}
        </p>
        <dl className="mt-5 grid gap-3 rounded-lg bg-surface-container-low p-4 sm:grid-cols-2">
          <div>
            <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-outline">
              Reference
            </dt>
            <dd className="mt-1 font-sans text-[13px] font-semibold text-primary">{reference}</dd>
          </div>
          <div>
            <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-outline">
              {property ? "Residence" : "Preferred location"}
            </dt>
            <dd className="mt-1 font-sans text-[13px] font-semibold text-primary">
              {property?.name || success.enquiry.preferredLocation || "Kerala"}
            </dd>
          </div>
        </dl>
        <div className="enquiry-success-actions">
          <a
            href={buildWhatsAppUrl({
              phone: WHATSAPP_NUMBER,
              message: `Hello Kerala Estates, I have just sent enquiry ${reference}${
                property ? ` about ${property.name}` : ""
              }. I would like to speak with an advisor.`,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Continue on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="btn-outline"
          >
            Send another enquiry
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "rounded-xl border border-primary/[0.07] bg-surface-container-lowest shadow-ambient",
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8",
        className
      )}
      aria-label={property ? `Enquire about ${property.name}` : "Private buyer enquiry"}
    >
      <div>
        <span className="eyebrow">
          <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
          {property ? "Private viewing request" : "Private buyer brief"}
        </span>
        <h2 className="mt-3 font-serif text-[1.7rem] leading-[1.15] tracking-[-0.02em] text-primary sm:text-[2rem]">
          {title || (property ? `Enquire about ${property.name}` : "Tell us what you are looking for.")}
        </h2>
        <p className="mt-2 font-sans text-[13px] leading-6 text-on-surface-variant">
          {description ||
            "Share a few details and a senior advisor will respond personally within one business day. No mass mailers, no third parties."}
        </p>
      </div>

      {property ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-champagne/25 bg-champagne/10 px-4 py-3">
          <div>
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-champagne-deep">
              Enquiry reference
            </p>
            <p className="mt-0.5 font-sans text-[13px] font-semibold text-primary">
              {property.id} · {property.name}
            </p>
          </div>
          <span className="font-serif text-[18px] text-champagne-deep">
            {formatCompactPrice(property.price)}
          </span>
        </div>
      ) : null}

      {formError ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-error/20 bg-error-container/40 px-4 py-3 font-sans text-[12px] leading-5 text-on-error-container"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor={`${uid}-name`} error={errors.buyerName} required>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
              aria-hidden="true"
            />
            <input
              id={`${uid}-name`}
              name="buyerName"
              value={form.buyerName}
              onChange={(event) => update("buyerName", event.target.value)}
              className={cn("input-field pl-10", errors.buyerName && "border-error")}
              placeholder="e.g. Somanathan Pillai"
              autoComplete="name"
              aria-invalid={Boolean(errors.buyerName)}
              aria-describedby={errors.buyerName ? `${uid}-name-error` : undefined}
              required
            />
          </div>
        </Field>

        <Field label="Phone / WhatsApp" htmlFor={`${uid}-phone`} error={errors.phone} required>
          <div className="relative flex">
            <span className="inline-flex h-12 items-center rounded-l-lg border border-r-0 border-primary/15 bg-surface-container px-3 font-sans text-[13px] font-semibold text-primary">
              +91
            </span>
            <Phone
              className="pointer-events-none absolute left-[52px] top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
              aria-hidden="true"
            />
            <input
              id={`${uid}-phone`}
              name="phone"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              className={cn(
                "input-field rounded-l-none pl-10",
                errors.phone && "border-error"
              )}
              placeholder="98470 12345"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
              required
            />
          </div>
        </Field>

        <Field label="Email address" htmlFor={`${uid}-email`} error={errors.email} hint="Optional">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
              aria-hidden="true"
            />
            <input
              id={`${uid}-email`}
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              className={cn("input-field pl-10", errors.email && "border-error")}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${uid}-email-error` : undefined}
            />
          </div>
        </Field>

        <Field label="Preferred location" htmlFor={`${uid}-location`} error={errors.preferredLocation}>
          <input
            id={`${uid}-location`}
            name="preferredLocation"
            value={form.preferredLocation}
            onChange={(event) => update("preferredLocation", event.target.value)}
            className={cn("input-field", errors.preferredLocation && "border-error")}
            placeholder="e.g. Punnamada, Alappuzha"
            autoComplete="address-level2"
          />
        </Field>

        <Field label="Budget" htmlFor={`${uid}-budget`} error={errors.budget}>
          <input
            id={`${uid}-budget`}
            name="budget"
            value={form.budget}
            onChange={(event) => update("budget", event.target.value)}
            className={cn("input-field", errors.budget && "border-error")}
            placeholder="e.g. ₹75L – ₹1 Cr"
          />
        </Field>

        <Field label="Property type" htmlFor={`${uid}-type`} error={errors.propertyType}>
          <select
            id={`${uid}-type`}
            name="propertyType"
            value={form.propertyType}
            onChange={(event) => update("propertyType", event.target.value)}
            className={cn("select-field", errors.propertyType && "border-error")}
          >
            <option value="">Any property type</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Bedrooms" htmlFor={`${uid}-bedrooms`} error={errors.bedrooms}>
          <select
            id={`${uid}-bedrooms`}
            name="bedrooms"
            value={form.bedrooms}
            onChange={(event) => update("bedrooms", event.target.value)}
            className={cn("select-field", errors.bedrooms && "border-error")}
          >
            <option value="">Any configuration</option>
            {BEDROOM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} BHK
              </option>
            ))}
          </select>
        </Field>

        <div className="hidden sm:block" aria-hidden="true" />
      </div>

      <div className="mt-4">
        <label
          htmlFor={`${uid}-message`}
          className="form-label"
        >
          Your requirements
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={compact ? 3 : 4}
          maxLength={1200}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          className={cn("textarea-field resize-y", errors.message && "border-error")}
          placeholder="Tell us about the home you have in mind — timing, NRI requirements, must-have features…"
          aria-invalid={Boolean(errors.message)}
        />
        <div className="mt-1 flex items-center justify-between font-sans text-[10px] text-outline">
          <span>Optional</span>
          <span>{form.message.length}/1200</span>
        </div>
      </div>

      <div className="mt-3">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-outline">
          Quick questions
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_MESSAGES.map((message) => {
            const active = form.message === message;
            return (
              <button
                key={message}
                type="button"
                onClick={() => chooseQuickMessage(message)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-left font-sans text-[11px] leading-4 transition-colors",
                  active
                    ? "border-champagne bg-champagne/20 text-primary"
                    : "border-primary/10 bg-surface-container-low text-on-surface-variant hover:border-champagne/50 hover:text-primary"
                )}
              >
                {message}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary mt-6 w-full"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending to the private desk…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" />
            {submitLabel || (property ? "Request a private viewing" : "Send my private brief")}
          </>
        )}
      </button>

      <p className="mt-3 text-center font-sans text-[10px] leading-5 text-outline">
        By sending this enquiry you agree to be contacted by the Kerala Estates private desk.
        Your details are never sold or shared with third-party marketers.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="form-label">
        {label}
        {required ? <span className="ml-0.5 text-champagne-deep">*</span> : null}
        {hint ? <span className="ml-1 font-normal normal-case tracking-normal text-outline">({hint})</span> : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          className="mt-1 font-sans text-[11px] font-medium text-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
