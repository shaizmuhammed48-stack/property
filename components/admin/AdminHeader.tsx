"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  Palmtree,
  UserRound,
} from "lucide-react";

export function AdminHeader({ username }: { username: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary/[0.08] bg-background/95 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <Link href="/admin/enquiries" className="flex items-center gap-2.5" aria-label="Kerala Estates advisor desk">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container text-secondary-fixed">
              <Palmtree className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-[18px] text-primary">Kerala Estates</span>
              <span className="mt-0.5 block font-sans text-[7px] font-bold uppercase tracking-[0.22em] text-champagne-deep">
                Advisor desk
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 border-l border-primary/10 pl-5 md:flex" aria-label="Advisor desk navigation">
            <Link
              href="/admin/enquiries"
              className="flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 font-sans text-[12px] font-semibold text-primary"
              aria-current="page"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-champagne-deep" aria-hidden="true" />
              Enquiry desk
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-lg bg-surface-container-low px-3 py-1.5 font-sans text-[11px] text-on-surface-variant sm:flex">
            <UserRound className="h-3.5 w-3.5 text-champagne-deep" aria-hidden="true" />
            <span className="max-w-32 truncate font-semibold text-primary">{username}</span>
          </span>
          <Link
            href="/"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-primary/10 px-3 font-sans text-[11px] font-semibold text-primary transition-colors hover:bg-surface-container"
          >
            <span className="hidden sm:inline">Public site</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-primary/10 px-3 font-sans text-[11px] font-semibold text-primary transition-colors hover:border-error/30 hover:bg-error-container/30 hover:text-error disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
