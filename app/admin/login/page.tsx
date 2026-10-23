import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound, Palmtree, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession, isAdminConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Advisor desk sign-in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin/enquiries");
  const configured = isAdminConfigured();

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grain opacity-20" aria-hidden="true" />
        <div
          className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-champagne/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-secondary/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative p-10 xl:p-14">
          <Link href="/" className="flex items-center gap-3" aria-label="Kerala Estates home">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-secondary-fixed">
              <Palmtree className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-[22px] text-white">Kerala Estates</span>
              <span className="mt-1 font-sans text-[8px] font-bold uppercase tracking-[0.26em] text-champagne">
                Private Residence Index
              </span>
            </span>
          </Link>
        </div>

        <div className="relative px-10 pb-14 xl:px-14">
          <span className="eyebrow-light">
            <span className="inline-block h-px w-8 bg-current opacity-60" aria-hidden="true" />
            Central desk CRM
          </span>
          <h1 className="mt-5 max-w-lg font-serif text-[2.8rem] leading-[1.03] tracking-[-0.03em] text-white xl:text-[3.4rem]">
            The private desk,
            <span className="block italic text-secondary-fixed">behind the collection.</span>
          </h1>
          <p className="mt-5 max-w-md font-sans text-sm leading-7 text-white/55">
            Buyer enquiries, viewing requests and advisor follow-ups across the Kerala portfolio —
            in one quiet, considered workspace.
          </p>

          <div className="mt-9 grid max-w-md gap-3 border-t border-white/15 pt-6">
            {[
              { icon: ShieldCheck, text: "Server-side sessions · signed HttpOnly cookie" },
              { icon: KeyRound, text: "Hashed credentials · never stored in the browser" },
              { icon: Palmtree, text: "Live Google Sheets sync when the bridge is connected" },
            ].map((item) => (
              <p
                key={item.text}
                className="flex items-center gap-2.5 font-sans text-[11px] text-white/55"
              >
                <item.icon className="h-3.5 w-3.5 text-secondary-fixed" aria-hidden="true" />
                {item.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-champagne-deep transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to the public index
          </Link>

          <div className="mt-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-secondary-fixed">
              <Palmtree className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div className="leading-none">
              <p className="font-serif text-[20px] text-primary">Kerala Estates</p>
              <p className="mt-1 font-sans text-[8px] font-bold uppercase tracking-[0.24em] text-champagne-deep">
                Private Residence Index
              </p>
            </div>
          </div>

          <p className="eyebrow mt-8 lg:mt-0">
            <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
            Advisor access only
          </p>
          <h2 className="mt-3 font-serif text-[2.3rem] leading-tight tracking-[-0.025em] text-primary">
            Welcome back.
          </h2>
          <p className="mt-2 font-sans text-[13px] leading-6 text-on-surface-variant">
            Sign in to review buyer enquiries, update lead stages and contact investors.
          </p>

          <LoginForm configured={configured} />

          <p className="mt-8 border-t border-primary/[0.08] pt-4 font-sans text-[10px] leading-5 text-outline">
            This desk contains confidential buyer information. Sessions expire after eight hours
            and every status change is written to the enquiry record.
          </p>
        </div>
      </section>
    </main>
  );
}
