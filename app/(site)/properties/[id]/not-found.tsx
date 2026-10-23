import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function PropertyNotFound() {
  return (
    <div className="shell flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne/10 text-champagne-deep">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="eyebrow mt-6">Off the current index</p>
      <h1 className="mt-3 max-w-xl font-serif text-[2.2rem] leading-tight text-primary sm:text-[2.8rem]">
        This residence is no longer listed.
      </h1>
      <p className="mt-3 max-w-md font-sans text-sm leading-7 text-on-surface-variant">
        It may have been withdrawn, sold, or moved to the private off-market portfolio. Our desk
        can source comparable addresses in the same district.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href="/properties" className="btn-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return to the index
        </Link>
        <Link href="/enquiry" className="btn-outline">
          Ask the private desk
        </Link>
      </div>
    </div>
  );
}
