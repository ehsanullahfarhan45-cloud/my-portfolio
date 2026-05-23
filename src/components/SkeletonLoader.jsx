const SkeletonLoader = () => {
  return (
    <div className="space-y-6 px-1 py-6">
      <div className="h-8 w-40 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
      <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
      <div className="h-5 w-2/3 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-[28px] bg-slate-200/80 dark:bg-slate-800" />
        <div className="h-48 animate-pulse rounded-[28px] bg-slate-200/80 dark:bg-slate-800" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-40 animate-pulse rounded-[24px] bg-slate-200/80 dark:bg-slate-800" />
        <div className="h-40 animate-pulse rounded-[24px] bg-slate-200/80 dark:bg-slate-800" />
        <div className="h-40 animate-pulse rounded-[24px] bg-slate-200/80 dark:bg-slate-800" />
      </div>
    </div>
  )
}

export default SkeletonLoader