import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Landmark,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { EnquiryForm } from "@/components/enquiries/EnquiryForm";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { OFFICE_PHONE, OFFICE_PHONE_E164 } from "@/lib/constants";
import {
  formatArea,
  formatCompactPrice,
  formatINR,
} from "@/lib/format";
import { getProperties, getPropertyById, getRelatedProperties } from "@/lib/properties";
import { buildWhatsAppUrl, propertyWhatsAppMessage, telHref } from "@/lib/whatsapp";
import type { Property } from "@/lib/types";

export const revalidate = 60;

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { property } = await getPropertyById(decodeURIComponent(id));
  if (!property) {
    return { title: "Residence not found", robots: { index: false, follow: false } };
  }
  const location = [property.landmark, property.city, property.district]
    .filter(Boolean)
    .join(", ");
  const description =
    property.description ||
    `${property.propertyType} in ${location} — ${property.bedrooms} bedrooms, ${formatArea(
      property.areaSqft
    )}. ${formatCompactPrice(property.price)}. Enquire through the Kerala Estates private desk.`;
  return {
    title: `${property.name} — ${property.city}`,
    description,
    openGraph: {
      title: `${property.name} — ${property.city} | Kerala Estates`,
      description,
      images: property.imageUrl ? [{ url: property.imageUrl }] : undefined,
    },
  };
}

function estimateMonthlyEmi(price: number): number {
  if (!price) return 0;
  const principal = price * 0.8;
  const monthlyRate = 0.085 / 12;
  const months = 20 * 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

function advisorFor(property: Property) {
  if (property.district === "Alappuzha") {
    return {
      name: "Rahul Nair",
      initials: "RN",
      role: "Senior Kerala Waterfront Advisor",
      note: "Specialising in Punnamada and Vembanad coastal homes, with private boat-transfer inspections.",
    };
  }
  if (property.district === "Kozhikode") {
    return {
      name: "Priya Nair",
      initials: "PN",
      role: "Malabar Coast Property Advisor",
      note: "Advising on Calicut penthouses, seafront land title and NRI purchase structures.",
    };
  }
  return {
    name: "Mathew Dominic",
    initials: "MD",
    role: "Senior Kerala Residence Advisor",
    note: "Advising on Kochi city residences, RERA due diligence and family relocation timelines.",
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const { property, warning } = await getPropertyById(decoded);

  if (!property) notFound();

  const { items } = await getProperties();
  const related = getRelatedProperties(items, property, 3);
  const advisor = advisorFor(property);
  const location = [property.landmark, property.city].filter(Boolean).join(", ");
  const fullLocation = [property.landmark, property.city, property.district, "Kerala"]
    .filter(Boolean)
    .join(", ");
  const mapQuery = encodeURIComponent(fullLocation);
  const emi = estimateMonthlyEmi(property.price);
  const galleryExtra = property.gallery.slice(1, 3);

  return (
    <div className="bg-background pb-24 lg:pb-0">
      <div className="shell pt-5 sm:pt-7">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
        >
          <Link href="/" className="transition-colors hover:text-primary">
            Kerala Estates
          </Link>
          <span className="text-champagne">/</span>
          <Link href="/properties" className="transition-colors hover:text-primary">
            The residence index
          </Link>
          <span className="text-champagne">/</span>
          <span className="text-champagne-deep">{property.name}</span>
        </nav>

        {warning ? (
          <p className="mt-4 rounded-lg border border-champagne/30 bg-champagne/10 px-4 py-2.5 font-sans text-[11px] leading-5 text-champagne-deep">
            {warning}
          </p>
        ) : null}
      </div>

      <section className="shell mt-5 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <PropertyGallery
            id={property.id}
            name={property.name}
            imageUrl={property.imageUrl}
            gallery={property.gallery}
            reraVerified={property.reraVerified}
            premium={property.premium}
          />

          <div className="mt-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-champagne-deep">
                Ref: {property.id} · {property.premium ? "Signature collection" : "Private index"}
              </span>
              <span className="rounded-full border border-primary/10 bg-surface-container-low px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                {property.status}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-[2.45rem] leading-[1.03] tracking-[-0.03em] text-primary sm:text-[3.3rem]">
              {property.name}
            </h1>
            <p className="mt-3 flex items-start gap-1.5 font-sans text-[13px] leading-6 text-on-surface-variant">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" aria-hidden="true" />
              <span>
                {location}
                {property.district && property.district !== property.city ? (
                  <span className="text-outline"> · {property.district} district</span>
                ) : null}
              </span>
            </p>

            <div className="mt-5 flex flex-col gap-4 rounded-xl border border-primary/[0.07] bg-surface-container-lowest p-5 shadow-ambient sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-outline">
                  Guide price
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="font-serif text-[2rem] leading-none text-primary">
                    {formatINR(property.price)}
                  </span>
                  {property.price ? (
                    <span className="font-sans text-[12px] text-on-surface-variant">
                      ({formatCompactPrice(property.price)})
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-champagne-deep">
                  Indicative EMI
                </span>
                <p className="mt-1 font-serif text-[22px] text-champagne-deep">
                  {emi ? `${formatINR(emi)}/mo` : "On request"}
                </p>
                <p className="font-sans text-[9px] text-outline">
                  80% loan · 8.5% · 20 years
                </p>
              </div>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              {
                icon: BedDouble,
                label: "Bedrooms",
                value: property.bedrooms ? `${property.bedrooms} BHK` : "—",
              },
              {
                icon: Bath,
                label: "Bathrooms",
                value: property.bathrooms ? `${property.bathrooms} Bath` : "—",
              },
              {
                icon: Ruler,
                label: "Built-up area",
                value: property.areaSqft ? formatArea(property.areaSqft) : "On request",
              },
              {
                icon: Landmark,
                label: "Type",
                value: property.propertyType,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-primary/[0.06] bg-surface-container-lowest p-4 text-center shadow-ambient"
              >
                <item.icon className="mx-auto h-5 w-5 text-champagne-deep" aria-hidden="true" />
                <dd className="mt-2 font-sans text-[13px] font-bold leading-tight text-primary">
                  {item.value}
                </dd>
                <dt className="mt-1 font-sans text-[8px] font-bold uppercase tracking-[0.14em] text-outline">
                  {item.label}
                </dt>
              </div>
            ))}
          </dl>

          <section className="mt-10 border-t border-primary/[0.08] pt-8">
            <span className="eyebrow">
              <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
              About the residence
            </span>
            <h2 className="mt-3 font-serif text-[1.8rem] leading-tight text-primary sm:text-[2.1rem]">
              A home considered from every angle.
            </h2>
            <p className="mt-4 font-sans text-[15px] leading-8 text-on-surface-variant">
              {property.description ||
                `A ${property.propertyType.toLowerCase()} presented by the Kerala Estates private desk in ${location}. Full particulars, floor plans and title notes are available on request.`}
            </p>

            {galleryExtra.length > 0 ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {galleryExtra.map((image, index) => (
                  <figure
                    key={image}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container"
                  >
                    <PropertyImage
                      src={image}
                      alt={`${property.name} — interior detail ${index + 1}`}
                      sizes="(max-width: 640px) 100vw, 40vw"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent"
                      aria-hidden="true"
                    />
                    <figcaption className="absolute bottom-3 left-3 rounded bg-primary/70 px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                      {index === 0 ? "Interior detail" : "Outdoor living"}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </section>

          {property.keyFeatures.length > 0 ? (
            <section className="mt-10 border-t border-primary/[0.08] pt-8">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="eyebrow">
                    <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
                    Curated amenities
                  </span>
                  <h2 className="mt-3 font-serif text-[1.8rem] leading-tight text-primary">
                    What comes with the address.
                  </h2>
                </div>
                <BadgeCheck className="hidden h-6 w-6 text-champagne-deep sm:block" aria-hidden="true" />
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {property.keyFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 rounded-lg border border-primary/[0.06] bg-surface-container-lowest px-4 py-3 font-sans text-[13px] font-medium text-on-surface shadow-ambient"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-champagne-deep" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10 border-t border-primary/[0.08] pt-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="eyebrow">
                  <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
                  The neighbourhood
                </span>
                <h2 className="mt-3 font-serif text-[1.8rem] leading-tight text-primary">
                  {property.landmark || property.city}
                </h2>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-champagne-deep transition-colors hover:text-primary"
              >
                Open map
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
            <div className="relative mt-4 overflow-hidden rounded-xl border border-primary/[0.07] bg-primary">
              <div className="relative aspect-[16/7] w-full opacity-70">
                <PropertyImage
                  src={property.imageUrl}
                  alt={`${property.name} neighbourhood in ${property.city}`}
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-primary/10" aria-hidden="true" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <p className="flex items-center gap-1.5 font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-secondary-fixed">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {property.city}, {property.district}
                </p>
                <p className="mt-2 max-w-md font-serif text-[22px] leading-tight text-white sm:text-[26px]">
                  {property.landmark}
                </p>
                <p className="mt-2 max-w-md font-sans text-[11px] leading-5 text-white/65">
                  Private viewings can include a chauffeured route from Kochi or a boat transfer
                  where the residence has water frontage.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Title & RERA file",
                copy: "Registration, encumbrance and coastal-zone notes reviewed before your visit.",
              },
              {
                icon: Waves,
                title: "Waterfront diligence",
                copy: "Access, frontage boundaries and jetty rights checked on site where relevant.",
              },
              {
                icon: CalendarDays,
                title: "Private viewing",
                copy: "Weekday, sunset or NRI video walkthrough arranged around your schedule.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-primary/[0.06] bg-surface-container-lowest p-5 shadow-ambient"
              >
                <item.icon className="h-5 w-5 text-champagne-deep" aria-hidden="true" />
                <h3 className="mt-3 font-serif text-[18px] leading-tight text-primary">{item.title}</h3>
                <p className="mt-1.5 font-sans text-[11px] leading-5 text-on-surface-variant">
                  {item.copy}
                </p>
              </div>
            ))}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-xl bg-primary-container p-5 text-white shadow-lift">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed font-serif text-[18px] text-primary ring-2 ring-secondary-fixed/40">
                  {advisor.initials}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-secondary-fixed">
                    Dedicated advisor
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  </p>
                  <h2 className="mt-0.5 truncate font-serif text-[21px] text-white">{advisor.name}</h2>
                  <p className="font-sans text-[10px] text-primary-fixed-dim">{advisor.role}</p>
                </div>
              </div>
              <p className="mt-3 font-sans text-[11px] leading-5 text-primary-fixed-dim">
                {advisor.note}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={telHref(OFFICE_PHONE_E164)}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-surface-container-lowest font-sans text-[11px] font-bold text-primary transition-transform hover:-translate-y-0.5"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  Direct call
                </a>
                <a
                  href={buildWhatsAppUrl({
                    message: propertyWhatsAppMessage(property.name, property.id, location),
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-secondary-fixed font-sans text-[11px] font-bold text-primary transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>

            <div id="enquiry" className="scroll-mt-28">
              <EnquiryForm
                property={{
                  id: property.id,
                  name: property.name,
                  city: property.city,
                  landmark: property.landmark,
                  propertyType: property.propertyType,
                  bedrooms: property.bedrooms,
                  price: property.price,
                }}
                compact
                submitLabel="Request this residence"
                description="Our concierge coordinates private inspections, floor-plan walk-throughs and NRI video viewings."
              />
            </div>

            <div className="rounded-xl border border-primary/[0.07] bg-surface-container-low p-4">
              <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-outline">
                Prefer to speak first?
              </p>
              <a
                href={telHref(OFFICE_PHONE_E164)}
                className="mt-1 block font-serif text-[20px] text-primary transition-colors hover:text-champagne-deep"
              >
                {OFFICE_PHONE}
              </a>
              <p className="mt-1 font-sans text-[10px] leading-4 text-on-surface-variant">
                Monday to Saturday, 9am–7pm IST · NRI calls by appointment
              </p>
            </div>
          </div>
        </aside>
      </section>

      {related.length > 0 ? (
        <section className="shell mt-14 border-t border-primary/[0.08] pt-10 sm:mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">
                <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
                Continue the collection
              </span>
              <h2 className="mt-3 font-serif text-[1.8rem] leading-tight text-primary sm:text-[2.1rem]">
                Residences of a similar spirit.
              </h2>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 border-b border-champagne/50 pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:border-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to the index
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Mobile quick actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/10 bg-background/95 px-4 py-3 shadow-modal backdrop-blur-xl safe-bottom lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <a
            href={telHref(OFFICE_PHONE_E164)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-container-high font-sans text-[11px] font-bold text-primary"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
          <a
            href={buildWhatsAppUrl({
              message: propertyWhatsAppMessage(property.name, property.id, location),
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/15 bg-surface-container-low font-sans text-[11px] font-bold text-primary"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
          <a
            href="#enquiry"
            className="flex h-11 flex-[1.4] items-center justify-center gap-1.5 rounded-lg bg-primary font-sans text-[11px] font-bold text-on-primary"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Book a viewing
          </a>
        </div>
      </div>
    </div>
  );
}
