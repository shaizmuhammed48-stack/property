"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Palmtree, Phone, X } from "lucide-react";
import { NAV_LINKS, OFFICE_PHONE, OFFICE_PHONE_E164, WHATSAPP_NUMBER } from "@/lib/constants";
import { cn } from "@/lib/format";

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/properties")) return pathname.startsWith("/properties");
  if (href.startsWith("/enquiry")) return pathname.startsWith("/enquiry");
  return false;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-primary text-on-primary lg:block">
        <div className="shell flex h-9 items-center justify-between font-sans text-[10px] font-semibold uppercase tracking-[0.18em]">
          <span className="flex items-center gap-2 text-primary-fixed-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-fixed" aria-hidden="true" />
            K-RERA verified residences · Private advisory across Kerala
          </span>
          <a
            href={`tel:+${OFFICE_PHONE_E164}`}
            className="flex items-center gap-1.5 text-white/70 transition-colors hover:text-secondary-fixed"
          >
            <Phone className="h-3 w-3" aria-hidden="true" />
            {OFFICE_PHONE}
          </a>
        </div>
      </div>

      <div className="border-b border-primary/[0.07] bg-background/90 backdrop-blur-xl">
        <div className="shell flex h-[76px] items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3" aria-label="Kerala Estates home">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-container text-secondary-fixed shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
              <Palmtree className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[22px] tracking-[-0.02em] text-primary">
                Kerala Estates
              </span>
              <span className="mt-1 font-sans text-[8px] font-bold uppercase tracking-[0.26em] text-champagne-deep">
                Private Residence Index
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-3.5 py-2 font-sans text-[13px] font-medium text-on-surface-variant transition-colors hover:text-primary",
                    active && "text-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active ? (
                    <span
                      className="absolute inset-x-3.5 -bottom-[3px] h-px bg-champagne"
                      aria-hidden="true"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "Hello Kerala Estates, I would like to speak with a private advisor."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded-lg border border-primary/10 px-3 font-sans text-[12px] font-semibold text-primary transition-colors hover:border-champagne/50 hover:bg-champagne/10 xl:flex"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              Advisor
            </a>
            <Link href="/enquiry" className="btn-primary hidden h-10 px-4 text-[12px] sm:inline-flex">
              Private enquiry
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/10 text-primary transition-colors hover:bg-surface-container lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-navigation"
          className="fixed inset-x-0 bottom-0 top-[76px] z-40 overflow-y-auto border-t border-primary/10 bg-background px-5 py-6 lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between border-b border-primary/[0.07] py-4 font-serif text-2xl text-primary",
                  isActive(link.href, pathname) && "text-champagne-deep"
                )}
              >
                {link.label}
                <span className="font-sans text-[10px] font-bold tracking-[0.18em] text-outline">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <Link href="/enquiry" className="btn-primary w-full">
              Book a private viewing
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href={`tel:+${OFFICE_PHONE_E164}`} className="btn-ghost w-full">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {OFFICE_PHONE}
            </a>
          </div>
          <p className="mt-8 font-sans text-xs leading-6 text-on-surface-variant">
            Curating waterfront estates, backwater retreats and city residences across Kerala.
            <br />
            <Link href="/admin/login" className="mt-3 inline-block font-semibold text-champagne-deep underline-offset-4 hover:underline">
              Advisor desk login
            </Link>
          </p>
        </div>
      ) : null}
    </header>
  );
}
