import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsChevronLeft } from "react-icons/bs";
import { FiLoader } from "react-icons/fi";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import type { Trip, Stop, Price, WalletBalance } from "../types";

interface BookingSheetProps {
  trip: Trip;
  boardingStop: Stop;
  alightingStop: Stop;
  price: Price;
  seatsCount: number;
  totalPrice: number;
  isAuthenticated: boolean;
  walletBalance: WalletBalance | null;
  isWalletLoading: boolean;
  onConfirmWallet: (password: string) => void;
  onConfirmMoMo: (provider: "mtn" | "airtel", phone: string, passengerName: string) => void;
  onTopUpRequest: () => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const BookingSheet = ({ trip, boardingStop, alightingStop, price, seatsCount, totalPrice, isAuthenticated, walletBalance, isWalletLoading, onConfirmWallet, onConfirmMoMo, onTopUpRequest, onClose, isSubmitting }: BookingSheetProps) => {
  const [momoStep, setMomoStep] = useState<0 | 1>(0);
  const [selectedProvider, setSelectedProvider] = useState<"mtn" | "airtel" | null>(null);
  const [phone, setPhone] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [password, setPassword] = useState("");

  const hasSufficientBalance = walletBalance !== null && walletBalance.available >= totalPrice;
  const shortfall = walletBalance !== null ? totalPrice - walletBalance.available : 0;
  const departureTime = new Date(trip.departure_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Booking confirmation">
      <div className="bg-white dark:bg-[#111827] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            {!isAuthenticated && momoStep === 1 && (
              <button onClick={() => setMomoStep(0)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label="Back"><BsChevronLeft size={18} className="text-gray-600 dark:text-gray-300" /></button>
            )}
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{isAuthenticated ? "Confirm Payment" : "Choose Payment"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label="Close"><AiOutlineClose size={18} className="text-gray-500 dark:text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="bg-gray-50 dark:bg-[#1F2937]/50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trip Summary</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{boardingStop.name} → {alightingStop.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{trip.company.name} · Departs {departureTime} · {seatsCount} seat{seatsCount > 1 ? 's' : ''}</p>
            <p className="text-lg font-extrabold text-brand">{totalPrice.toLocaleString()} {price.currency}</p>
          </div>

          {isAuthenticated && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><MdOutlineAccountBalanceWallet size={18} /><span>Wallet balance</span></div>
                {isWalletLoading ? <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" /> : (
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{walletBalance ? `${walletBalance.available.toLocaleString()} ${walletBalance.currency}` : "—"}</span>
                )}
              </div>
              {hasSufficientBalance ? (
                <>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password to confirm" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none" />
                  <button onClick={() => onConfirmWallet(password)} disabled={!password || isSubmitting} className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {isSubmitting ? <><FiLoader className="animate-spin" size={16} />Processing…</> : "Confirm & Pay"}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-red-500 dark:text-red-400 text-center">Insufficient balance. You need <span className="font-bold">{shortfall.toLocaleString()} {price.currency}</span> more.</p>
                  <button onClick={onTopUpRequest} className="w-full border border-brand text-brand py-3 rounded-xl font-bold text-sm hover:bg-brand/5 active:scale-95 transition-all">Top up your wallet</button>
                </div>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="space-y-3">
              {momoStep === 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Select payment method</p>
                  <button onClick={() => { setSelectedProvider("mtn"); setMomoStep(1); }} className="flex items-center w-full p-3 rounded-xl justify-between bg-[#FFCA06] text-[#004F70] font-bold active:scale-95 hover:brightness-95 transition-all">
                    <span className="w-full text-sm">Pay with MTN MoMo</span><img src="/mtnLogo.svg" alt="MTN" className="w-8 h-8" />
                  </button>
                  <button onClick={() => { setSelectedProvider("airtel"); setMomoStep(1); }} className="flex items-center w-full p-3 rounded-xl justify-between bg-[#EC1C24] text-white font-bold active:scale-95 hover:brightness-95 transition-all">
                    <span className="w-full text-sm">Pay with Airtel Money</span><img src="/airtelLogo.svg" alt="Airtel" className="w-8 h-8" />
                  </button>
                </>
              )}
              {momoStep === 1 && selectedProvider && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Passenger name *</label>
                    <input type="text" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Phone number *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 7XX XXX XXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none" />
                  </div>
                  <button onClick={() => { if (selectedProvider && phone.trim() && passengerName.trim()) onConfirmMoMo(selectedProvider, phone.trim(), passengerName.trim()); }} disabled={!phone.trim() || !passengerName.trim() || isSubmitting} className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {isSubmitting ? <><FiLoader className="animate-spin" size={16} />Processing…</> : `Pay ${totalPrice.toLocaleString()} ${price.currency}`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSheet;
