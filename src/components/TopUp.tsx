import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AiOutlineClose } from "react-icons/ai";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { BiSolidWallet } from "react-icons/bi";
import { useTopUp } from "../hooks/useTopUp";
import { useUser } from "../hooks/useUser";
import { useWalletBalance } from "../hooks/useWallet";
import { openTopUpStream } from "../utils/sseClient";
import { useToastStore } from "../stores/toastStore";
import { CACHE_KEY_WALLET } from "../utils/constants";
import type { TopUpSSEEvent } from "../types";

interface Props {
  onClose: () => void;
  onTopUpSuccess?: () => void;
}

type Flow = "sheet" | "waiting" | "error";
const COUNTDOWN = 150;

const maskPhone = (p: string) => {
  const d = p.replace(/\s/g, "");
  if (d.length <= 7) return p;
  return `${d.slice(0, 4)} *** *** ${d.slice(-3)}`;
};

const TopUp = ({ onClose, onTopUpSuccess }: Props) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const { data: user } = useUser();
  const { data: wallet } = useWalletBalance(true);
  const topUp = useTopUp();

  const [flow, setFlow] = useState<Flow>("sheet");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState<"mtn" | "airtel">("mtn");
  const [phone, setPhone] = useState("");
  const [amountError, setAmountError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sseError, setSseError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN);

  // Pre-fill phone once user data resolves
  useEffect(() => {
    if (user?.phone_number && !phone) {
      setPhone(user.phone_number);
    }
  }, [user?.phone_number]); // eslint-disable-line react-hooks/exhaustive-deps

  const sseCleanupRef = useRef<(() => void) | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up SSE + countdown on unmount
  useEffect(() => () => {
    sseCleanupRef.current?.();
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const startCountdown = () => {
    setCountdown(COUNTDOWN);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          sseCleanupRef.current?.();
          setSseError({ message: "Payment timed out. Please try again.", retryable: true });
          setFlow("error");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleConfirm = () => {
    setAmountError("");
    setPhoneError("");
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt < 500) {
      setAmountError("Minimum top up amount is RWF 500");
      return;
    }
    if (!phone.trim()) {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    topUp.mutate(
      { amount: amt, payment_method: provider, phone: phone.trim() },
      {
        onSuccess: (data) => {
          setFlow("waiting");
          startCountdown();
          const cleanup = openTopUpStream(data.topup_id, {
            onConfirmed: (evt: TopUpSSEEvent) => {
              stopCountdown();
              queryClient.invalidateQueries({ queryKey: CACHE_KEY_WALLET });
              showToast(
                `Wallet topped up! New balance: ${evt.new_balance?.toLocaleString()} ${evt.currency ?? "RWF"}`,
                "success"
              );
              onTopUpSuccess?.();
              onClose();
            },
            onFailed: (evt: TopUpSSEEvent) => {
              stopCountdown();
              setSseError({
                message: evt.message ?? "Payment was not completed.",
                retryable: evt.retryable ?? true,
              });
              setFlow("error");
            },
            onTimeout: () => {
              stopCountdown();
              setSseError({ message: "Payment timed out. Please try again.", retryable: true });
              setFlow("error");
            },
          });
          sseCleanupRef.current = cleanup;
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          if (code === "INVALID_AMOUNT") setAmountError("Minimum top up amount is RWF 500");
          else if (code === "INVALID_PHONE") setPhoneError("Please enter a valid phone number");
        },
      }
    );
  };

  const handleRetry = () => {
    setSseError(null);
    setFlow("sheet");
  };

  const mins = String(Math.floor(countdown / 60)).padStart(2, "0");
  const secs = String(countdown % 60).padStart(2, "0");

  return (
    <>
      {/* Sheet */}
      {flow === "sheet" && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="bg-white dark:bg-[#111827] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Up Wallet</h2>
                {wallet && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Balance: {wallet.available.toLocaleString()} {wallet.currency}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <AiOutlineClose size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Amount (RWF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={500}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setAmountError(""); }}
                  placeholder="Minimum 500 RWF"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
                />
                {amountError && <p className="text-xs text-red-500 mt-1">{amountError}</p>}
              </div>

              {/* Provider */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Payment method
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setProvider("mtn")}
                    className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      provider === "mtn"
                        ? "border-brand bg-brand/5 text-brand dark:text-white"
                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <img src="/mtnLogo.svg" alt="MTN" className="size-5" />
                    MTN MoMo
                  </button>
                  <button
                    onClick={() => setProvider("airtel")}
                    className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      provider === "airtel"
                        ? "border-brand bg-brand/5 text-brand dark:text-white"
                        : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <img src="/airtelLogo.svg" alt="Airtel" className="size-5" />
                    Airtel Money
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                  placeholder="+250 7XX XXX XXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
                />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
              </div>

              {/* Submit */}
              <button
                onClick={handleConfirm}
                disabled={!amount || !phone.trim() || topUp.isPending}
                className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {topUp.isPending ? (
                  <><FiLoader className="animate-spin" size={16} /> Processing…</>
                ) : (
                  <><BiSolidWallet size={16} /> Confirm Top Up</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting screen */}
      {flow === "waiting" && (
        <div className="fixed inset-0 z-[100] bg-[#0B1120] flex flex-col items-center justify-center px-6 text-white">
          <FiLoader className="animate-spin text-brand mb-8" size={56} />
          <h2 className="text-xl font-bold mb-2">Waiting for payment</h2>
          <p className="text-white/70 text-sm mb-6">Enter your MoMo PIN to confirm</p>
          <div className="bg-white/10 rounded-2xl px-6 py-3 mb-6">
            <p className="text-base font-mono font-semibold tracking-widest">{maskPhone(phone)}</p>
          </div>
          <div aria-live="polite" className="text-4xl font-extrabold tabular-nums">
            {mins}:{secs}
          </div>
          <p className="text-white/50 text-xs mt-2">Time remaining</p>
        </div>
      )}

      {/* Error card */}
      {flow === "error" && sseError && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 max-w-sm w-full text-center space-y-3 border border-gray-100 dark:border-white/5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <FiAlertCircle size={24} className="text-red-500" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white">Top-up failed</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{sseError.message}</p>
            {sseError.retryable ? (
              <button
                onClick={handleRetry}
                className="w-full bg-brand text-white py-2.5 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all"
              >
                Try again
              </button>
            ) : (
              <p className="text-xs text-gray-400">Please try a different payment method.</p>
            )}
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TopUp;
