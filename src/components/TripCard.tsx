import { FiArrowRight } from 'react-icons/fi';
import { MdAirlineSeatReclineNormal } from 'react-icons/md';
import type { Trip } from '../types';
import { getCdnUrl } from '../utils/media';

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
}

const TripCard = ({ trip, onClick }: TripCardProps) => {
  const departureTime = new Date(trip.departure_at).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const initials = trip.company.name.slice(0, 2).toUpperCase();

  const seatsBadge = () => {
    if (trip.available_seats === 0) {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
          <MdAirlineSeatReclineNormal size={14} />
          Full
        </span>
      );
    }
    if (trip.available_seats <= 5) {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 dark:text-amber-400">
          <MdAirlineSeatReclineNormal size={14} />
          {trip.available_seats} seats
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
        <MdAirlineSeatReclineNormal size={14} />
        {trip.available_seats} seats
      </span>
    );
  };

  return (
    <button
      onClick={onClick}
      aria-label={`Trip from ${trip.origin.name} to ${trip.destination.name}`}
      className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 hover:shadow-md transition-all cursor-pointer w-full text-left"
    >
      <div className="flex items-center gap-3">
        {/* Operator logo / initials */}
        {trip.company.logo_path ? (
          <img
            src={getCdnUrl(trip.company.logo_path)}
            alt={trip.company.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm font-bold shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Operator name */}
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 truncate">
            {trip.company.name}
          </p>

          {/* Route */}
          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
            <span className="truncate">{trip.origin.name}</span>
            <FiArrowRight size={14} className="text-brand shrink-0" />
            <span className="truncate">{trip.destination.name}</span>
          </div>
        </div>

        {/* Right side: time + price + seats */}
        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
          <span className="text-sm font-bold text-gray-900 dark:text-white">{departureTime}</span>
          <span className="text-sm font-semibold text-brand">
            {trip.price.toLocaleString()} {trip.currency}
          </span>
          {seatsBadge()}
        </div>
      </div>
    </button>
  );
};

export default TripCard;
