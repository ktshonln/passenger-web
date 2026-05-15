import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
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

  const params: GetTripsParams = { ...filters };

  const { data, isLoading, isError, refetch } = useTrips(params);

  const handleClearFilters = () => {
    setFilters({});
  };

  const trips = data?.trips ?? [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-20">
        {/* Sticky search bar */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 py-3 -mx-4 px-4 mb-6">
          <div className="relative">
            <AiOutlineSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              readOnly
              placeholder="Use filters below to search trips…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none cursor-default"
            />
          </div>
        </div>

        {/* Filter panel */}
        <FilterPanel onFilterChange={setFilters} />

        {/* Results grid */}
        <div className="grid grid-cols-1 gap-3 mt-4">
          {isLoading ? (
            <>
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Failed to load trips.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AiOutlineSearch size={40} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No trips found.</p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onClick={() => navigate('/trips/' + trip.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Trips;
