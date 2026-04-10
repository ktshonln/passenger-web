import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForgotPassword } from "../hooks/useAuth";
import { FiMail, FiPhone, FiLoader, FiArrowLeft } from "react-icons/fi";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useForgotPassword();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const phoneRegex = /^(\+2507|07)\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!identifier) {
      errors.identifier = "Phone or email required";
    } else {
      const cleanInput = identifier.replace(/\s/g, "");
      const isPhone = phoneRegex.test(cleanInput);
      const isEmail = emailRegex.test(cleanInput);
      if (!isPhone && !isEmail) {
        errors.identifier = "Invalid phone or email format";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below.");
      return;
    }
    setFieldErrors({});
    setError("");
    mutate({ identifier }, {
      onSuccess: () => navigate("/reset-password", { state: { identifier } })
    });
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
          <p className="text-gray-500 dark:text-gray-400">Enter your email or phone number to receive an OTP.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
          {error && <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">{error}</div>}

          <div className="group relative">
            <label className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.identifier ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-focus-within:text-brand'}`}>Phone or Email</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.identifier ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand'}`}>
                {identifier.includes('@') ? <FiMail size={18} /> : <FiPhone size={18} />}
              </span>
              <input 
                type="text" 
                value={identifier} 
                onChange={e => { setIdentifier(e.target.value); clearFieldError('identifier'); }}
                placeholder="0781234567 or email"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.identifier ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10'}`} 
              />
            </div>
            {fieldErrors.identifier && <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">{fieldErrors.identifier}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full bg-brand text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-brand/30 transition-all mt-6 flex justify-center items-center gap-2 ${isPending ? 'opacity-80' : 'hover:-translate-y-0.5 active:scale-[0.98]'}`}
          >
            {isPending && <FiLoader className="animate-spin" />}
            {isPending ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ForgotPassword;
