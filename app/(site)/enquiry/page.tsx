import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { EnquiryForm } from "@/components/enquiries/EnquiryForm";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { OFFICE_PHONE, OFFICE_PHONE_E164 } from "@/lib/constants";
import { formatCompactPrice } from "@/lib/format";
import { getPropertyById } from "@/lib/properties";
import { buildWhatsAppUrl, telHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Private buyer enquiry",
  description:
    "Share your preferred Kerala district, budget and configuration. A senior advisor will respond personally within one business day with a relevant shortlist.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function EnquiryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const propertyId = one(params.propertyId);
  const property = propertyId ? (await getPropertyById(propertyId)).property : null;

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-primary/[0.07] bg-primary">
        <div className="absolute inset-0 bg-grain opacity-20" aria-hidden="true" />
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-champagne/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="shell relative py-12 sm:py-16 lg:py-20">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50"
          >
            <Link href="/" className="transition-colors hover:text-secondary-fixed">
              Kerala Estates
            </Link>
            <span className="text-champagne">/</span>
            <span className="text-secondary-fixed">Private enquiry</span>
          </nav>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6 xl:col-span-7">
              <span className="eyebrow-light">
                <span className="inline-block h-px w-8 bg-current opacity-60" aria-hidden="true" />
                Begin privately · 2026 private index
              </span>
              <h1 className="mt-5 max-w-2xl font-serif text-[2.7rem] leading-[1.01] tracking-[-0.035em] text-white sm:text-[3.5rem] lg:text-[4rem]">
                Tell us how you want to live.
                <span className="block italic text-secondary-fixed">We&apos;ll find the address.</span>
              </h1>
              <p className="mt-5 max-w-xl font-sans text-[15px] leading-7 text-white/65">
                Whether you are relocating from Dubai, returning to Kochi or looking for a quiet
                backwater retreat, share a short brief. A named advisor will reply personally — not
                with a mass mailer.
              </p>

              {property ? (
                <div className="mt-8 flex flex-col gap-4 rounded-xl border border-secondary-fixed/20 bg-white/[0.06] p-4 backdrop-blur-md sm:flex-row sm:items-center">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg sm:w-36">
                    <PropertyImage
                      src={property.imageUrl}
                      alt={`${property.name} in ${property.city}`}
                      sizes="(max-width: 640px) 100vw, 144px"
                      showFallbackLabel={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-secondary-fixed">
                      Enquiring about
                    </p>
                    <p className="mt-1 font-serif text-[22px] leading-tight text-white">
                      {property.name}
                    </p>
                    <p className="mt-1 flex items-center gap-1 font-sans text-[11px] text-white/55">
                      <MapPin className="h-3 w-3 text-secondary-fixed" aria-hidden="true" />
                      {property.landmark}, {property.city}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 font-sans text-[10px] text-white/50">
                      <span>{property.bedrooms} BHK</span>
                      <span>{property.propertyType}</span>
                      <span className="text-secondary-fixed">
                        {formatCompactPrice(property.price)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/properties/${encodeURIComponent(property.id)}`}
                    className="inline-flex shrink-0 items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-secondary-fixed transition-colors hover:text-white"
                  >
                    View
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Clock3,
                    title: "One business day",
                    copy: "Personal reply, not an auto-responder",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Buyer-side only",
                    copy: "No dual agency, no listing fees",
                  },
                  {
                    icon: Sparkles,
                    title: "Off-market access",
                    copy: "Addresses before they are published",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-3.5"
                  >
                    <item.icon className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
                    <p className="mt-2 font-sans text-[11px] font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 font-sans text-[10px] leading-4 text-white/45">{item.copy}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/15 pt-5">
                <a
                  href={telHref(OFFICE_PHONE_E164)}
                  className="flex items-center gap-2 font-sans text-[12px] text-white/70 transition-colors hover:text-secondary-fixed"
                >
                  <Phone className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
                  {OFFICE_PHONE}
                </a>
                <a
                  href={buildWhatsAppUrl({
                    message:
                      "Hello Kerala Estates, I would like to share a private property brief with an advisor.",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-[12px] text-white/70 transition-colors hover:text-secondary-fixed"
                >
                  <MessageCircle className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
                  WhatsApp the desk
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 xl:col-span-5">
              <EnquiryForm
                property={
                  property
                    ? {
                        id: property.id,
                        name: property.name,
                        city: property.city,
                        landmark: property.landmark,
                        propertyType: property.propertyType,
                        bedrooms: property.bedrooms,
                        price: property.price,
                      }
                    : undefined
                }
                title={property ? `Enquire about ${property.name}` : "Share your private brief"}
                description={
                  property
                    ? "Your enquiry goes directly to the advisor responsible for this address."
                    : "A few details are enough to begin. Everything you share stays with the private desk."
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <span className="eyebrow">
              <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
              How the desk works
            </span>
            <h2 className="mt-3 font-serif text-[2rem] leading-[1.12] tracking-[-0.02em] text-primary sm:text-[2.4rem]">
              A short brief. A considered shortlist.
            </h2>
            <p className="mt-4 font-sans text-[14px] leading-7 text-on-surface-variant">
              We do not send every listing. We read your brief, check what is genuinely available,
              and introduce only the addresses worth your time.
            </p>
            <Link
              href="/properties"
              className="mt-6 inline-flex items-center gap-2 border-b border-champagne/50 pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:border-primary"
            >
              Browse the current index
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {[
              {
                step: "01",
                title: "Share the brief",
                copy: "District, budget, configuration and timing. NRI and POA requirements welcome.",
              },
              {
                step: "02",
                title: "A named advisor replies",
                copy: "One senior advisor reviews availability, title notes and viewing options.",
              },
              {
                step: "03",
                title: "Private shortlist",
                copy: "Three to five relevant addresses, including off-market homes where appropriate.",
              },
              {
                step: "04",
                title: "Viewing & diligence",
                copy: "Chauffeured inspections, video walk-throughs and document review at your pace.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-primary/[0.07] bg-surface-container-lowest p-5 shadow-ambient"
              >
                <span className="font-serif text-[22px] text-champagne">{item.step}</span>
                <h3 className="mt-2 font-serif text-[20px] leading-tight text-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 font-sans text-[12px] leading-6 text-on-surface-variant">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
