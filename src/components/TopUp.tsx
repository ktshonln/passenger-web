import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AiOutlineClose } from "react-icons/ai";
import { BsChevronLeft } from "react-icons/bs";
import { FiLoader } from "react-icons/fi";
import { BiSolidErrorCircle } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { useWalletBalance } from "../hooks/useWallet";
import { useTopUp } from "../hooks/useTopUp";
import { openBookingStream } from "../utils/sseClient";
import { CACHE_KEY_WALLET } from "../utils/constants";

interface Props {
  onClose: () => void;
  onTopUpSuccess?: () => void; // called after confirmed SSE — triggers wallet refetch in parent
}

type Step = 0 | 1 | 2; // 0=amount+provider, 1=phone, 2=waiting

const COUNTDOWN_SECONDS = 150;

const TopUp = ({ onClose, onTopUpSuccess }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(0);
  const [amount, setAmount] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<"mtn" | "airtel" | null>(null);
  const [phone, setPhone] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [sseError, setSseError] = useState<"failed" | "timeout" | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  const cleanupRef = useRef<(() => void) | null>(null);

  // TopUp is only ever rendered for authenticated users — safe to always enable
  const { data: wallet, isLoading: isWalletLoading } = useWalletBalance(true);
  const topUp = useTopUp();

  // ── Countdown timer (step 2 only) ──────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    if (secondsLeft <= 0) {
      cleanupRef.current?.();
      setSseError("timeout");
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, secondsLeft]);

  // ── SSE stream (step 2 only) ───────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2 || !bookingId) return;

    const cleanup = openBookingStream(bookingId, {
      onConfirmed: async () => {
        await queryClient.invalidateQueries({ queryKey: CACHE_KEY_WALLET });
        onTopUpSuccess?.();
        onClose();
      },
      onFailed: () => setSseError("failed"),
      onTimeout: () => setSseError("timeout"),
    });
    cleanupRef.current = cleanup;
    return () => cleanup();
  }, [step, bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProviderSelect = (provider: "mtn" | "airtel") => {
    setSelectedProvider(provider);
    setStep(1);
  };

  const handleTopUpSubmit = () => {
    if (!selectedProvider || !amount || !phone.trim()) return;
    topUp.mutate(
      { amount: parseFloat(amount), provider: selectedProvider, phone: phone.trim() },
      {
        onSuccess: (data) => {
          setBookingId(data.booking_id);
          setSecondsLeft(COUNTDOWN_SECONDS);
          setSseError(null);
          setStep(2);
        },
      }
    );
  };

  const handleRetry = () => {
    cleanupRef.current?.();
    setBookingId(null);
    setSseError(null);
    setSecondsLeft(COUNTDOWN_SECONDS);
    setStep(0);
    setAmount("");
    setPhone("");
    setSelectedProvider(null);
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 dark:bg-neutral-900/90 flex items-center justify-center overflow-hidden">
      <div className="bg-white dark:bg-black sm:min-w-80 lg:min-w-sm rounded-2xl max-h-[90vh] md:h-3/4 md:w-xl overflow-y-auto relative">
        <div className="p-8 h-full">
          {/* Close button */}
          <AiOutlineClose
            onClick={onClose}
            className="absolute top-5 right-5 cursor-pointer dark:text-white"
          />
          {/* Back button (step 1 only) */}
          {step === 1 && (
            <BsChevronLeft
              onClick={() => setStep(0)}
              className="absolute top-5 left-5 cursor-pointer dark:text-white"
            />
          )}

          {/* ── Step 0: Amount + Provider ── */}
          {step === 0 && (
            <div className="mt-3 w-full">
              {/* Insufficient balance notice (shown when triggered from TripDetail) */}
              <div className="border rounded-lg p-3 mb-5 border-red-500 bg-red-50 dark:bg-red-950/50 text-red-500 flex space-x-2">
                <div className="bg-white dark:bg-black rounded-full w-fit h-fit p-1 flex items-center justify-center">
                  <BiSolidErrorCircle className="size-6" />
                </div>
                <div>
                  <h2 className="font-semibold">{t("insufficientBalance")}</h2>
                  <p className="max-w-72 text-sm">{t("iBMessage")}</p>
                </div>
              </div>

              {/* Current balance */}
              <h1 className="text-neutral-400 font-bold text-xl mb-5">
                {t("currentBalance")}{" "}
                <span className="text-black dark:text-white">
                  {isWalletLoading ? (
                    <span className="inline-block h-5 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse align-middle" />
                  ) : wallet ? (
                    `${wallet.balance.toLocaleString()} ${wallet.currency}`
                  ) : (
                    "—"
                  )}
                </span>
              </h1>

              {/* Amount input */}
              <div className="font-bold text-xl mb-5 flex items-center space-x-5">
                <label htmlFor="topUpAmount" className="text-neutral-400">
                  {t("add")}
                </label>
                <input
                  type="number"
                  id="topUpAmount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  className="outline-none border border-neutral-300 dark:border-neutral-700 rounded-md p-1 pl-3 ml-5 dark:text-white w-32"
                />
                <span className="dark:text-white">RWF</span>
              </div>

              {/* Provider buttons */}
              <div className="m-4 mb-5 pt-5 space-y-4">
                <button
                  onClick={() => handleProviderSelect("mtn")}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="flex items-center w-full p-2 rounded-lg justify-between bg-[#FFCA06] text-[#004F70] font-bold cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="w-full">{t("topup")} {t("with")} MTN MoMo</span>
                  <img src="/mtnLogo.svg" alt="MTN" className="size-8" />
                </button>
                <button
                  onClick={() => handleProviderSelect("airtel")}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="flex items-center w-full p-2 rounded-lg justify-between bg-[#EC1C24] text-white font-bold cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="w-full">{t("topup")} {t("with")} Airtel Money</span>
                  <img src="/airtelLogo.svg" alt="Airtel" className="size-8" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Phone number ── */}
          {step === 1 && (
            <div className="font-bold text-xl mb-5 w-full h-full flex items-center mt-8">
              <div className="w-full">
                <label htmlFor="topUpPhone" className="text-neutral-400 block">
                  {t("signUpPhone")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="topUpPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 7XX XXX XXX"
                  className="outline-none border border-neutral-300 dark:border-neutral-700 rounded-md p-1 pl-3 mb-10 w-full dark:text-white"
                />
                <button
                  onClick={handleTopUpSubmit}
                  disabled={!phone.trim() || topUp.isPending}
                  className="w-full p-2 rounded-lg text-white bg-brand font-bold cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {topUp.isPending ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      Processing…
                    </>
                  ) : (
                    t("topup")
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Waiting / SSE ── */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center mt-4">
              {sseError === null ? (
                <>
                  <FiLoader className="animate-spin text-brand mb-6" size={48} />
                  <h2 className="text-lg font-bold dark:text-white mb-2">
                    Waiting for payment…
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Enter your MoMo PIN to confirm
                  </p>
                  <div
                    aria-live="polite"
                    className="text-3xl font-extrabold dark:text-white tabular-nums"
                  >
                    {minutes}:{seconds}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Time remaining</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <BiSolidErrorCircle className="text-red-500 size-8" />
                  </div>
                  <h2 className="text-lg font-bold dark:text-white mb-2">
                    {sseError === "timeout" ? "Top-up timed out" : "Top-up failed"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {sseError === "timeout"
                      ? "The payment request timed out. Please try again."
                      : "The payment was not completed. Please try again."}
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand/90 transition-all active:scale-95"
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopUp;
