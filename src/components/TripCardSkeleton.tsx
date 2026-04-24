const TripCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 w-full animate-pulse">
      <div className="flex items-center gap-3">
        {/* Logo circle placeholder */}
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />

        <div className="flex-1 min-w-0 space-y-2">
          {/* Operator name placeholder */}
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          {/* Route placeholder */}
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Right side placeholders */}
        <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
          <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default TripCardSkeleton;
