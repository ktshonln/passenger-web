import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight, FiLoader, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { MdAirlineSeatReclineNormal } from 'react-icons/md';
import { RiFlashlightLine } from 'react-icons/ri';
import { AiOutlineClose } from 'react-icons/ai';
import { useTripDetail } from '../hooks/useTripDetail';
import { useUser } from '../hooks/useUser';
import { useWalletBalance } from '../hooks/useWallet';
import { usePrice } from '../hooks/usePrice';
import { useCreateTicket } from '../hooks/useBooking';
import { useToastStore } from '../stores/toastStore';
import { openTicketStream } from '../utils/sseClient';
import { getCdnUrl } from '../utils/media';
import StopsMap from '../components/StopsMap';
import PrintTicket from '../components/PrintTicket';
import type { Stop, TicketConfirmed, TicketFull } from '../types';

type FlowState = 'idle' | 'sheet' | 'momo-waiting' | 'success' | 'failed' | 'timeout';

const maskPhone = (p: string) => {
  const d = p.replace(/\s/g, '');
  if (d.length <= 7) return p;
  return `${d.slice(0, 4)} *** *** ${d.slice(-3)}`;
};

const COUNTDOWN = 150;

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);

  const { data: trip, isLoading, isError } = useTripDetail(id ?? '');
  const { data: user } = useUser();
  const { data: wallet, isLoading: isWalletLoading } = useWalletBalance(Boolean(user));

  const [boardingStopId, setBoardingStopId] = useState('');
  const [alightingStopId, setAlightingStopId] = useState('');
  const [seatsCount, setSeatsCount] = useState(1);
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [confirmedTicket, setConfirmedTicket] = useState<TicketConfirmed | TicketFull | null>(null);
  const [momoPhone, setMomoPhone] = useState('');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [passengerName, setPassengerName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [momoStep, setMomoStep] = useState<0 | 1>(0);
  const [sseError, setSseError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN);
  const sseCleanupRef = useRef<(() => void) | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: price, isLoading: isPriceLoading, error: priceError } = usePrice(
    boardingStopId, alightingStopId
  );
  const createTicket = useCreateTicket();

  const stops: Stop[] = trip
    ? [...trip.stops].sort((a, b) => a.order - b.order)
    : [];

  useEffect(() => {
    if (trip && !boardingStopId && stops.length > 0) {
      setBoardingStopId(stops[0].id);
      setAlightingStopId(stops[stops.length - 1].id);
    }
  }, [trip]);

  const boardingStop = stops.find((s) => s.id === boardingStopId);
  const alightingStops = stops.filter((s) => boardingStop ? s.order > boardingStop.order : true);
  const alightingStop = stops.find((s) => s.id === alightingStopId);

  const handleBoardingChange = (stopId: string) => {
    setBoardingStopId(stopId);
    const nb = stops.find((s) => s.id === stopId);
    const valid = stops.filter((s) => nb ? s.order > nb.order : true);
    if (valid.length) setAlightingStopId(valid[0].id);
  };

  const priceErrorCode = (priceError as any)?.response?.data?.error?.code ?? null;
  const perSeatPrice = price?.amount ?? 0;
  const totalPrice = perSeatPrice * seatsCount;
  const isProceedDisabled = !price || priceErrorCode === 'PRICE_NOT_FOUND' || isPriceLoading || (trip?.available_seats ?? 0) === 0;

  const startCountdown = () => {
    setCountdown(COUNTDOWN);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          sseCleanupRef.current?.();
          setFlowState('timeout');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  useEffect(() => () => { sseCleanupRef.current?.(); stopCountdown(); }, []);

  const handleWalletConfirm = () => {
    if (!trip || !price) return;
    createTicket.mutate(
      { trip_id: trip.id, boarding_stop_id: boardingStopId, alighting_stop_id: alightingStopId, seats_count: seatsCount, payment_method: 'wallet' },
      {
        onSuccess: (data) => {
          if ('id' in data) {
            setConfirmedTicket(data as TicketConfirmed);
            setFlowState('success');
          }
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          if (code === 'INSUFFICIENT_WALLET_BALANCE') {
            showToast('Not enough balance to complete this purchase', 'error');
            navigate('/wallet');
          }
        },
      }
    );
  };

  const handleMoMoConfirm = () => {
    if (!trip || !price) return;
    createTicket.mutate(
      { trip_id: trip.id, boarding_stop_id: boardingStopId, alighting_stop_id: alightingStopId, seats_count: seatsCount, payment_method: momoProvider, phone: momoPhone, passenger_name: passengerName },
      {
        onSuccess: (data) => {
          if ('ticket_id' in data) {
            setFlowState('momo-waiting');
            startCountdown();
            const cleanup = openTicketStream(data.ticket_id, {
              onConfirmed: (evt) => {
                stopCountdown();
                setConfirmedTicket(evt.ticket ?? null);
                setFlowState('success');
              },
              onFailed: (evt) => {
                stopCountdown();
                setSseError({ message: evt.message ?? 'Payment was not completed.', retryable: evt.retryable ?? true });
                setFlowState('failed');
              },
              onTimeout: () => {
                stopCountdown();
                setFlowState('timeout');
              },
            });
            sseCleanupRef.current = cleanup;
          }
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          const available = err?.response?.data?.error?.available;
          if (code === 'NO_SEATS_AVAILABLE') {
            if (available !== undefined) setSeatsCount(Math.min(seatsCount, available));
            showToast(`Only ${available ?? 0} seat(s) remaining`, 'error');
          }
        },
      }
    );
  };

  const handleRetry = () => {
    sseCleanupRef.current?.();
    setSseError(null);
    setFlowState('idle');
    setMomoStep(0);
  };

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-4">
          {[0,1,2].map((i) => <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-32" />)}
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center max-w-sm w-full border border-gray-100 dark:border-white/5">
          <p className="text-gray-700 dark:text-gray-300 font-semibold mb-4">This trip is no longer available.</p>
          <Link to="/trips" className="text-brand font-bold text-sm hover:underline">← Back to trips</Link>
        </div>
      </div>
    );
  }

  const logoUrl = trip.company.logo_path ? getCdnUrl(trip.company.logo_path) : null;
  const initials = trip.company.name.slice(0, 2).toUpperCase();
  const departureFormatted = new Date(trip.departure_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-4">

        {/* Operator header */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt={trip.company.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center text-lg font-bold shrink-0">{initials}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 dark:text-white">{trip.company.name}</p>
                {trip.is_express && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <RiFlashlightLine /> Express
                  </span>
                )}
              </div>
              {trip.company.story && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{trip.company.story}</p>
              )}
            </div>
          </div>
        </div>

        {/* Route + departure */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
            <span>{trip.origin.name}</span>
            <FiArrowRight size={16} className="text-brand shrink-0" />
            <span>{trip.destination.name}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{departureFormatted}</p>
          <div className="flex items-center gap-1.5">
            <MdAirlineSeatReclineNormal size={16} className={trip.available_seats === 0 ? 'text-red-500' : trip.available_seats <= 5 ? 'text-amber-500' : 'text-green-600'} />
            <span className={`text-sm font-semibold ${trip.available_seats === 0 ? 'text-red-500 dark:text-red-400' : trip.available_seats <= 5 ? 'text-amber-500 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
              {trip.available_seats === 0 ? 'No seats available' : `${trip.available_seats} seats available`}
            </span>
          </div>
        </div>

        {/* Stops map (non-express) */}
        {!trip.is_express && stops.length > 0 && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Route · {stops.length} stop{stops.length !== 1 ? 's' : ''}
            </p>
            <StopsMap stops={stops} />
            {/* Stop name list below the map for quick reference */}
            <ol className="mt-3 space-y-1">
              {stops.map((stop, i) => (
                <li key={stop.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 || i === stops.length - 1 ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                    {i + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{stop.name}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Stop selectors + seats + price + pay */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Boarding stop</label>
            <select value={boardingStopId} onChange={(e) => handleBoardingChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none">
              {stops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Alighting stop</label>
            <select value={alightingStopId} onChange={(e) => setAlightingStopId(e.target.value)} disabled={alightingStops.length === 0} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none disabled:opacity-50">
              {alightingStops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Seats</label>
            <input type="number" min={1} max={trip.available_seats} value={seatsCount} onChange={(e) => setSeatsCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), trip.available_seats))} className="w-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none" />
          </div>
          <div className="pt-1">
            {isPriceLoading ? (
              <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : priceErrorCode === 'PRICE_NOT_FOUND' ? (
              <p className="text-sm text-red-500 dark:text-red-400">Price unavailable for this combination</p>
            ) : price ? (
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalPrice.toLocaleString()} {price.currency}</span>
                {seatsCount > 1 && <span className="text-xs text-gray-400 ml-2">({price.amount.toLocaleString()} × {seatsCount})</span>}
              </div>
            ) : null}
          </div>
          {user && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Wallet balance</span>
              {isWalletLoading ? <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /> : (
                <span className="font-semibold text-gray-900 dark:text-white">{wallet ? `${wallet.available.toLocaleString()} ${wallet.currency}` : '—'}</span>
              )}
            </div>
          )}
          <button onClick={() => setFlowState('sheet')} disabled={isProceedDisabled} className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            Proceed to Pay
          </button>
        </div>

        {/* Failed / Timeout */}
        {(flowState === 'failed' || flowState === 'timeout') && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-red-200 dark:border-red-900/40 p-5 text-center space-y-3">
            <p className="font-bold text-gray-900 dark:text-white">{flowState === 'timeout' ? 'Payment timed out' : 'Payment failed'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{sseError?.message ?? 'The payment request timed out. Please try again.'}</p>
            {(flowState === 'timeout' || sseError?.retryable !== false) && (
              <button onClick={handleRetry} className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all">Try again</button>
            )}
            {flowState === 'failed' && sseError?.retryable === false && (
              <p className="text-xs text-gray-400">Please try a different payment method.</p>
            )}
          </div>
        )}
      </div>

      {/* Booking Sheet Overlay */}
      {flowState === 'sheet' && price && boardingStop && alightingStop && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setFlowState('idle'); setMomoStep(0); }} />
          <div className="relative bg-white dark:bg-[#111827] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user ? 'Confirm Payment' : momoStep === 0 ? 'Choose Payment' : 'Enter Details'}</h2>
              <button onClick={() => { setFlowState('idle'); setMomoStep(0); }} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label="Close"><AiOutlineClose size={18} className="text-gray-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 dark:bg-[#1F2937]/50 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trip Summary</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{boardingStop.name} → {alightingStop.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{trip.company.name} · {seatsCount} seat{seatsCount > 1 ? 's' : ''}</p>
                <p className="text-lg font-extrabold text-brand">{totalPrice.toLocaleString()} {price.currency}</p>
              </div>

              {/* Authenticated wallet flow */}
              {user && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Wallet balance</span>
                    <span className="font-bold text-gray-900 dark:text-white">{wallet ? `${wallet.available.toLocaleString()} ${wallet.currency}` : '—'}</span>
                  </div>
                  {wallet && wallet.available >= totalPrice ? (
                    <>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password to confirm" className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>
                      </div>                      <button onClick={handleWalletConfirm} disabled={!password || createTicket.isPending} className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {createTicket.isPending ? <><FiLoader className="animate-spin" size={16} /> Processing…</> : 'Confirm & Pay'}
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-red-500 dark:text-red-400 text-center">Insufficient balance. You need {wallet ? (totalPrice - wallet.available).toLocaleString() : totalPrice.toLocaleString()} {price.currency} more.</p>
                      <button onClick={() => navigate('/wallet')} className="w-full border border-brand text-brand py-3 rounded-xl font-bold text-sm hover:bg-brand/5 active:scale-95 transition-all">Top up your wallet</button>
                    </div>
                  )}
                </div>
              )}

              {/* Guest MoMo flow */}
              {!user && momoStep === 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Select payment method</p>
                  <button onClick={() => { setMomoProvider('mtn'); setMomoStep(1); }} className="flex items-center w-full p-3 rounded-xl justify-between bg-[#FFCA06] text-[#004F70] font-bold active:scale-95 hover:brightness-95 transition-all">
                    <span className="text-sm">Pay with MTN MoMo</span><img src="/mtnLogo.svg" alt="MTN" className="w-8 h-8" />
                  </button>
                  <button onClick={() => { setMomoProvider('airtel'); setMomoStep(1); }} className="flex items-center w-full p-3 rounded-xl justify-between bg-[#EC1C24] text-white font-bold active:scale-95 hover:brightness-95 transition-all">
                    <span className="text-sm">Pay with Airtel Money</span><img src="/airtelLogo.svg" alt="Airtel" className="w-8 h-8" />
                  </button>
                </div>
              )}
              {!user && momoStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Passenger name *</label>
                    <input type="text" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Phone number *</label>
                    <input type="tel" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} placeholder="+250 7XX XXX XXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none" />
                  </div>
                  <button onClick={handleMoMoConfirm} disabled={!momoPhone.trim() || !passengerName.trim() || createTicket.isPending} className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {createTicket.isPending ? <><FiLoader className="animate-spin" size={16} /> Processing…</> : `Pay ${totalPrice.toLocaleString()} ${price.currency}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MoMo Waiting Screen */}
      {flowState === 'momo-waiting' && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B1120] flex flex-col items-center justify-center px-6">
          <FiLoader className="animate-spin text-brand mb-8" size={56} />
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Waiting for payment</h2>
          <p className="text-gray-500 dark:text-white/70 text-sm mb-6">Enter your PIN to confirm</p>
          <div className="bg-gray-100 dark:bg-white/10 rounded-2xl px-6 py-3 mb-6">
            <p className="text-base font-mono font-semibold tracking-widest text-gray-800 dark:text-white">{maskPhone(momoPhone)}</p>
          </div>
          <div aria-live="polite" className="text-4xl font-extrabold tabular-nums text-gray-900 dark:text-white">{mins}:{secs}</div>
          <p className="text-gray-400 dark:text-white/50 text-xs mt-2">Time remaining</p>
        </div>
      )}

      {/* Success Overlay */}
      {flowState === 'success' && confirmedTicket && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B1120] flex flex-col items-center justify-center px-6" role="dialog" aria-modal="true">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
              <FiCheck size={32} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold mb-1 text-gray-900 dark:text-white">Booking Confirmed!</h2>
          <p className="text-gray-500 dark:text-white/60 text-sm mb-8">Your seat is reserved</p>
          <div className="bg-gray-50 dark:bg-white/10 rounded-2xl p-5 w-full max-w-sm space-y-3 mb-8 border border-gray-100 dark:border-white/10">
            <div className="text-center">
              <p className="text-xs text-gray-400 dark:text-white/50 uppercase tracking-widest mb-1">Ticket Reference</p>
              <p className="text-sm font-mono font-bold text-brand">{'id' in confirmedTicket ? confirmedTicket.id : ''}</p>
            </div>
            <div className="border-t border-gray-100 dark:border-white/10" />
            <div>
              <p className="text-xs text-gray-400 dark:text-white/50 mb-1">{trip.company.name}</p>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <span>{'boarding_stop' in confirmedTicket ? confirmedTicket.boarding_stop.name : ''}</span>
                <FiArrowRight size={14} className="text-brand shrink-0" />
                <span>{'alighting_stop' in confirmedTicket ? confirmedTicket.alighting_stop.name : ''}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-white/10" />
            <div>
              <p className="text-xs text-gray-400 dark:text-white/50 mb-1">{seatsCount} seat{seatsCount > 1 ? 's' : ''}</p>
              <p className="text-base font-extrabold text-brand">{'amount' in confirmedTicket ? `${confirmedTicket.amount.toLocaleString()} ${'currency' in confirmedTicket ? confirmedTicket.currency : 'RWF'}` : ''}</p>
            </div>
          </div>
          <button onClick={() => navigate('/trips')} className="w-full max-w-sm bg-brand text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all">Done</button>
          <PrintTicket ticketId={'id' in confirmedTicket ? confirmedTicket.id : ''} />
        </div>
      )}
    </div>
  );
};

export default TripDetail;
