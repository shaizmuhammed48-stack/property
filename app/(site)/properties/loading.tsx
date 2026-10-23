export default function PropertiesLoading() {
  return (
    <div className="shell py-12">
      <div className="h-4 w-52 animate-pulse rounded bg-surface-container" />
      <div className="mt-6 h-12 w-2/3 animate-pulse rounded bg-surface-container" />
      <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-surface-container" />
      <div className="mt-10 h-40 animate-pulse rounded-xl bg-surface-container-low" />
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-primary/[0.07] bg-surface-container-lowest"
          >
            <div className="image-shimmer aspect-[16/10] w-full" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-2/3 animate-pulse rounded bg-surface-container" />
              <div className="h-6 w-4/5 animate-pulse rounded bg-surface-container" />
              <div className="h-16 animate-pulse rounded-lg bg-surface-container-low" />
              <div className="h-11 animate-pulse rounded-lg bg-surface-container" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
