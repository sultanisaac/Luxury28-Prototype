export default function Loading() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
      <div className="animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-zinc-900 rounded"></div>
            <div className="h-10 w-64 bg-zinc-900 rounded"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
             <div className="h-64 bg-zinc-900 rounded"></div>
             <div className="h-64 bg-zinc-900 rounded"></div>
          </div>
          <div className="space-y-4">
             <div className="h-48 bg-zinc-900 rounded"></div>
             <div className="h-48 bg-zinc-900 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
