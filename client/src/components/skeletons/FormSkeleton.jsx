export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        <div className="h-32 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="flex gap-3 pt-4">
        <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}