"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Heart,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { cn, formatCompactPrice, formatINR } from "@/lib/format";
import { buildWhatsAppUrl, propertyWhatsAppMessage } from "@/lib/whatsapp";
import type { Property } from "@/lib/types";

const SAVED_KEY = "ke_saved_properties";

export function PropertyCard({
  property,
  priority = false,
  className,
}: {
  property: Property;
  priority?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const href = `/properties/${encodeURIComponent(property.id)}`;
  const location = [property.landmark, property.city].filter(Boolean).join(", ");

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]") as string[];
      setSaved(stored.includes(property.id));
    } catch {
      setSaved(false);
    }
  }, [property.id]);

  function toggleSaved() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]") as string[];
      const next = stored.includes(property.id)
        ? stored.filter((id) => id !== property.id)
        : [...stored, property.id];
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(next.includes(property.id));
    } catch {
      setSaved((value) => !value);
    }
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-primary/[0.07] bg-surface-container-lowest shadow-ambient transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-lift",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
        <Link href={href} aria-label={`View ${property.name}`} className="absolute inset-0 z-10">
          <span className="sr-only">View {property.name}</span>
        </Link>
        <PropertyImage
          src={property.imageUrl}
          alt={`${property.name} — ${location}`}
          priority={priority}
          className="transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/15 to-black/10"
          aria-hidden="true"
        />

        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          {property.premium ? (
            <span className="rounded-full border border-secondary-fixed/35 bg-primary/65 px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-secondary-fixed backdrop-blur-md">
              Signature
            </span>
          ) : null}
          {property.reraVerified ? (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.12em] text-primary backdrop-blur-md">
              <ShieldCheck className="h-3 w-3 text-champagne-deep" aria-hidden="true" />
              RERA
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={toggleSaved}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${property.name} from shortlist` : `Save ${property.name} to shortlist`}
          className={cn(
            "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:text-error",
            saved && "text-error"
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} aria-hidden="true" />
        </button>

        <div className="absolute inset-x-4 bottom-3 z-20 flex items-end justify-between gap-3 text-white">
          <div>
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-secondary-fixed">
              Offered at
            </span>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
              <span className="font-serif text-[26px] leading-none text-white">
                {formatCompactPrice(property.price)}
              </span>
              {property.price ? (
                <span className="font-sans text-[10px] text-white/70">({formatINR(property.price)})</span>
              ) : null}
            </div>
          </div>
          <span className="rounded bg-primary/55 px-2 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm">
            {property.propertyType}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="flex items-center gap-1.5 font-sans text-[12px] text-on-surface-variant">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-champagne-deep" aria-hidden="true" />
          <span className="line-clamp-1">{location}</span>
        </p>
        <h3 className="mt-1.5 font-serif text-[24px] leading-tight tracking-[-0.015em] text-primary transition-colors group-hover:text-champagne-deep">
          <Link href={href}>{property.name}</Link>
        </h3>
        {property.description ? (
          <p className="mt-2 line-clamp-2 font-sans text-[13px] leading-6 text-on-surface-variant">
            {property.description}
          </p>
        ) : (
          <p className="mt-2 font-sans text-[13px] leading-6 text-on-surface-variant/70">
            Full particulars and floor plans available through the private desk.
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 divide-x divide-outline-variant/50 rounded-lg bg-surface-container-low py-2.5 text-center">
          <div className="flex flex-col items-center gap-1 px-1">
            <BedDouble className="h-4 w-4 text-champagne-deep" aria-hidden="true" />
            <span className="font-sans text-[11px] font-bold text-primary">
              {property.bedrooms || "—"} BHK
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 px-1">
            <Bath className="h-4 w-4 text-champagne-deep" aria-hidden="true" />
            <span className="font-sans text-[11px] font-bold text-primary">
              {property.bathrooms || "—"} Bath
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 px-1">
            <Ruler className="h-4 w-4 text-champagne-deep" aria-hidden="true" />
            <span className="font-sans text-[11px] font-bold text-primary">
              {property.areaSqft ? `${new Intl.NumberFormat("en-IN").format(property.areaSqft)} sq.ft` : "—"}
            </span>
          </div>
        </div>

        {property.keyFeatures.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.keyFeatures.slice(0, 3).map((feature) => (
              <span key={feature} className="chip-soft">
                {feature}
              </span>
            ))}
            {property.keyFeatures.length > 3 ? (
              <span className="chip-soft text-champagne-deep">+{property.keyFeatures.length - 3}</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Link
            href={href}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-sans text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            View residence
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={buildWhatsAppUrl({
              message: propertyWhatsAppMessage(property.name, property.id, location),
            })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enquire about ${property.name} on WhatsApp`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary transition-colors hover:bg-champagne/25"
          >
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
