import { cn } from "@/lib/format";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start",
        action ? "md:flex-row md:items-end md:justify-between" : "",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" ? "mx-auto" : "")}>
        <span className={tone === "dark" ? "eyebrow-light" : "eyebrow"}>
          <span className="inline-block h-px w-7 bg-current opacity-60" aria-hidden="true" />
          {eyebrow}
        </span>
        <h2
          className={cn(
            "mt-3 font-serif text-[2rem] leading-[1.15] tracking-[-0.02em] sm:text-[2.45rem]",
            tone === "dark" ? "text-white" : "text-primary"
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-3 font-sans text-[15px] leading-7",
              tone === "dark" ? "text-white/65" : "body-copy"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
