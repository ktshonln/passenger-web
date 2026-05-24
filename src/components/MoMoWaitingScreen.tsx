import { useEffect, useRef, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { openTicketStream } from "../utils/sseClient";
import type { TicketSSEEvent } from "../types";

interface MoMoWaitingScreenProps {
  phone: string;
  ticketId: string;
  onConfirmed: (event: TicketSSEEvent) => void;
  onFailed: (event: TicketSSEEvent) => void;
  onTimeout: () => void;
}

const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\s/g, "");
  if (digits.length <= 7) return phone;
  return `${digits.slice(0, 4)} *** *** ${digits.slice(-3)}`;
};

const COUNTDOWN_SECONDS = 150;

const MoMoWaitingScreen = ({ phone, ticketId, onConfirmed, onFailed, onTimeout }: MoMoWaitingScreenProps) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const cleanupRef = useRef<(() => void) | null>(null);
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  useEffect(() => {
    const cleanup = openTicketStream(ticketId, {
      onConfirmed: (evt) => onConfirmed(evt),
      onFailed: (evt) => onFailed(evt),
      onTimeout: () => onTimeout(),
    });
    cleanupRef.current = cleanup;
    return () => cleanup();
  }, [ticketId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (secondsLeft <= 0) { cleanupRef.current?.(); onTimeout(); return; }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[60] bg-[#0B1120] flex flex-col items-center justify-center px-6 text-white">
      <div className="mb-8"><FiLoader className="animate-spin text-brand" size={56} /></div>
      <h2 className="text-xl font-bold mb-2 text-center">Waiting for payment</h2>
      <p className="text-white/70 text-sm text-center mb-6">Enter your MoMo PIN to confirm</p>
      <div className="bg-white/10 rounded-2xl px-6 py-3 mb-6">
        <p className="text-base font-mono font-semibold tracking-widest">{maskPhone(phone)}</p>
      </div>
      <div aria-live="polite" aria-label={`Time remaining: ${minutes} minutes ${seconds} seconds`} className="text-4xl font-extrabold tabular-nums">{minutes}:{seconds}</div>
      <p className="text-white/50 text-xs mt-2">Time remaining</p>
    </div>
  );
};

export default MoMoWaitingScreen;
