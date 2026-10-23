import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Compass,
  Handshake,
  KeyRound,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Ruler,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  OFFICE_PHONE,
  OFFICE_PHONE_E164,
  SITE_NAME,
  WHATSAPP_NUMBER,
} from "@/lib/constants";
import { getCityCounts, getProperties } from "@/lib/properties";
import { formatArea, formatCompactPrice, formatINR } from "@/lib/format";

export const revalidate = 60;

export const metadata = {
  title: "Kerala Waterfront & City Residences",
  description:
    "Explore a privately curated index of Kerala waterfront estates, backwater retreats and city residences. Search by district, budget and configuration.",
};

export default async function HomePage() {
  const { items: properties } = await getProperties();
  const featured = [...properties]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price)
    .slice(0, 3);
  const premium =
    properties.find((property) => property.premium) ||
    [...properties].sort((a, b) => b.price - a.price)[0] ||
    properties[0];
  const searchDistricts = Array.from(new Set(properties.map((property) => property.district))).sort();
  const searchTypes = Array.from(new Set(properties.map((property) => property.propertyType))).sort();
  const recent = [...properties]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const cityCounts = getCityCounts(properties).slice(0, 5);
  const districtCount = new Set(properties.map((property) => property.district)).size;
  const heroImage = premium?.imageUrl || properties[0]?.imageUrl;
  const heroName = premium?.name || "Kerala Estates";

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative isolate overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <PropertyImage
            src={heroImage}
            alt={`${heroName} — signature Kerala residence`}
            priority
            sizes="100vw"
            className="scale-[1.03]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/35"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-primary via-primary/15 to-primary/40"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-grain opacity-20 mix-blend-soft-light" aria-hidden="true" />
        </div>

        <div className="shell relative z-10 pb-12 pt-14 sm:pt-16 lg:pb-16 lg:pt-20">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7 xl:col-span-7">
              <span className="eyebrow-light">
                <span className="inline-block h-px w-8 bg-current opacity-60" aria-hidden="true" />
                Kerala chapter · 2026 private index
              </span>
              <h1 className="mt-5 font-serif text-[2.9rem] leading-[0.98] tracking-[-0.035em] text-white sm:text-[4rem] lg:text-[4.85rem]">
                A quieter kind of luxury,
                <span className="block italic text-secondary-fixed">rooted in Kerala.</span>
              </h1>
              <p className="mt-6 max-w-xl font-sans text-[15px] leading-7 text-white/70 sm:text-base">
                Waterfront villas on the Punnamada backwaters, penthouse views over Calicut and
                serene family residences in Kochi&apos;s leafy corridors — selected one address at a
                time.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/properties" className="btn-champagne">
                  Explore the collection
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    "Hello Kerala Estates, I would like to speak with a private advisor."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-on-dark"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Speak to the private desk
                </a>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-5">
                <div>
                  <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
                    Curated homes
                  </dt>
                  <dd className="mt-1 font-serif text-2xl text-white">
                    {String(properties.length).padStart(2, "0")}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
                    Districts
                  </dt>
                  <dd className="mt-1 font-serif text-2xl text-white">
                    {String(districtCount).padStart(2, "0")}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
                    RERA screened
                  </dt>
                  <dd className="mt-1 font-serif text-2xl text-white">100%</dd>
                </div>
              </dl>
            </div>

            <div className="hidden lg:col-span-5 lg:block">
              <div className="ml-auto max-w-sm rounded-xl border border-secondary-fixed/25 bg-white/[0.07] p-6 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-secondary-fixed">
                    Signature address
                  </span>
                  <Sparkles className="h-4 w-4 text-secondary-fixed/70" aria-hidden="true" />
                </div>
                {premium ? (
                  <>
                    <p className="mt-5 font-serif text-[28px] leading-tight text-white">
                      {premium.name}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 font-sans text-[12px] text-white/55">
                      <MapPin className="h-3.5 w-3.5 text-secondary-fixed" aria-hidden="true" />
                      {premium.landmark}, {premium.city}
                    </p>
                    <p className="mt-4 font-serif text-[30px] text-secondary-fixed">
                      {formatCompactPrice(premium.price)}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 font-sans text-[11px] text-white/60">
                      <span>{premium.bedrooms} BHK · {premium.bathrooms} Bath</span>
                      <span>{formatArea(premium.areaSqft)}</span>
                    </div>
                    <Link
                      href={`/properties/${encodeURIComponent(premium.id)}`}
                      className="mt-5 inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-secondary-fixed transition-colors hover:text-white"
                    >
                      View signature residence
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-10 lg:mt-12">
            <HeroSearch districts={searchDistricts} types={searchTypes} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Trust strip */}
      <section className="border-b border-primary/[0.07] bg-surface-container-lowest">
        <div className="shell grid grid-cols-1 divide-y divide-primary/[0.07] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "K-RERA screened",
              copy: "Registration checked before listing",
            },
            {
              icon: KeyRound,
              title: "Direct builder pricing",
              copy: "Zero brokerage on primary residences",
            },
            {
              icon: Handshake,
              title: "NRI & deed support",
              copy: "Title, coastal zone and POA guidance",
            },
            {
              icon: Compass,
              title: "Private viewings",
              copy: "Chauffeured visits, including by boat",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0 lg:border-r lg:border-primary/[0.07] lg:last:border-r-0"
            >
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-champagne-deep" aria-hidden="true" />
              <div>
                <p className="font-sans text-[12px] font-bold text-primary">{item.title}</p>
                <p className="mt-0.5 font-sans text-[11px] leading-5 text-on-surface-variant">
                  {item.copy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- Featured homes */}
      <section className="section-space">
        <div className="shell">
          <SectionHeading
            eyebrow="The current collection"
            title="Residences chosen for how they live."
            description="Architecture, light and location — each home in the index is visited and verified by our Kerala desk before it is published."
            action={
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 border-b border-champagne/50 pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:border-primary"
              >
                View all residences
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((property, index) => (
              <PropertyCard key={property.id} property={property} priority={index === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Explore by city */}
      <section className="section-space border-y border-primary/[0.07] bg-surface-container-low">
        <div className="shell">
          <SectionHeading
            eyebrow="Kerala, district by district"
            title="Find the landscape that fits your life."
            description="From the Venetian backwaters of Alappuzha to the IT corridors of Kochi and the quiet cliffs of Trivandrum."
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {cityCounts.map((city, index) => (
              <Link
                key={city.city}
                href={`/properties?city=${encodeURIComponent(city.city)}`}
                className={`group relative overflow-hidden rounded-xl ${
                  index === 0 ? "col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container-high sm:aspect-[3/4] lg:aspect-[3/4]">
                  <PropertyImage
                    src={city.image}
                    alt={`Residences in ${city.city}, ${city.district}`}
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="transition-transform duration-700 ease-editorial group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-primary via-primary/35 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-secondary-fixed">
                      {city.district} district
                    </p>
                    <h3 className="mt-1 font-serif text-[22px] leading-tight text-white">{city.city}</h3>
                    <p className="mt-0.5 font-sans text-[10px] text-white/60">
                      {city.count} {city.count === 1 ? "residence" : "residences"}
                    </p>
                  </div>
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors group-hover:bg-champagne group-hover:text-primary">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Signature spotlight */}
      {premium ? (
        <section className="bg-primary py-16 text-white sm:py-20 lg:py-24">
          <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <PropertyImage
                  src={premium.gallery[0] || premium.imageUrl}
                  alt={`${premium.name} — signature Kerala residence`}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="transition-transform duration-700 hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 text-white">
                  <div>
                    <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-secondary-fixed">
                      {premium.id} · Signature collection
                    </span>
                    <p className="mt-1 font-serif text-[28px] leading-tight sm:text-[34px]">
                      {premium.name}
                    </p>
                  </div>
                  <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] backdrop-blur-md sm:inline-flex">
                    <Waves className="h-3.5 w-3.5 text-secondary-fixed" aria-hidden="true" />
                    {premium.city}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <span className="eyebrow-light">
                <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
                The signature residence
              </span>
              <h2 className="mt-4 font-serif text-[2.3rem] leading-[1.05] tracking-[-0.03em] text-white sm:text-[3rem]">
                {premium.name}, {premium.city}.
              </h2>
              <p className="mt-4 font-sans text-[15px] leading-7 text-white/60">
                {premium.description ||
                  `A curated ${premium.propertyType.toLowerCase()} in ${premium.landmark}, presented by the Kerala Estates private desk.`}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/15 py-4">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
                  <div>
                    <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-white/40">Bedrooms</p>
                    <p className="font-sans text-[13px] font-semibold text-white">{premium.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-x border-white/15 px-3">
                  <Bath className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
                  <div>
                    <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-white/40">Baths</p>
                    <p className="font-sans text-[13px] font-semibold text-white">{premium.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-secondary-fixed" aria-hidden="true" />
                  <div>
                    <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-white/40">Area</p>
                    <p className="font-sans text-[13px] font-semibold text-white">
                      {premium.areaSqft ? new Intl.NumberFormat("en-IN").format(premium.areaSqft) : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {premium.keyFeatures.length > 0 ? (
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
                  {premium.keyFeatures.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 font-sans text-[12px] text-white/65">
                      <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary-fixed" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href={`/properties/${encodeURIComponent(premium.id)}`}
                  className="btn-champagne"
                >
                  Explore this residence
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-[0.16em] text-white/40">
                    Guide price
                  </p>
                  <p className="font-serif text-[22px] text-secondary-fixed">
                    {formatCompactPrice(premium.price)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------- Recently added */}
      <section className="section-space">
        <div className="shell">
          <SectionHeading
            eyebrow="New to the index"
            title="Recently added residences."
            description="Freshly verified homes, with private viewings available this week."
            action={
              <Link
                href="/properties?sort=newest"
                className="inline-flex items-center gap-2 border-b border-champagne/50 pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:border-primary"
              >
                See latest additions
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Why us */}
      <section className="section-space border-y border-primary/[0.07] bg-surface-container-low">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="The Kerala Estates desk"
              title="Local judgement. Institutional care."
              description="We work only for the buyer. That means honest pricing, verified title, and a private advisor who knows the road to the property — not just the listing."
            />
            <div className="mt-8 rounded-xl border border-champagne/25 bg-surface-container-lowest p-6 shadow-ambient">
              <Quote className="h-6 w-6 text-champagne" aria-hidden="true" />
              <p className="mt-3 font-serif text-[19px] leading-8 text-primary">
                “They understood that we were buying a way of life, not just square feet. The
                backwater viewing by boat is something our family still talks about.”
              </p>
              <p className="mt-4 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-champagne-deep">
                NRI buyer · Dubai → Alappuzha
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {[
              {
                icon: MapPin,
                title: "On-the-ground scrutiny",
                copy: "Every address is visited. We check access roads, water frontage, title boundaries and the neighbours.",
              },
              {
                icon: ShieldCheck,
                title: "Document-first advice",
                copy: "K-RERA registration, coastal zone clearance, encumbrance certificates and POA drafts reviewed early.",
              },
              {
                icon: Handshake,
                title: "Buyer-side only",
                copy: "No dual agency. Our fee is transparent, agreed before we introduce a residence or builder.",
              },
              {
                icon: Phone,
                title: "A named advisor",
                copy: "One senior advisor from first call to registration — including bank introductions and site visits.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-primary/[0.07] bg-surface-container-lowest p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <item.icon className="h-6 w-6 text-champagne-deep" aria-hidden="true" />
                <h3 className="mt-4 font-serif text-[20px] leading-tight text-primary">{item.title}</h3>
                <p className="mt-2 font-sans text-[13px] leading-6 text-on-surface-variant">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section className="section-space">
        <div className="shell">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 text-white sm:px-10 sm:py-14 lg:px-16">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-champagne/15 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" aria-hidden="true" />
            <div className="relative grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span className="eyebrow-light">
                  <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
                  Begin privately
                </span>
                <h2 className="mt-4 max-w-2xl font-serif text-[2.2rem] leading-[1.05] tracking-[-0.03em] text-white sm:text-[3rem]">
                  Tell us how you want to live. We&apos;ll find the address.
                </h2>
                <p className="mt-4 max-w-xl font-sans text-sm leading-7 text-white/60">
                  Share your preferred district, budget and configuration. A senior advisor will
                  respond within one business day with a short, relevant shortlist — no mass mailers.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-stretch">
                <Link href="/enquiry" className="btn-champagne">
                  Share your brief
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a href={`tel:+${OFFICE_PHONE_E164}`} className="btn-on-dark">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {OFFICE_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
