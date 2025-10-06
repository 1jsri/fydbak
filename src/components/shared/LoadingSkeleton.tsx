export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
  );
}

export function SurveyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <LoadingSkeleton className="h-8 w-8 rounded-lg mb-2" />
          <LoadingSkeleton className="h-6 w-3/4 mb-2" />
        </div>
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </div>
      <LoadingSkeleton className="h-4 w-full mb-2" />
      <LoadingSkeleton className="h-4 w-2/3 mb-4" />
      <div className="flex items-center space-x-2 mb-4">
        <LoadingSkeleton className="h-5 w-5 rounded" />
        <LoadingSkeleton className="h-4 w-32" />
      </div>
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <LoadingSkeleton className="h-4 w-24" />
          <LoadingSkeleton className="h-4 w-20" />
        </div>
        <LoadingSkeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function ResponseCardSkeleton() {
  return (
    <div className="border border-slate-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <LoadingSkeleton className="h-5 w-32 mb-2" />
          <LoadingSkeleton className="h-4 w-24" />
        </div>
      </div>
      <LoadingSkeleton className="h-4 w-full mb-1" />
      <LoadingSkeleton className="h-4 w-5/6" />
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <LoadingSkeleton className="h-5 w-5 rounded" />
        <LoadingSkeleton className="h-8 w-16" />
      </div>
      <LoadingSkeleton className="h-4 w-24" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <LoadingSkeleton className="h-9 w-64 mb-3" />
        <LoadingSkeleton className="h-5 w-96" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <LoadingSkeleton key={i} className="h-10 w-20 rounded-lg" />
          ))}
        </div>
        <LoadingSkeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <SurveyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SurveyDetailSkeleton() {
  return (
    <div>
      <LoadingSkeleton className="h-4 w-32 mb-4" />

      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <LoadingSkeleton className="h-12 w-12 rounded" />
          <LoadingSkeleton className="h-9 w-96" />
        </div>
        <LoadingSkeleton className="h-5 w-full max-w-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <LoadingSkeleton className="h-7 w-32" />
          <LoadingSkeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ResponseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
