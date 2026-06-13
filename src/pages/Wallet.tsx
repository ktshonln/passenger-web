import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiSolidWallet } from 'react-icons/bi';
import { FiLoader, FiArrowUp, FiArrowDown, FiAlertCircle } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';
import { useWalletBalance, useWalletTransactions, CACHE_KEY_TRANSACTIONS } from '../hooks/useWallet';
import { useTopUp } from '../hooks/useTopUp';
import { useUser } from '../hooks/useUser';
import { openTopUpStream } from '../utils/sseClient';
import { useToastStore } from '../stores/toastStore';
import { useQueryClient } from '@tanstack/react-query';
import { CACHE_KEY_WALLET } from '../utils/constants';
import type { WalletTransaction, TopUpSSEEvent } from '../types';

type TxFilter = 'all' | 'topup' | 'payment';
type WalletFlow = 'idle' | 'sheet' | 'waiting' | 'error';
const COUNTDOWN = 150;

const maskPhone = (p: string) => {
  const d = p.replace(/\s/g, '');
  if (d.length <= 7) return p;
  return `${d.slice(0, 4)} *** *** ${d.slice(-3)}`;
};

const StatusBadge = ({ status }: { status: WalletTransaction['status'] }) => {
  const map = {
    confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${map[status]}`}>{status}</span>;
};

const Wallet = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const { data: user } = useUser();

  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [liveCurrency, setLiveCurrency] = useState<string | null>(null);
  const { data: walletData, isLoading: isWalletLoading } = useWalletBalance(Boolean(user));
  const displayBalance = liveBalance ?? walletData?.available ?? null;
  const displayCurrency = liveCurrency ?? walletData?.currency ?? 'RWF';

  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data: txData, isLoading: isTxLoading } = useWalletTransactions(
    { page, limit, type: txFilter === 'all' ? undefined : txFilter },
    Boolean(user)
  );

  const [flow, setFlow] = useState<WalletFlow>('idle');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [phone, setPhone] = useState('');
  const [amountError, setAmountError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sseError, setSseError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN);
  const sseCleanupRef = useRef<(() => void) | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const topUp = useTopUp();

  useEffect(() => {
    if (user?.phone_number && !phone) setPhone(user.phone_number);
  }, [user?.phone_number]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    sseCleanupRef.current?.();
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // Lock body scroll when any overlay is open
  useEffect(() => {
    if (flow !== 'idle') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [flow]);

  const startCountdown = () => {
    setCountdown(COUNTDOWN);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          sseCleanupRef.current?.();
          setSseError({ message: 'Payment timed out. Please try again.', retryable: true });
          setFlow('error');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleTopUpConfirm = () => {
    setAmountError('');
    setPhoneError('');
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt < 500) { setAmountError('Minimum top up amount is RWF 500'); return; }
    if (!phone.trim()) { setPhoneError('Please enter a valid phone number'); return; }

    topUp.mutate(
      { amount: amt, payment_method: provider, phone: phone.trim() },
      {
        onSuccess: (data) => {
          setFlow('waiting');
          startCountdown();
          const cleanup = openTopUpStream(data.topup_id, {
            onConfirmed: (evt: TopUpSSEEvent) => {
              stopCountdown();
              if (evt.new_balance !== undefined) setLiveBalance(evt.new_balance);
              if (evt.currency) setLiveCurrency(evt.currency);
              queryClient.invalidateQueries({ queryKey: CACHE_KEY_WALLET });
              queryClient.invalidateQueries({ queryKey: CACHE_KEY_TRANSACTIONS });
              showToast(
                `Wallet topped up! New balance: ${evt.new_balance?.toLocaleString()} ${evt.currency ?? 'RWF'}`,
                'success'
              );
              setFlow('idle');
              setAmount('');
            },
            onFailed: (evt: TopUpSSEEvent) => {
              stopCountdown();
              setSseError({ message: evt.message ?? 'Payment was not completed.', retryable: evt.retryable ?? true });
              setFlow('error');
            },
            onTimeout: () => {
              stopCountdown();
              setSseError({ message: 'Payment timed out. Please try again.', retryable: true });
              setFlow('error');
            },
          });
          sseCleanupRef.current = cleanup;
        },
        onError: (err: any) => {
          const code = err?.response?.data?.error?.code;
          if (code === 'INVALID_AMOUNT') setAmountError('Minimum top up amount is RWF 500');
          else if (code === 'INVALID_PHONE' || code === 'VALIDATION_ERROR') setPhoneError('Please enter a valid phone number');
        },
      }
    );
  };

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');
  const totalPages = txData ? Math.ceil((txData.total ?? 0) / limit) : 1;

  return (
    // overflow-auto on the page root so sticky works; portals render outside this
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">

        {/* ── Sticky balance card ──
            top-[5rem] = header height (~80px). The card sticks while
            transactions scroll underneath it. */}
        <div className="sticky top-20 z-20 mb-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand/90 to-blue-800 p-6 rounded-[2rem] shadow-xl shadow-brand/20 text-white">
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-[30px] pointer-events-none" />
            <div className="flex items-end justify-between gap-4 relative z-10">
              <div>
                <p className="text-white/80 font-semibold uppercase tracking-[0.15em] text-xs mb-1">{t('totalBalance')}</p>
                {isWalletLoading ? (
                  <div className="h-10 w-40 rounded-xl bg-white/20 animate-pulse mb-1" />
                ) : (
                  <h2 className="text-4xl font-extrabold tracking-tight leading-none">
                    {displayBalance !== null ? displayBalance.toLocaleString() : '—'}
                  </h2>
                )}
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-white/20 rounded text-white font-bold tracking-widest text-xs border border-white/20">
                  {displayCurrency}
                </span>
              </div>
              <button
                onClick={() => setFlow('sheet')}
                className="shrink-0 bg-white text-brand px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all shadow-md flex items-center gap-2"
              >
                <BiSolidWallet size={16} /> {t('topUp')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Transaction history ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('transactions')}</h3>
            <div className="flex gap-1">
              {(['all', 'topup', 'payment'] as TxFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => { setTxFilter(f); setPage(1); }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${txFilter === f ? 'bg-brand text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                >
                  {f === 'all' ? t('allTransactions') : f === 'topup' ? t('topUps') : t('payments')}
                </button>
              ))}
            </div>
          </div>

          {isTxLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}
            </div>
          ) : !txData?.data?.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <BiSolidWallet size={40} className="text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">{t('noTransactions')}</p>
              <p className="text-gray-400 dark:text-gray-600 text-xs">{t('noTransactionsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(txData?.data ?? []).map((tx) => (
                <div
                  key={tx.id}
                  className={`bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3 ${tx.status === 'failed' ? 'opacity-50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'topup' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                    {tx.type === 'topup' ? <FiArrowDown size={18} /> : <FiArrowUp size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                      {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-sm font-bold ${tx.type === 'topup' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {tx.type === 'topup' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {txData && (txData.total ?? 0) > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-400 dark:text-gray-600">{txData.total} total</p>
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                  className="text-xs border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 outline-none"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-xs px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300">Prev</button>
                <span className="text-xs text-gray-500 dark:text-gray-400">{page}/{totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="text-xs px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Overlays — rendered at body level via fixed positioning ──
          z-[200] ensures they sit above the sticky card (z-20) AND the header (z-50) */}

      {/* Top-up sheet */}
      {flow === 'sheet' && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop — separate element so it doesn't create a stacking context on the sheet */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setFlow('idle')} />
          <div className="relative bg-white dark:bg-[#111827] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('topUpWallet')}</h2>
                {displayBalance !== null && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {t('currentBalance')}: {displayBalance.toLocaleString()} {displayCurrency}
                  </p>
                )}
              </div>
              <button onClick={() => setFlow('idle')} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label="Close">
                <AiOutlineClose size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  {t('amount')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={500}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setAmountError(''); }}
                  placeholder={t('amountMin')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
                />
                {amountError && <p className="text-xs text-red-500 mt-1">{amountError}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">{t('paymentMethod')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setProvider('mtn')}
                    className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${provider === 'mtn' ? 'border-brand bg-brand/5 text-brand dark:text-white' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}
                  >
                    <img src="/mtnLogo.svg" alt="MTN" className="w-5 h-5" />
                    MTN MoMo
                  </button>
                  <button
                    onClick={() => setProvider('airtel')}
                    className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${provider === 'airtel' ? 'border-brand bg-brand/5 text-brand dark:text-white' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}
                  >
                    <img src="/airtelLogo.svg" alt="Airtel" className="w-5 h-5" />
                    Airtel Money
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  {t('phoneNumber')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                  placeholder="+250 7XX XXX XXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
                />
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
              </div>

              <button
                onClick={handleTopUpConfirm}
                disabled={!amount || !phone.trim() || topUp.isPending}
                className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {topUp.isPending
                  ? <><FiLoader className="animate-spin" size={16} /> {t('processing')}</>
                  : <><BiSolidWallet size={16} /> {t('confirmTopUp')}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MoMo waiting screen — light/dark aware */}
      {flow === 'waiting' && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B1120] flex flex-col items-center justify-center px-6">
          <FiLoader className="animate-spin text-brand mb-8" size={56} />
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('waitingPayment')}</h2>
          <p className="text-gray-500 dark:text-white/70 text-sm mb-6">{t('enterPin')}</p>
          <div className="bg-gray-100 dark:bg-white/10 rounded-2xl px-6 py-3 mb-6">
            <p className="text-base font-mono font-semibold tracking-widest text-gray-800 dark:text-white">{maskPhone(phone)}</p>
          </div>
          <div aria-live="polite" className="text-4xl font-extrabold tabular-nums text-gray-900 dark:text-white">{mins}:{secs}</div>
          <p className="text-gray-400 dark:text-white/50 text-xs mt-2">{t('timeRemaining')}</p>
        </div>
      )}

      {/* Error card */}
      {flow === 'error' && sseError && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setSseError(null); setFlow('idle'); }} />
          <div className="relative bg-white dark:bg-[#111827] rounded-2xl p-6 max-w-sm w-full text-center space-y-3 border border-gray-100 dark:border-white/5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <FiAlertCircle size={24} className="text-red-500" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white">{t('topUpFailed')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{sseError.message}</p>
            {sseError.retryable ? (
              <button
                onClick={() => { setSseError(null); setFlow('sheet'); }}
                className="w-full bg-brand text-white py-2.5 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all"
              >
                {t('tryAgain')}
              </button>
            ) : (
              <p className="text-xs text-gray-400">Please try a different payment method.</p>
            )}
            <button
              onClick={() => { setSseError(null); setFlow('idle'); }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1"
            >
              {t('dismiss')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
