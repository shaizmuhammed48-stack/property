"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Heart,
  Images,
  ShieldCheck,
  X,
} from "lucide-react";
import { PropertyImage } from "@/components/ui/PropertyImage";
import { cn } from "@/lib/format";

const SAVED_KEY = "ke_saved_properties";

export function PropertyGallery({
  id,
  name,
  imageUrl,
  gallery,
  reraVerified,
  premium,
}: {
  id: string;
  name: string;
  imageUrl: string;
  gallery: string[];
  reraVerified: boolean;
  premium: boolean;
}) {
  const images = useMemo(
    () => Array.from(new Set([imageUrl, ...gallery].filter(Boolean))),
    [imageUrl, gallery]
  );
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [saved, setSaved] = useState(false);

  const count = images.length;
  const current = images[active];

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]") as string[];
      setSaved(stored.includes(id));
    } catch {
      setSaved(false);
    }
  }, [id]);

  useEffect(() => {
    if (!lightbox) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight" && count > 1) {
        setActive((value) => (value + 1) % count);
      }
      if (event.key === "ArrowLeft" && count > 1) {
        setActive((value) => (value - 1 + count) % count);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, count]);

  function toggleSaved() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]") as string[];
      const next = stored.includes(id) ? stored.filter((item) => item !== id) : [...stored, id];
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(next.includes(id));
    } catch {
      setSaved((value) => !value);
    }
  }

  function step(direction: 1 | -1) {
    if (count < 2) return;
    setActive((value) => (value + direction + count) % count);
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-container-high sm:aspect-[16/10] lg:aspect-[16/9]">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 z-10"
          aria-label={`Open ${name} photo gallery`}
        >
          <span className="sr-only">Open photo gallery</span>
        </button>
        <PropertyImage
          src={current}
          alt={`${name} — photograph ${active + 1} of ${Math.max(count, 1)}`}
          priority
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="transition-transform duration-700 ease-editorial"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/65 via-transparent to-primary/25"
          aria-hidden="true"
        />

        <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
          {premium ? (
            <span className="rounded-full border border-secondary-fixed/30 bg-primary/65 px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-secondary-fixed backdrop-blur-md">
              Signature collection
            </span>
          ) : null}
          {reraVerified ? (
            <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.12em] text-primary backdrop-blur-md">
              <ShieldCheck className="h-3 w-3 text-champagne-deep" aria-hidden="true" />
              K-RERA screened
            </span>
          ) : null}
        </div>

        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSaved}
            aria-pressed={saved}
            aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur-md transition-all hover:scale-105",
              saved && "text-error"
            )}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-current")} aria-hidden="true" />
          </button>
        </div>

        <div className="absolute inset-x-4 bottom-4 z-20 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/70 px-3 py-1.5 font-sans text-[10px] font-semibold text-white backdrop-blur-md">
            <Images className="h-3.5 w-3.5 text-secondary-fixed" aria-hidden="true" />
            {Math.max(count, 1)} {count === 1 ? "photograph" : "photographs"}
          </span>
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-primary shadow-md transition-colors hover:bg-champagne"
          >
            <Expand className="h-3.5 w-3.5" aria-hidden="true" />
            View gallery
          </button>
        </div>
      </div>

      {count > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photograph ${index + 1} of ${count}`}
              aria-current={index === active}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-surface-container transition-all",
                index === active
                  ? "border-champagne shadow-gold-glow"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <PropertyImage
                src={image}
                alt=""
                sizes="(max-width: 640px) 25vw, 15vw"
                showFallbackLabel={false}
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-primary/97 p-4 text-white backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo gallery`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
              {name} · {active + 1} / {Math.max(count, 1)}
            </p>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative mt-4 flex min-h-0 flex-1 items-center justify-center">
            {count > 1 ? (
              <button
                type="button"
                onClick={() => step(-1)}
                className="absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-primary/60 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
            ) : null}
            <div className="relative h-full max-h-[70vh] w-full max-w-5xl overflow-hidden rounded-xl">
              <PropertyImage
                src={current}
                alt={`${name} — photograph ${active + 1} of ${Math.max(count, 1)}`}
                sizes="90vw"
                showFallbackLabel={false}
              />
            </div>
            {count > 1 ? (
              <button
                type="button"
                onClick={() => step(1)}
                className="absolute right-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-primary/60 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                aria-label="Next photograph"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {count > 1 ? (
            <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image}-lightbox-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Show photograph ${index + 1}`}
                  aria-current={index === active}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                    index === active
                      ? "border-secondary-fixed opacity-100"
                      : "border-transparent opacity-50 hover:opacity-90"
                  )}
                >
                  <PropertyImage src={image} alt="" sizes="80px" showFallbackLabel={false} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
