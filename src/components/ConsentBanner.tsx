import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "katisha_consent_accepted";

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and privacy consent"
      className="fixed bottom-0 left-0 right-0 z-[200] px-4 pb-4 sm:pb-6 pointer-events-none"
    >
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl shadow-gray-200/60 dark:shadow-black/60 p-5">

          {/* Title */}
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">
            Cookies &amp; Privacy
          </p>

          {/* Body */}
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            We use essential cookies to keep you logged in and process payments securely.
            We don't use advertising or tracking cookies. By continuing you agree to our{" "}
            <Link to="/privacy" className="text-brand font-semibold hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/cookies" className="text-brand font-semibold hover:underline">
              Cookie Policy
            </Link>
            .
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none bg-brand text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand/90 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/20 active:scale-95 transition-all"
            >
              Accept &amp; Continue
            </button>
            <Link
              to="/cookies"
              className="text-sm font-semibold text-gray-400 dark:text-gray-500 hover:text-brand dark:hover:text-brand transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
