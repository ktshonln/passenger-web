import { useEffect, useRef, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { openBookingStream } from "../utils/sseClient";

interface MoMoWaitingScreenProps {
  phone: string;       // raw phone number — will be masked for display
  bookingId: string;
  onConfirmed: () => void;
  onFailed: () => void;
  onTimeout: () => void;
}

/** Masks a phone number, keeping the first 4 and last 3 characters visible.
 *  e.g. "+250788123456" → "+250 7** *** 456"
 */
const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\s/g, "");
  if (digits.length <= 7) return phone;
  const prefix = digits.slice(0, 4);
  const suffix = digits.slice(-3);
  return `${prefix} *** *** ${suffix}`;
};

const COUNTDOWN_SECONDS = 150; // 2 minutes 30 seconds

const MoMoWaitingScreen = ({
  phone,
  bookingId,
  onConfirmed,
  onFailed,
  onTimeout,
}: MoMoWaitingScreenProps) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Format seconds as MM:SS
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  // Open SSE stream on mount
  useEffect(() => {
    const cleanup = openBookingStream(bookingId, {
      onConfirmed: () => onConfirmed(),
      onFailed: () => onFailed(),
      onTimeout: () => onTimeout(),
    });
    cleanupRef.current = cleanup;
    return () => cleanup();
  }, [bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer — calls onTimeout when it reaches zero
  useEffect(() => {
    if (secondsLeft <= 0) {
      cleanupRef.current?.(); // abort SSE stream
      onTimeout();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[60] bg-[#0B1120] flex flex-col items-center justify-center px-6 text-white">
      {/* Spinner */}
      <div className="mb-8">
        <FiLoader className="animate-spin text-brand" size={56} />
      </div>

      {/* Prompt */}
      <h2 className="text-xl font-bold mb-2 text-center">Waiting for payment</h2>
      <p className="text-white/70 text-sm text-center mb-6">
        Enter your MoMo PIN to confirm
      </p>

      {/* Masked phone */}
      <div className="bg-white/10 rounded-2xl px-6 py-3 mb-6">
        <p className="text-base font-mono font-semibold tracking-widest">
          {maskPhone(phone)}
        </p>
      </div>

      {/* Countdown timer */}
      <div
        aria-live="polite"
        aria-label={`Time remaining: ${minutes} minutes ${seconds} seconds`}
        className="text-4xl font-extrabold tabular-nums"
      >
        {minutes}:{seconds}
      </div>
      <p className="text-white/50 text-xs mt-2">Time remaining</p>
    </div>
  );
};

export default MoMoWaitingScreen;
