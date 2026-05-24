import { useRef, useState } from 'react';
import { FiPrinter, FiX, FiCheck } from 'react-icons/fi';
import { useToastStore } from '../stores/toastStore';
import { baseUrl } from '../services/apiClient';

type PaperSize = '58mm' | '80mm' | 'a4';

const SIZE_PREF_KEY = 'katisha_print_size';

const SIZES: { value: PaperSize; label: string; sub: string; preview: string }[] = [
  {
    value: '58mm',
    label: 'Small POS',
    sub: 'Mobile terminal',
    preview: 'w-6 h-16',
  },
  {
    value: '80mm',
    label: 'Standard POS',
    sub: 'Receipt printer',
    preview: 'w-8 h-16',
  },
  {
    value: 'a4',
    label: 'Office / PDF',
    sub: 'A4 paper or Save as PDF',
    preview: 'w-12 h-16',
  },
];

interface PrintTicketProps {
  ticketId: string;
}

const PrintTicket = ({ ticketId }: PrintTicketProps) => {
  const showToast = useToastStore((s) => s.showToast);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const savedSize = localStorage.getItem(SIZE_PREF_KEY) as PaperSize | null;

  const [showPopup, setShowPopup] = useState(false);
  const [selectedSize, setSelectedSize] = useState<PaperSize | null>(null);
  const [remember, setRemember] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const triggerPrint = async (size: PaperSize) => {
    setIsPrinting(true);

    // Remove any previous iframe
    if (iframeRef.current) {
      document.body.removeChild(iframeRef.current);
      iframeRef.current = null;
    }

    const printUrl = `${baseUrl}/tickets/${ticketId}/print?size=${size}`;

    try {
      // Use fetch (intercepted by MSW in dev, real request in prod) instead of
      // setting iframe.src directly — iframe navigation requests bypass MSW.
      const res = await fetch(printUrl, { credentials: 'include' });

      if (res.status === 403) {
        showToast('You do not have permission to print this ticket', 'error');
        setIsPrinting(false);
        return;
      }
      if (res.status === 404) {
        showToast('Ticket not found', 'error');
        setIsPrinting(false);
        return;
      }
      if (!res.ok) {
        showToast('Failed to load ticket for printing', 'error');
        setIsPrinting(false);
        return;
      }

      const html = await res.text();

      // Create a hidden iframe and write the HTML directly into it
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
      document.body.appendChild(iframe);
      iframeRef.current = iframe;

      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!doc) {
        showToast('Failed to open print dialog', 'error');
        document.body.removeChild(iframe);
        iframeRef.current = null;
        setIsPrinting(false);
        return;
      }

      doc.open();
      doc.write(html);
      doc.close();

      // Give the iframe a moment to finish rendering before print fires
      // (the HTML itself also calls window.print() on onload, but we call it
      // explicitly here as a fallback for browsers that sandbox iframe scripts)
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print();
        } catch {
          // Sandboxed iframe — the HTML's own window.onload script handles it
        }
        setIsPrinting(false);
      };

    } catch {
      showToast('Failed to load ticket for printing', 'error');
      setIsPrinting(false);
    }
  };

  const handlePrintClick = () => {
    if (savedSize) {
      // Saved preference exists — print immediately
      triggerPrint(savedSize);
    } else {
      // No preference — open size selector
      setShowPopup(true);
    }
  };

  const handleConfirm = () => {
    if (!selectedSize) return;
    if (remember) {
      localStorage.setItem(SIZE_PREF_KEY, selectedSize);
    }
    setShowPopup(false);
    triggerPrint(selectedSize);
  };

  const handleChangeSize = () => {
    setSelectedSize(savedSize);
    setShowPopup(true);
  };

  return (
    <>
      <div className="flex items-center gap-3 w-full max-w-sm">
        <button
          onClick={handlePrintClick}
          disabled={isPrinting}
          className="flex-1 flex items-center justify-center gap-2 border border-brand text-brand py-3 rounded-xl font-bold text-sm hover:bg-brand/5 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FiPrinter size={16} />
          {isPrinting ? 'Opening…' : 'Print Ticket'}
        </button>
        {savedSize && (
          <button
            onClick={handleChangeSize}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-brand dark:hover:text-brand transition-colors whitespace-nowrap"
          >
            Change size
          </button>
        )}
      </div>

      {/* Size selector popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPopup(false)} />
          <div className="relative bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Select paper size</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <FiX size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="flex gap-3 mb-5">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedSize(s.value)}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    selectedSize === s.value
                      ? 'border-brand bg-brand/5'
                      : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                >
                  {/* Paper preview thumbnail */}
                  <div className={`${s.preview} bg-gray-100 dark:bg-white/10 rounded border border-gray-300 dark:border-white/20 flex items-center justify-center relative overflow-hidden`}>
                    {/* Simulated receipt lines */}
                    <div className="absolute inset-x-1 top-1 space-y-0.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`h-px bg-gray-300 dark:bg-white/20 ${i === 0 ? 'w-full' : i % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} />
                      ))}
                    </div>
                    {selectedSize === s.value && (
                      <div className="absolute inset-0 bg-brand/10 flex items-center justify-center">
                        <FiCheck size={12} className="text-brand" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-bold ${selectedSize === s.value ? 'text-brand' : 'text-gray-700 dark:text-gray-300'}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{s.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Remember choice */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <div
                onClick={() => setRemember(!remember)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  remember ? 'bg-brand border-brand' : 'border-gray-300 dark:border-white/20'
                }`}
              >
                {remember && <FiCheck size={10} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Remember my choice</span>
            </label>

            <button
              onClick={handleConfirm}
              disabled={!selectedSize}
              className="w-full bg-brand text-white py-2.5 rounded-xl font-bold text-sm hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiPrinter size={14} /> Print
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PrintTicket;
