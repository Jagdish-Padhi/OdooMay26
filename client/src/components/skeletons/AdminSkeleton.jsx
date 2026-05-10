export function AdminSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-(--app-color-border) bg-white p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-9 w-24 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-(--app-color-border) bg-white p-6">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-(--app-color-border) bg-white p-6">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}