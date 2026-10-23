"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { isNextImageHost, validateImageUrl } from "@/lib/images";
import { cn } from "@/lib/format";

type PropertyImageProps = {
  src?: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallbackClassName?: string;
  showFallbackLabel?: boolean;
};

export function PropertyImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className,
  fallbackClassName,
  showFallbackLabel = true,
}: PropertyImageProps) {
  const [failed, setFailed] = useState(false);
  const safeSrc = validateImageUrl(src);

  if (!safeSrc || failed) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-surface-container via-surface-container-low to-champagne/10 px-4 text-center",
          fallbackClassName
        )}
        role="img"
        aria-label={`${alt} — photograph coming soon`}
      >
        <div className="absolute inset-0 bg-grain opacity-50" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-champagne/30 bg-surface-container-lowest/70 text-champagne-deep">
          <ImageOff aria-hidden="true" className="h-5 w-5" />
        </div>
        {showFallbackLabel ? (
          <span className="relative font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
            Photograph on request
          </span>
        ) : null}
      </div>
    );
  }

  if (isNextImageHost(safeSrc)) {
    return (
      <Image
        src={safeSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    // Unknown but valid https hosts bypass the optimizer (and its host allowlist).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safeSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
