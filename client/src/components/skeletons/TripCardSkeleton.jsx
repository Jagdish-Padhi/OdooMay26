export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-(--app-color-border) bg-white">
      <div className="h-40 animate-pulse bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100" />
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-3.5 w-1/2 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="h-3 w-full animate-pulse rounded-lg bg-slate-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
        <div className="flex gap-3">
          <div className="h-9 flex-1 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-9 flex-1 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}