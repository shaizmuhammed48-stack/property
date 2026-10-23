import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { PropertiesExplorer } from "@/components/properties/PropertiesExplorer";
import { getProperties } from "@/lib/properties";
import { formatCompactPrice } from "@/lib/format";
import type { PropertyFilters } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "The residence index",
  description:
    "Browse verified Kerala apartments, villas, penthouses and waterfront estates. Filter by district, city, bedrooms, bathrooms, property type and budget.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function parseSort(value: string): PropertyFilters["sort"] {
  const allowed = ["newest", "price-asc", "price-desc", "area-desc", "area-asc"] as const;
  return (allowed as readonly string[]).includes(value)
    ? (value as PropertyFilters["sort"])
    : "newest";
}

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { items, warning } = await getProperties();

  const prices = items.map((property) => property.price).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const districtCount = new Set(items.map((property) => property.district)).size;

  const initialFilters: PropertyFilters = {
    q: one(params.q),
    city: one(params.city),
    district: one(params.district),
    propertyType: one(params.type),
    bedrooms: one(params.bedrooms),
    bathrooms: one(params.bathrooms),
    minPrice: one(params.minPrice),
    maxPrice: one(params.maxPrice),
    sort: parseSort(one(params.sort)),
  };

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-primary/[0.07] bg-surface-container-low">
        <div className="absolute inset-0 bg-grain opacity-40" aria-hidden="true" />
        <div className="shell relative py-10 sm:py-14 lg:py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              Kerala Estates
            </Link>
            <span className="text-champagne">/</span>
            <span className="text-primary">The residence index</span>
            <span className="text-champagne">/</span>
            <span className="text-champagne-deep">2026 edition</span>
          </nav>

          <div className="mt-6 grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="eyebrow">
                <span className="inline-block h-px w-8 bg-current opacity-60" aria-hidden="true" />
                Kerala chapter · Private residence index
              </span>
              <h1 className="mt-4 max-w-3xl font-serif text-[2.6rem] leading-[1.02] tracking-[-0.03em] text-primary sm:text-[3.35rem]">
                Exclusive waterfront and city residences.
              </h1>
              <p className="mt-4 max-w-2xl font-sans text-[15px] leading-7 text-on-surface-variant">
                Architecturally considered homes across Kochi, Alappuzha, Trivandrum, Thrissur and
                Calicut — each visited by our Kerala desk before publication.
              </p>
            </div>

            <div className="lg:col-span-4">
              <div className="grid grid-cols-3 divide-x divide-primary/10 rounded-xl border border-primary/[0.08] bg-surface-container-lowest p-4 shadow-ambient">
                <div className="pr-3">
                  <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-outline">
                    Active catalogue
                  </p>
                  <p className="mt-1 font-serif text-[24px] leading-none text-primary">
                    {String(items.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="px-3">
                  <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-outline">
                    Price spectrum
                  </p>
                  <p className="mt-1 font-serif text-[17px] leading-tight text-champagne-deep">
                    {minPrice && maxPrice
                      ? `${formatCompactPrice(minPrice)} – ${formatCompactPrice(maxPrice)}`
                      : "On request"}
                  </p>
                </div>
                <div className="pl-3">
                  <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-outline">
                    Coverage
                  </p>
                  <p className="mt-1 font-serif text-[24px] leading-none text-primary">
                    {String(districtCount).padStart(2, "0")}
                    <span className="ml-1 font-sans text-[9px] uppercase tracking-[0.1em] text-outline">
                      dist.
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                <ShieldCheck className="h-3.5 w-3.5 text-champagne-deep" aria-hidden="true" />
                K-RERA authorised
                <Link
                  href="/enquiry"
                  className="ml-3 inline-flex items-center gap-1 text-champagne-deep transition-colors hover:text-primary"
                >
                  Request shortlist
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-8 sm:py-10 lg:py-12">
        <PropertiesExplorer
          properties={items}
          initialFilters={initialFilters}
          warning={warning}
        />
      </section>
    </div>
  );
}
