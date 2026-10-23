import { SearchX, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/format";

export function EmptyState({
  title,
  description,
  action,
  className,
  icon: Icon = SearchX,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/15 bg-surface-container-lowest px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne/10 text-champagne-deep">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-serif text-2xl text-primary">{title}</h3>
      <p className="mt-2 max-w-md font-sans text-sm leading-6 text-on-surface-variant">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something interrupted the view",
  description = "We could not load this section. Please try again in a moment.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-error/20 bg-error-container/30 px-6 py-16 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-error">
        <TriangleAlert className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-serif text-2xl text-primary">{title}</h3>
      <p className="mt-2 max-w-md font-sans text-sm leading-6 text-on-surface-variant">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      aria-hidden="true"
    />
  );
}
