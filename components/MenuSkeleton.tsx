export default function MenuSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-palace-smoke border border-palace-stone h-72 animate-pulse rounded-none"
          >
            <div className="h-40 bg-palace-charcoal" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-palace-charcoal rounded w-3/4" />
              <div className="h-3 bg-palace-charcoal rounded w-1/2" />
              <div className="h-3 bg-palace-charcoal rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
