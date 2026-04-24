import { useEffect, useRef } from "react";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import type { TripDetail, Stop, Price } from "../types";

interface BookingSuccessOverlayProps {
  bookingId: string;
  trip: TripDetail;
  boardingStop: Stop;
  alightingStop: Stop;
  price: Price;
  onClose: () => void;
}

const BookingSuccessOverlay = ({
  bookingId,
  trip,
  boardingStop,
  alightingStop,
  price,
  onClose,
}: BookingSuccessOverlayProps) => {
  const doneButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the Done button on mount for accessibility
  useEffect(() => {
    doneButtonRef.current?.focus();
  }, []);

  const departureTime = new Date(trip.departure_at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-[70] bg-[#0B1120]/95 flex flex-col items-center justify-center px-6 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Booking confirmed"
    >
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
        <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
          <FiCheck size={32} className="text-white" strokeWidth={3} />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold mb-1 text-center">Booking Confirmed!</h2>
      <p className="text-white/60 text-sm mb-8 text-center">Your seat is reserved</p>

      {/* Booking summary card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 w-full max-w-sm space-y-4 mb-8">
        {/* Booking reference */}
        <div className="text-center">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Booking Reference</p>
          <p className="text-sm font-mono font-bold text-brand">{bookingId}</p>
        </div>

        <div className="border-t border-white/10" />

        {/* Operator + route */}
        <div>
          <p className="text-xs text-white/50 mb-1">{trip.company.name}</p>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span>{trip.origin.name}</span>
            <FiArrowRight size={14} className="text-brand shrink-0" />
            <span>{trip.destination.name}</span>
          </div>
          <p className="text-xs text-white/50 mt-1">Departs {departureTime}</p>
        </div>

        <div className="border-t border-white/10" />

        {/* Segment */}
        <div>
          <p className="text-xs text-white/50 mb-1">Your segment</p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span>{boardingStop.name}</span>
            <FiArrowRight size={14} className="text-brand shrink-0" />
            <span>{alightingStop.name}</span>
          </div>
          <p className="text-base font-extrabold text-brand mt-1">
            {price.amount.toLocaleString()} {price.currency}
          </p>
        </div>
      </div>

      {/* Done button */}
      <button
        ref={doneButtonRef}
        onClick={onClose}
        className="w-full max-w-sm bg-brand text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand/90 transition-all active:scale-95"
      >
        Done
      </button>
    </div>
  );
};

export default BookingSuccessOverlay;
