import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdOutlineDirectionsBus } from 'react-icons/md';
import { useTrips } from '../hooks/useTrips';
import TripCard from '../components/TripCard';
import TripCardSkeleton from '../components/TripCardSkeleton';
import FilterPanel, { type TripFilters } from '../components/FilterPanel';

const Trips = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Seed the initial query from the URL (?q=Musanze from Home page)
  const initialQ = searchParams.get('q') ?? undefined;

  const [filters, setFilters] = useState<TripFilters>({
    q: initialQ,
  });

  // Re-sync if the URL changes (e.g. browser back/forward)
  useEffect(() => {
    const q = searchParams.get('q') ?? undefined;
    setFilters((prev) => ({ ...prev, q }));
  }, [searchParams]);

  // Fire the query whenever any filter is set
  const hasAnyFilter =
    Boolean(filters.q) ||
    Boolean(filters.origin_id) ||
    Boolean(filters.company_id) ||
    Boolean(filters.date);

  const { data, isLoading, isError, refetch } = useTrips(
    hasAnyFilter ? filters : undefined
  );

  const trips = data?.data ?? [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-20">

        {/* Filter panel — always visible at top */}
        <FilterPanel
          initialQ={initialQ}
          onFilterChange={setFilters}
        />

        {/* Results */}
        <div className="grid grid-cols-1 gap-3 mt-4">

          {/* Prompt state — nothing entered yet */}
          {!hasAnyFilter && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <MdOutlineDirectionsBus size={48} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                Where would you like to go?
              </p>
              <p className="text-gray-400 dark:text-gray-600 text-xs max-w-xs">
                Type a destination, choose an origin stop, or pick a date to find trips.
              </p>
            </div>
          )}

          {/* Loading skeletons */}
          {hasAnyFilter && isLoading && (
            <>
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </>
          )}

          {/* Error state */}
          {hasAnyFilter && isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Failed to load trips.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {hasAnyFilter && !isLoading && !isError && trips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <MdOutlineDirectionsBus size={40} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                No trips found.
              </p>
              <p className="text-gray-400 dark:text-gray-600 text-xs">
                Try a different destination, date, or remove some filters.
              </p>
            </div>
          )}

          {/* Trip cards */}
          {hasAnyFilter && !isLoading && !isError && trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onClick={() => navigate('/trips/' + trip.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trips;
