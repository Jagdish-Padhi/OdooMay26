export function StopSkeleton({ count = 2 }) {
  return (
    <div className="space-y-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="ml-5 space-y-3 border-l-2 border-dashed border-slate-100 pl-8">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-20 w-full animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}