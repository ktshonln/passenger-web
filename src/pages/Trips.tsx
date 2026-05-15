import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineDirectionsBus } from 'react-icons/md';
import { useTrips } from '../hooks/useTrips';
import TripCard from '../components/TripCard';
import TripCardSkeleton from '../components/TripCardSkeleton';
import FilterPanel from '../components/FilterPanel';
import type { GetTripsParams } from '../types';

const Trips = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<{
    boarding_stop_id?: string;
    alighting_stop_id?: string;
    date?: string;
  }>({});

  // Only fire the query when at least boarding + alighting stop are selected.
  // Without them the real backend returns 500 (staff-mode requires auth headers).
  const hasRequiredFilters =
    Boolean(filters.boarding_stop_id) && Boolean(filters.alighting_stop_id);

  const params: GetTripsParams = { ...filters };

  const { data, isLoading, isError, refetch } = useTrips(
    hasRequiredFilters ? params : undefined
  );

  const trips = data?.trips ?? [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-20">

        {/* Filter panel — always visible at top */}
        <FilterPanel onFilterChange={setFilters} />

        {/* Results */}
        <div className="grid grid-cols-1 gap-3 mt-4">
          {/* Prompt state — no filters selected yet */}
          {!hasRequiredFilters && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <MdOutlineDirectionsBus size={48} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                Select a boarding and alighting stop to search for trips
              </p>
              <p className="text-gray-400 dark:text-gray-600 text-xs max-w-xs">
                Use the filters above to choose your departure and arrival stops, then optionally pick a date.
              </p>
            </div>
          )}

          {/* Loading skeletons */}
          {hasRequiredFilters && isLoading && (
            <>
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </>
          )}

          {/* Error state */}
          {hasRequiredFilters && isError && (
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
          {hasRequiredFilters && !isLoading && !isError && trips.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <MdOutlineDirectionsBus size={40} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                No trips found for this route.
              </p>
              <p className="text-gray-400 dark:text-gray-600 text-xs">
                Try a different date or stop combination.
              </p>
            </div>
          )}

          {/* Trip cards */}
          {hasRequiredFilters && !isLoading && !isError && trips.length > 0 &&
            trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onClick={() => navigate('/trips/' + trip.id)}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Trips;
