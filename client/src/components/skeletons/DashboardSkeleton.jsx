export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-(--app-color-border) bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                <div className="h-6 w-12 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-(--app-color-border) bg-white p-6">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-16 w-full animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}