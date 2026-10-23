"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, MapPin, Search, SlidersHorizontal } from "lucide-react";
import {
  BEDROOM_OPTIONS,
  DISTRICTS,
  PRICE_BANDS,
  PROPERTY_TYPES,
} from "@/lib/constants";

export function HeroSearch({
  districts = [...DISTRICTS],
  types = [...PROPERTY_TYPES],
}: {
  districts?: string[];
  types?: string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [budgetIndex, setBudgetIndex] = useState("0");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (district) params.set("district", district);
    if (propertyType) params.set("type", propertyType);
    if (bedrooms) params.set("bedrooms", bedrooms);
    const band = PRICE_BANDS[Number(budgetIndex)] || PRICE_BANDS[0];
    if (band.min) params.set("minPrice", band.min);
    if (band.max) params.set("maxPrice", band.max);
    router.push(`/properties${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="relative rounded-xl border border-white/50 bg-surface-container-lowest/95 p-4 shadow-modal backdrop-blur-xl sm:p-5 lg:p-6"
      aria-label="Search Kerala residences"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-champagne/15 text-champagne-deep">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Find your Kerala address
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setQ("");
            setDistrict("");
            setPropertyType("");
            setBedrooms("");
            setBudgetIndex("0");
          }}
          className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-outline transition-colors hover:text-primary"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search by city, district, landmark or project</span>
          <MapPin
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne-deep"
            aria-hidden="true"
          />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="input-field h-12 pl-11"
            placeholder="City, landmark or project — e.g. Punnamada"
            type="search"
          />
        </label>
        <button type="submit" className="btn-primary h-12 shrink-0 px-6 sm:px-7">
          <Search className="h-4 w-4" aria-hidden="true" />
          Search residences
        </button>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <label className="relative">
          <span className="sr-only">District</span>
          <select
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            className="select-field h-11 bg-surface-container-low text-[13px]"
          >
            <option value="">All districts</option>
            {districts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Chevron />
        </label>
        <label className="relative">
          <span className="sr-only">Property type</span>
          <select
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
            className="select-field h-11 bg-surface-container-low text-[13px]"
          >
            <option value="">All property types</option>
            {types.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Chevron />
        </label>
        <label className="relative">
          <span className="sr-only">Bedrooms</span>
          <select
            value={bedrooms}
            onChange={(event) => setBedrooms(event.target.value)}
            className="select-field h-11 bg-surface-container-low text-[13px]"
          >
            <option value="">Any bedrooms</option>
            {BEDROOM_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item} BHK
              </option>
            ))}
          </select>
          <Chevron />
        </label>
        <label className="relative">
          <span className="sr-only">Budget</span>
          <select
            value={budgetIndex}
            onChange={(event) => setBudgetIndex(event.target.value)}
            className="select-field h-11 bg-surface-container-low text-[13px]"
          >
            {PRICE_BANDS.map((band, index) => (
              <option key={band.label} value={index}>
                {band.label}
              </option>
            ))}
          </select>
          <Chevron />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 font-sans text-[11px] text-on-surface-variant">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-outline">Popular</span>
        {[
          { label: "Kochi waterfront", href: "/properties?city=Kochi" },
          { label: "Alappuzha backwaters", href: "/properties?city=Alappuzha" },
          { label: "Signature homes", href: "/properties?sort=price-desc" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="group inline-flex items-center gap-1 rounded-full border border-primary/10 bg-white px-2.5 py-1 transition-colors hover:border-champagne/50 hover:text-primary"
          >
            {item.label}
            <ArrowRight className="h-3 w-3 text-champagne-deep transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </form>
  );
}

function Chevron() {
  return (
    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
