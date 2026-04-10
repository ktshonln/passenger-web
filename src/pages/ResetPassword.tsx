import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResetPassword, useForgotPassword } from "../hooks/useAuth";
import { FiLock, FiLoader, FiCheckCircle, FiEyeOff, FiEye } from "react-icons/fi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const identifier = location.state?.identifier || "";
  
  const { mutate, isPending, isSuccess } = useResetPassword();
  const { mutate: resendOtp, isPending: isResending } = useForgotPassword();
  const [passwords, setPasswords] = useState({ otp: "", new_password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [timer, setTimer] = useState(60);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0 && !isSuccess) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, isSuccess]);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  if (!identifier) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Missing Context</h2>
          <p className="text-gray-500 dark:text-gray-400">Please begin the reset process from the forgot password page.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!passwords.otp || passwords.otp.length < 6) errors.otp = "6-digit OTP required";

    if (!passwords.new_password) errors.new_password = "Password is required";
    else if (passwords.new_password.length < 6) errors.new_password = "Minimum 6 characters";

    if (!passwords.confirm_password) errors.confirm_password = "Confirm your password";
    else if (passwords.new_password !== passwords.confirm_password) errors.confirm_password = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below.");
      return;
    }
    setFieldErrors({});
    setError("");
    mutate({ identifier, otp: passwords.otp, new_password: passwords.new_password });
  };

  const handleResend = () => {
    resendOtp({ identifier }, { onSuccess: () => setTimer(60) });
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 transition-all">
        
        {isSuccess ? (
          <div className="bg-brand/10 border border-brand/20 p-6 rounded-2xl flex flex-col items-center text-center animate-fade-in">
             <FiCheckCircle size={48} className="text-brand mb-4" />
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Password Updated!</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your password has been reset successfully.</p>
             <button onClick={() => navigate("/login")} className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand/90 transition-all">
               Log In Now
             </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Verify & Reset</h2>
              <p className="text-gray-500 dark:text-gray-400">We've sent an OTP code to {identifier}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">{error}</div>}
              
              <div className="group relative">
                <label className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.otp ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-focus-within:text-brand'}`}>OTP Code</label>
                <input 
                  type="text" 
                  value={passwords.otp} 
                  onChange={e => { setPasswords({...passwords, otp: e.target.value}); clearFieldError('otp'); }} 
                  placeholder="000000" 
                  maxLength={6}
                  className={`w-full px-4 py-4 text-center tracking-widest text-xl rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.otp ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10'}`} 
                />
                {fieldErrors.otp && <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">{fieldErrors.otp}</span>}
              </div>

              <div className="group relative pt-2">
                <label className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.new_password ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-focus-within:text-brand'}`}>New Password</label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.new_password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand'}`}><FiLock size={18} /></span>
                  <input type={showPassword ? "text" : "password"} value={passwords.new_password} onChange={e => { setPasswords({...passwords, new_password: e.target.value}); clearFieldError('new_password'); }} placeholder="••••••••" className={`w-full pl-11 pr-12 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.new_password ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {fieldErrors.new_password && <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">{fieldErrors.new_password}</span>}
              </div>

              <div className="group relative pt-2">
                <label className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.confirm_password ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-focus-within:text-brand'}`}>Confirm Password</label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.confirm_password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand'}`}><FiLock size={18} /></span>
                  <input type={showPassword ? "text" : "password"} value={passwords.confirm_password} onChange={e => { setPasswords({...passwords, confirm_password: e.target.value}); clearFieldError('confirm_password'); }} placeholder="••••••••" className={`w-full pl-11 pr-12 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.confirm_password ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10'}`} />
                </div>
                {fieldErrors.confirm_password && <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">{fieldErrors.confirm_password}</span>}
              </div>

              <button type="submit" disabled={isPending} className={`w-full bg-brand text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-brand/30 transition-all mt-6 flex justify-center items-center gap-2 ${isPending ? 'opacity-80' : 'hover:-translate-y-0.5 active:scale-[0.98]'}`}>
                {isPending && <FiLoader className="animate-spin" />}
                {isPending ? "Updating..." : "Reset Password"}
              </button>
            </form>
            
            <div className="text-center text-sm font-medium mt-6">
              {timer > 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Resend code in <span className="font-bold text-gray-900 dark:text-white">{timer}s</span></p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Didn't receive the code? <button type="button" onClick={handleResend} disabled={isResending} className="text-brand font-bold hover:underline ml-1">Resend</button></p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ResetPassword;
