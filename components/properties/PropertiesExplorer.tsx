"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  Filter,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { EmptyState } from "@/components/ui/States";
import { BEDROOM_OPTIONS, PRICE_BANDS, PROPERTIES_PER_PAGE } from "@/lib/constants";
import { cn } from "@/lib/format";
import type { Property, PropertyFilters } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "area-desc", label: "Area: largest first" },
  { value: "area-asc", label: "Area: smallest first" },
] as const;

function matches(property: Property, filters: PropertyFilters, q: string) {
  if (q) {
    const haystack = [
      property.name,
      property.city,
      property.district,
      property.landmark,
      property.propertyType,
      property.description,
      property.keyFeatures.join(" "),
      property.id,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q.toLowerCase())) return false;
  }
  if (filters.city && property.city.toLowerCase() !== filters.city.toLowerCase()) return false;
  if (filters.district && property.district.toLowerCase() !== filters.district.toLowerCase()) return false;
  if (filters.propertyType && property.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()) {
    return false;
  }
  if (filters.bedrooms) {
    if (filters.bedrooms === "5+") {
      if (property.bedrooms < 5) return false;
    } else if (property.bedrooms !== Number(filters.bedrooms)) {
      return false;
    }
  }
  if (filters.bathrooms && property.bathrooms < Number(filters.bathrooms)) return false;
  if (filters.minPrice && property.price < Number(filters.minPrice)) return false;
  if (filters.maxPrice && property.price > Number(filters.maxPrice)) return false;
  return true;
}

function sortProperties(properties: Property[], sort: PropertyFilters["sort"]) {
  const items = [...properties];
  switch (sort) {
    case "price-asc":
      return items.sort((a, b) => a.price - b.price);
    case "price-desc":
      return items.sort((a, b) => b.price - a.price);
    case "area-desc":
      return items.sort((a, b) => b.areaSqft - a.areaSqft);
    case "area-asc":
      return items.sort((a, b) => a.areaSqft - b.areaSqft);
    default:
      return items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

export function PropertiesExplorer({
  properties,
  initialFilters,
  warning,
}: {
  properties: Property[];
  initialFilters: PropertyFilters;
  warning?: string;
}) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PROPERTIES_PER_PAGE);
  const deferredQ = useDeferredValue(filters.q);

  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    properties.forEach((property) => {
      counts.set(property.city, (counts.get(property.city) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
  }, [properties]);

  const districts = useMemo(
    () => Array.from(new Set(properties.map((property) => property.district))).sort(),
    [properties]
  );

  const types = useMemo(
    () => Array.from(new Set(properties.map((property) => property.propertyType))).sort(),
    [properties]
  );

  const filtered = useMemo(() => {
    const result = properties.filter((property) => matches(property, filters, deferredQ));
    return sortProperties(result, filters.sort);
  }, [properties, filters, deferredQ]);

  useEffect(() => {
    setVisibleCount(PROPERTIES_PER_PAGE);
  }, [deferredQ, filters.city, filters.district, filters.propertyType, filters.bedrooms, filters.bathrooms, filters.minPrice, filters.maxPrice, filters.sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.city) params.set("city", filters.city);
    if (filters.district) params.set("district", filters.district);
    if (filters.propertyType) params.set("type", filters.propertyType);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.bathrooms) params.set("bathrooms", filters.bathrooms);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    const next = `${window.location.pathname}${params.size ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [filters]);

  function patch(next: Partial<PropertyFilters>) {
    setFilters((current) => ({ ...current, ...next }));
  }

  function reset() {
    setFilters({
      q: "",
      city: "",
      district: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    });
  }

  const activeCount = [
    filters.q,
    filters.city,
    filters.district,
    filters.propertyType,
    filters.bedrooms,
    filters.bathrooms,
    filters.minPrice || filters.maxPrice,
  ].filter(Boolean).length;

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      {/* Filter deck */}
      <div className="rounded-xl border border-primary/[0.07] bg-surface-container-lowest p-4 shadow-ambient sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search residences</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-champagne-deep" aria-hidden="true" />
            <input
              type="search"
              value={filters.q}
              onChange={(event) => patch({ q: event.target.value })}
              placeholder="Search city, landmark, project or feature…"
              className="input-field pl-11"
            />
          </label>

          <div className="flex items-center gap-2">
            <label className="relative flex-1 lg:w-56">
              <span className="sr-only">Sort residences</span>
              <ArrowDownUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
              <select
                value={filters.sort}
                onChange={(event) => patch({ sort: event.target.value as PropertyFilters["sort"] })}
                className="select-field pl-11 text-[13px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" aria-hidden="true" />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className={cn(
                "flex h-12 shrink-0 items-center gap-2 rounded-lg border px-4 font-sans text-[12px] font-semibold transition-colors",
                filtersOpen || activeCount > 0
                  ? "border-champagne/50 bg-champagne/10 text-primary"
                  : "border-primary/15 bg-surface-container-low text-on-surface-variant hover:border-primary/30"
              )}
              aria-expanded={filtersOpen}
              aria-controls="advanced-filters"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filters
              {activeCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-sans text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-primary/[0.07] pt-4">
          <span className="mr-1 font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-outline">
            Location
          </span>
          <button
            type="button"
            onClick={() => patch({ city: "" })}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-sans text-[11px] font-semibold transition-colors",
              !filters.city
                ? "bg-primary text-white"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            All residences
            <span className={cn("ml-1.5", filters.city ? "text-champagne-deep" : "text-white/60")}>
              ({properties.length})
            </span>
          </button>
          {cities.map((city) => (
            <button
              key={city.city}
              type="button"
              onClick={() =>
                patch({ city: filters.city === city.city ? "" : city.city })
              }
              className={cn(
                "rounded-full px-3.5 py-1.5 font-sans text-[11px] font-semibold transition-colors",
                filters.city === city.city
                  ? "bg-primary text-white"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {city.city}
              <span className="ml-1.5 text-champagne-deep">({city.count})</span>
            </button>
          ))}
        </div>

        <div
          id="advanced-filters"
          aria-hidden={!filtersOpen}
          className={cn(
            "grid gap-3 overflow-hidden transition-all duration-300",
            filtersOpen
              ? "mt-4 max-h-[600px] border-t border-primary/[0.07] pt-4 opacity-100"
              : "invisible max-h-0 opacity-0"
          )}
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <label>
              <span className="form-label">District</span>
              <div className="relative">
                <select
                  value={filters.district}
                  onChange={(event) => patch({ district: event.target.value })}
                  className="select-field h-11 text-[13px]"
                >
                  <option value="">All districts</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline" aria-hidden="true" />
              </div>
            </label>
            <label>
              <span className="form-label">Type</span>
              <div className="relative">
                <select
                  value={filters.propertyType}
                  onChange={(event) => patch({ propertyType: event.target.value })}
                  className="select-field h-11 text-[13px]"
                >
                  <option value="">All types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline" aria-hidden="true" />
              </div>
            </label>
            <label>
              <span className="form-label">Bedrooms</span>
              <div className="relative">
                <select
                  value={filters.bedrooms}
                  onChange={(event) => patch({ bedrooms: event.target.value })}
                  className="select-field h-11 text-[13px]"
                >
                  <option value="">Any</option>
                  {BEDROOM_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} BHK
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline" aria-hidden="true" />
              </div>
            </label>
            <label>
              <span className="form-label">Bathrooms</span>
              <div className="relative">
                <select
                  value={filters.bathrooms}
                  onChange={(event) => patch({ bathrooms: event.target.value })}
                  className="select-field h-11 text-[13px]"
                >
                  <option value="">Any</option>
                  {["1", "2", "3", "4", "5"].map((option) => (
                    <option key={option} value={option}>
                      {option}+ baths
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline" aria-hidden="true" />
              </div>
            </label>
            <label>
              <span className="form-label">Min price</span>
              <div className="relative">
                <select
                  value={filters.minPrice}
                  onChange={(event) => patch({ minPrice: event.target.value })}
                  className="select-field h-11 text-[13px]"
                >
                  <option value="">No minimum</option>
                  {PRICE_BANDS.filter((band) => band.min).map((band) => (
                    <option key={band.label} value={band.min}>
                      {band.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline" aria-hidden="true" />
              </div>
            </label>
            <label>
              <span className="form-label">Max price</span>
              <div className="relative">
                <select
                  value={filters.maxPrice}
                  onChange={(event) => patch({ maxPrice: event.target.value })}
                  className="select-field h-11 text-[13px]"
                >
                  <option value="">No maximum</option>
                  {PRICE_BANDS.filter((band) => band.max).map((band) => (
                    <option key={band.label} value={band.max}>
                      {band.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline" aria-hidden="true" />
              </div>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-sans text-[11px] text-on-surface-variant">
              <MapPin className="mr-1 inline h-3.5 w-3.5 text-champagne-deep" aria-hidden="true" />
              {filtered.length} of {properties.length} residences match these filters
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold text-champagne-deep transition-colors hover:text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset all filters
            </button>
          </div>
        </div>

        {activeCount > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-primary/[0.07] pt-4">
            {filters.q ? <ActiveChip label={`“${filters.q}”`} onRemove={() => patch({ q: "" })} /> : null}
            {filters.city ? <ActiveChip label={filters.city} onRemove={() => patch({ city: "" })} /> : null}
            {filters.district ? (
              <ActiveChip label={filters.district} onRemove={() => patch({ district: "" })} />
            ) : null}
            {filters.propertyType ? (
              <ActiveChip label={filters.propertyType} onRemove={() => patch({ propertyType: "" })} />
            ) : null}
            {filters.bedrooms ? (
              <ActiveChip
                label={`${filters.bedrooms} BHK`}
                onRemove={() => patch({ bedrooms: "" })}
              />
            ) : null}
            {filters.bathrooms ? (
              <ActiveChip
                label={`${filters.bathrooms}+ baths`}
                onRemove={() => patch({ bathrooms: "" })}
              />
            ) : null}
            {filters.minPrice || filters.maxPrice ? (
              <ActiveChip
                label="Custom budget"
                onRemove={() => patch({ minPrice: "", maxPrice: "" })}
              />
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="ml-1 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-outline transition-colors hover:text-primary"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      {warning ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-champagne/30 bg-champagne/10 px-4 py-3 font-sans text-[11px] leading-5 text-champagne-deep">
          <SlidersHorizontal className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{warning}</span>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
          {filtered.length === 0
            ? "No matching residences"
            : `Showing ${visible.length} of ${filtered.length} ${filtered.length === 1 ? "residence" : "residences"}`}
        </p>
        <span className="flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/70">
          <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
          RERA screened
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No residences match this brief"
            description="Try widening your budget, choosing a neighbouring district, or clearing the search phrase. Our desk can also source off-market addresses."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button type="button" onClick={reset} className="btn-primary">
                  Show all residences
                </button>
                <a href="/enquiry" className="btn-outline">
                  Ask the private desk
                </a>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((property, index) => (
              <PropertyCard key={property.id} property={property} priority={index < 3} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PROPERTIES_PER_PAGE)}
                className="btn-outline min-w-52"
              >
                Load more residences
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
            <p className="font-sans text-[11px] text-on-surface-variant">
              {hasMore
                ? `${filtered.length - visibleCount} more to view`
                : "You have reached the end of this collection"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-surface-container-low py-1 pl-3 pr-1.5 font-sans text-[11px] font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="flex h-5 w-5 items-center justify-center rounded-full text-outline transition-colors hover:bg-primary hover:text-white"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}
