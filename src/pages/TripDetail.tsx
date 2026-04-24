import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { MdOutlineLocationOn, MdAirlineSeatReclineNormal } from 'react-icons/md';
import { RiFlashlightLine } from 'react-icons/ri';

import { useTripDetail } from '../hooks/useTripDetail';
import { useUser } from '../hooks/useUser';
import { useWalletBalance } from '../hooks/useWallet';
import { usePrice } from '../hooks/usePrice';
import { useCreateBooking } from '../hooks/useBooking';

import StopSelector from '../components/StopSelector';
import PriceDisplay from '../components/PriceDisplay';
import BookingSheet from '../components/BookingSheet';
import MoMoWaitingScreen from '../components/MoMoWaitingScreen';
import BookingSuccessOverlay from '../components/BookingSuccessOverlay';
import TopUp from '../components/TopUp';

import { getCdnUrl } from '../utils/media';

type FlowState = 'idle' | 'sheet' | 'momo-waiting' | 'success' | 'failed' | 'timeout';

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: trip, isLoading, isError } = useTripDetail(id ?? '');
  const { data: user } = useUser();
  const {
    data: wallet,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
  } = useWalletBalance(Boolean(user));
  const [boardingStopId, setBoardingStopId] = useState('');
  const [alightingStopId, setAlightingStopId] = useState('');
  const {
    data: price,
    isLoading: isPriceLoading,
    error: priceError,
  } = usePrice(boardingStopId, alightingStopId);

  const createBooking = useCreateBooking();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [bookingFlowState, setBookingFlowState] = useState<FlowState>('idle');
  const [phone, setPhone] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);

  // ── Stop initialization ────────────────────────────────────────────────────
  useEffect(() => {
    if (trip && !boardingStopId) {
      setBoardingStopId(trip.stops[0]?.id ?? '');
      setAlightingStopId(trip.stops[trip.stops.length - 1]?.id ?? '');
    }
  }, [trip]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop filtering ─────────────────────────────────────────────────────────
  const boardingStop = trip?.stops.find((s) => s.id === boardingStopId);
  const alightingStops =
    trip?.stops.filter((s) => (boardingStop ? s.order > boardingStop.order : true)) ?? [];
  const alightingStop = trip?.stops.find((s) => s.id === alightingStopId);

  const handleBoardingChange = (stopId: string) => {
    setBoardingStopId(stopId);
    const newBoarding = trip?.stops.find((s) => s.id === stopId);
    const validAlighting = trip?.stops.filter((s) =>
      newBoarding ? s.order > newBoarding.order : true
    );
    if (validAlighting?.length) setAlightingStopId(validAlighting[0].id);
  };

  // ── Proceed to Pay disabled condition ──────────────────────────────────────
  const priceErrorCode =
    (priceError as any)?.response?.data?.error?.code ?? null;
  const isProceedDisabled =
    !price ||
    priceErrorCode === 'PRICE_NOT_FOUND' ||
    isPriceLoading ||
    (trip?.available_seats ?? 0) === 0;

  // ── Booking handlers ───────────────────────────────────────────────────────
  const handleConfirmWallet = () => {
    if (!trip || !price || !boardingStopId || !alightingStopId) return;
    createBooking.mutate(
      {
        trip_id: trip.id,
        boarding_stop_id: boardingStopId,
        alighting_stop_id: alightingStopId,
        payment_method: 'wallet',
      },
      { onSuccess: (data) => { setBookingId(data.booking_id); setBookingFlowState('success'); } }
    );
  };

  const handleConfirmMoMo = (provider: 'mtn' | 'airtel', momoPhone: string) => {
    if (!trip || !price || !boardingStopId || !alightingStopId) return;
    setPhone(momoPhone);
    createBooking.mutate(
      {
        trip_id: trip.id,
        boarding_stop_id: boardingStopId,
        alighting_stop_id: alightingStopId,
        payment_method: provider,
        phone: momoPhone,
      },
      {
        onSuccess: (data) => {
          setBookingId(data.booking_id);
          setBookingFlowState('momo-waiting');
        },
      }
    );
  };

  // ── Operator logo / initials ───────────────────────────────────────────────
  const initials = trip ? trip.company.name.slice(0, 2).toUpperCase() : '';
  const logoUrl = trip ? getCdnUrl(trip.company.logo_path) : '';

  // ── Sorted stops for display ───────────────────────────────────────────────
  const sortedStops = trip
    ? [...trip.stops].sort((a, b) => a.order - b.order)
    : [];

  // ── Departure formatted ────────────────────────────────────────────────────
  const departureFormatted = trip
    ? new Date(trip.departure_at).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-32"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error / not found state ────────────────────────────────────────────────
  if (isError || !trip) {
    return (
      <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 text-center max-w-sm w-full">
          <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4">
            This trip is no longer available.
          </p>
          <Link
            to="/trips"
            className="inline-flex items-center gap-1.5 text-brand font-bold text-sm hover:underline"
          >
            ← Back to trips
          </Link>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-4">

        {/* ── Operator header ── */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5">
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={trip.company.name}
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center text-lg font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 dark:text-white">{trip.company.name}</p>
                {trip.is_express && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <RiFlashlightLine />
                    Express
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {trip.company.story}
              </p>
            </div>
          </div>
        </div>

        {/* ── Route + departure ── */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <span>{trip.origin.name}</span>
            <FiArrowRight size={16} className="text-brand shrink-0" />
            <span>{trip.destination.name}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{departureFormatted}</p>
          <div className="flex items-center gap-1.5">
            <MdAirlineSeatReclineNormal
              size={16}
              className={
                trip.available_seats === 0
                  ? 'text-red-500'
                  : trip.available_seats <= 5
                  ? 'text-amber-500'
                  : 'text-green-600 dark:text-green-400'
              }
            />
            <span
              className={`text-sm font-semibold ${
                trip.available_seats === 0
                  ? 'text-red-500 dark:text-red-400'
                  : trip.available_seats <= 5
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {trip.available_seats === 0
                ? 'No seats available'
                : `${trip.available_seats} seats available`}
            </span>
          </div>
        </div>

        {/* ── Stops list (non-express only) ── */}
        {!trip.is_express && sortedStops.length > 0 && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Stops
            </p>
            <ol className="space-y-2">
              {sortedStops.map((stop) => (
                <li key={stop.id} className="flex items-center gap-2">
                  <MdOutlineLocationOn size={18} className="text-brand shrink-0" />
                  <a
                    href={`https://maps.google.com/?q=${stop.lat},${stop.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors"
                  >
                    {stop.name}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Stop selectors + price + pay button ── */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 space-y-4">
          <StopSelector
            label="Boarding stop"
            stops={trip.stops}
            value={boardingStopId}
            onChange={handleBoardingChange}
          />
          <StopSelector
            label="Alighting stop"
            stops={alightingStops}
            value={alightingStopId}
            onChange={setAlightingStopId}
            disabled={alightingStops.length === 0}
          />

          {/* Price display */}
          <div className="pt-1">
            <PriceDisplay
              isLoading={isPriceLoading}
              price={price ?? null}
              error={priceErrorCode}
            />
          </div>

          {/* Wallet balance (authenticated only) */}
          {user && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Wallet balance</span>
              {isWalletLoading ? (
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <span className="font-semibold text-gray-900 dark:text-white">
                  {wallet
                    ? `${wallet.balance.toLocaleString()} ${wallet.currency}`
                    : '—'}
                </span>
              )}
            </div>
          )}

          {/* Proceed to Pay */}
          <button
            onClick={() => setBookingFlowState('sheet')}
            disabled={isProceedDisabled}
            className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Pay
          </button>
        </div>

        {/* ── Failed / Timeout inline states ── */}
        {(bookingFlowState === 'failed' || bookingFlowState === 'timeout') && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-red-200 dark:border-red-900/40 p-5 text-center space-y-3">
            <p className="font-bold text-gray-900 dark:text-white">
              {bookingFlowState === 'timeout'
                ? 'Payment timed out'
                : 'Payment failed'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {bookingFlowState === 'timeout'
                ? 'The payment request timed out. Please try again.'
                : 'The payment was not completed. Please try again.'}
            </p>
            <button
              onClick={() => {
                setBookingFlowState('idle');
                setBookingId(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-all active:scale-95"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* ── Overlays ── */}

      {bookingFlowState === 'sheet' &&
        trip &&
        price &&
        boardingStop &&
        alightingStop && (
          <BookingSheet
            trip={trip}
            boardingStop={boardingStop}
            alightingStop={alightingStop}
            price={price}
            isAuthenticated={Boolean(user)}
            walletBalance={wallet ?? null}
            isWalletLoading={isWalletLoading}
            onConfirmWallet={handleConfirmWallet}
            onConfirmMoMo={handleConfirmMoMo}
            onTopUpRequest={() => {
              setShowTopUp(true);
              setBookingFlowState('idle');
            }}
            onClose={() => setBookingFlowState('idle')}
            isSubmitting={createBooking.isPending}
          />
        )}

      {bookingFlowState === 'momo-waiting' && bookingId && (
        <MoMoWaitingScreen
          phone={phone}
          bookingId={bookingId}
          onConfirmed={() => setBookingFlowState('success')}
          onFailed={() => setBookingFlowState('failed')}
          onTimeout={() => setBookingFlowState('timeout')}
        />
      )}

      {bookingFlowState === 'success' &&
        trip &&
        price &&
        boardingStop &&
        alightingStop &&
        bookingId && (
          <BookingSuccessOverlay
            bookingId={bookingId}
            trip={trip}
            boardingStop={boardingStop}
            alightingStop={alightingStop}
            price={price}
            onClose={() => navigate('/trips')}
          />
        )}

      {showTopUp && (
        <TopUp
          onClose={() => setShowTopUp(false)}
          onTopUpSuccess={() => refetchWallet()}
        />
      )}
    </div>
  );
};

export default TripDetail;
