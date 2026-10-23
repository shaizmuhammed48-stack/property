"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-error">
        <TriangleAlert className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="mt-6 font-serif text-3xl text-primary">The index could not be opened</h1>
      <p className="mt-2 max-w-md font-sans text-sm leading-7 text-on-surface-variant">
        We could not load the residence collection just now. Please retry, or speak to the private
        desk and we will send a shortlist directly.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <a href="/enquiry" className="btn-outline">
          Ask the private desk
        </a>
      </div>
    </div>
  );
}
