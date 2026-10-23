import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Palmtree, Phone, ShieldCheck } from "lucide-react";
import {
  OFFICE_PHONE,
  OFFICE_PHONE_E164,
  SITE_DESCRIPTION,
  WHATSAPP_NUMBER,
} from "@/lib/constants";

const cities = [
  { label: "Kochi residences", href: "/properties?city=Kochi" },
  { label: "Alappuzha backwaters", href: "/properties?city=Alappuzha" },
  { label: "Trivandrum homes", href: "/properties?city=Trivandrum" },
  { label: "Thrissur residences", href: "/properties?city=Thrissur" },
  { label: "Calicut penthouses", href: "/properties?city=Calicut" },
];

const company = [
  { label: "All residences", href: "/properties" },
  { label: "Signature collection", href: "/properties?sort=price-desc" },
  { label: "Private enquiry", href: "/enquiry" },
  { label: "Buyer desk login", href: "/admin/login" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/[0.08] bg-surface-container-low">
      <div className="shell py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-container text-secondary-fixed">
                <Palmtree className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-serif text-[22px] text-primary">Kerala Estates</span>
                <span className="mt-1 font-sans text-[8px] font-bold uppercase tracking-[0.26em] text-champagne-deep">
                  Private Residence Index
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm font-sans text-sm leading-7 text-on-surface-variant">
              {SITE_DESCRIPTION}
            </p>
            <Link
              href="/enquiry"
              className="mt-6 inline-flex items-center gap-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-champagne-deep transition-colors hover:text-primary"
            >
              Request the private portfolio
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="mt-6 flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/80">
              <ShieldCheck className="h-4 w-4 text-champagne-deep" aria-hidden="true" />
              K-RERA authorised · NRI advisory
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Portfolio
            </h3>
            <ul className="mt-5 space-y-3">
              {cities.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-sans text-sm text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              The House
            </h3>
            <ul className="mt-5 space-y-3">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-sans text-sm text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Private desk
            </h3>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={`tel:+${OFFICE_PHONE_E164}`}
                  className="flex items-start gap-3 font-sans text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" aria-hidden="true" />
                  {OFFICE_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 font-sans text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" aria-hidden="true" />
                  WhatsApp concierge
                </a>
              </li>
              <li>
                <a
                  href="mailto:desk@keralaestates.in"
                  className="flex items-start gap-3 font-sans text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" aria-hidden="true" />
                  desk@keralaestates.in
                </a>
              </li>
              <li className="flex items-start gap-3 font-sans text-sm text-on-surface-variant">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" aria-hidden="true" />
                Marine Drive, Kochi
                <br />
                Kerala 682031
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-primary/[0.08] pt-6 font-sans text-[11px] text-on-surface-variant/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kerala Estates. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>RERA disclosures on request</span>
            <span className="hidden h-3 w-px bg-primary/15 sm:block" aria-hidden="true" />
            <span>Prices exclusive of statutory charges</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
