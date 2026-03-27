import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useAuth";
import { FiMail, FiLoader, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

const ForgotPassword = () => {
  const { mutate, isPending, isSuccess } = useForgotPassword();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("* Identifier required");
      return;
    }
    setError("");
    mutate({ identifier });
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl p-8 md:p-10 relative z-10">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6">
          <FiArrowLeft /> Back to login
        </Link>
        
        <div className="text-left mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Reset Password</h2>
          <p className="text-gray-500 dark:text-gray-400">Enter your email or phone number and we'll send you a recovery link.</p>
        </div>

        {isSuccess ? (
          <div className="bg-brand/10 border border-brand/20 p-6 rounded-2xl flex flex-col items-center text-center animate-fade-in">
             <FiCheckCircle size={48} className="text-brand mb-4" />
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Link Sent</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">If an account with that identifier exists, a recovery link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            {error && <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">{error}</div>}

            <div className="group relative">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 transition-colors group-focus-within:text-brand">Phone or Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors"><FiMail size={18} /></span>
                <input 
                  type="text" 
                  value={identifier} 
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="0781234567 or email@domain.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className={`w-full bg-brand text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-brand/30 transition-all mt-6 flex justify-center items-center gap-2 ${isPending ? 'opacity-80' : 'hover:-translate-y-0.5 active:scale-[0.98]'}`}
            >
              {isPending && <FiLoader className="animate-spin" />}
              {isPending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
