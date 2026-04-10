import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogin, useVerifyLogin, useVerify2FA, useResendOtp } from "../hooks/useAuth";
import { FiPhone, FiLock, FiLoader, FiEye, FiEyeOff, FiMail } from "react-icons/fi";

const flags: Record<string, string> = { "+250": "rw", "+254": "ke", "+256": "ug", "+255": "tz" };

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { mutate: login, isPending } = useLogin();
  const { mutate: verifyLogin, isPending: isVerifying } = useVerifyLogin();
  const { mutate: verify2FA, isPending: isVerifying2FA } = useVerify2FA();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [timer, setTimer] = useState(60);
  const [userId, setUserId] = useState<string>("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [countryCode, setCountryCode] = useState("+250");
  
  // Pre-fill from location state if we navigated here after verify-phone
  const [formData, setFormData] = useState(() => {
    let initialIdentifier = location.state?.identifier || "";
    if (initialIdentifier.startsWith("+250")) initialIdentifier = initialIdentifier.replace("+250", "");
    return {
      identifier: initialIdentifier, 
      password: "",
      otp: "" 
    };
  });
  
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.identifier) {
      errors.identifier = "Phone or email required";
    } else {
      const cleanInput = formData.identifier.replace(/\s/g, "");
      if (/[a-zA-Z@]/.test(cleanInput)) {
        if (!emailRegex.test(cleanInput)) {
          errors.identifier = "Invalid email format";
        }
      } else {
        const digitsOnly = cleanInput.replace(/\D/g, "");
        if (digitsOnly.length < 8 || digitsOnly.length > 12) {
          errors.identifier = "Invalid phone format";
        }
      }
    }

    if (!formData.password) errors.password = "Password required";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill out all required fields.");
      return;
    }
    setFieldErrors({});
    setError("");
    
    let parsedIdentifier = formData.identifier.replace(/\s/g, "");
    if (!/[a-zA-Z@]/.test(parsedIdentifier) && !parsedIdentifier.startsWith("+")) {
      if (parsedIdentifier.startsWith("0")) parsedIdentifier = parsedIdentifier.substring(1);
      parsedIdentifier = `${countryCode}${parsedIdentifier}`;
    }
    
    login({ identifier: parsedIdentifier, password: formData.password }, { 
      onSuccess: (data: any) => {
        if (data?.requires_verification || data?.requires_2fa) {
          setUserId(data.user_id);
          setRequires2FA(!!data.requires_2fa);
          setStep(2);
          setTimer(data.expires_in || 60);
        } else {
          navigate("/profile");
        }
      } 
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length < 6) {
      setError("* 6-digit OTP required");
      return;
    }
    setError("");
    
    const verifyPayload = { user_id: userId, otp: formData.otp };
    const onSuccessCb = { onSuccess: () => navigate("/profile") };
    
    if (requires2FA) {
      verify2FA(verifyPayload, onSuccessCb);
    } else {
      verifyLogin(verifyPayload, onSuccessCb);
    }
  };

  const handleResend = () => {
    // Determine which phone number to send to. If identifier is phone use it.
    // If it's email, the backend handles resend? The spec says phone_number for resend.
    // We pass the identifier, backend will route accordingly.
    resendOtp({ phone_number: formData.identifier }, { onSuccess: () => setTimer(60) });
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 transition-all">
        {step === 1 ? (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Welcome Back</h2>
              <p className="text-gray-500 dark:text-gray-400">Log in to manage your tickets.</p>
            </div>

            {error && <div className="mb-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
              <div className="group relative">
                <label className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.identifier ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-focus-within:text-brand'}`}>Phone or Email</label>
                <div className="relative flex">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${fieldErrors.identifier ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand'}`}>
                    {formData.identifier.includes('@') ? <FiMail size={18} /> : <FiPhone size={18} />}
                  </span>
                  {!/[a-zA-Z@]/.test(formData.identifier) && (
                    <>
                      <div className="absolute left-11 flex items-center gap-1.5 z-10 cursor-pointer pointer-events-none top-1/2 -translate-y-1/2">
                        <img src={`https://flagcdn.com/${flags[countryCode]}.svg`} alt="flag" className="w-[18px] h-[13px] rounded-[2px] object-cover shadow-sm" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{countryCode}</span>
                      </div>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="absolute left-10 w-[5rem] top-0 bottom-0 bg-transparent border-none outline-none opacity-0 z-20 cursor-pointer"
                      >
                        <option value="+250">Rwanda (+250)</option>
                        <option value="+254">Kenya (+254)</option>
                        <option value="+256">Uganda (+256)</option>
                        <option value="+255">Tanzania (+255)</option>
                      </select>
                    </>
                  )}
                  <input 
                    type="text" 
                    value={formData.identifier} 
                    onChange={e => { 
                      const val = e.target.value;
                      setFormData({ ...formData, identifier: val }); 
                      clearFieldError('identifier'); 
                    }}
                    placeholder="781 234 567 or email"
                    className={`w-full ${/[a-zA-Z@]/.test(formData.identifier) ? 'pl-11' : 'pl-[7.5rem]'} pr-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.identifier ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10'}`}
                  />
                </div>
                {fieldErrors.identifier && <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">{fieldErrors.identifier}</span>}
              </div>

              <div className="group relative">
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-xs font-bold transition-colors ${fieldErrors.password ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-focus-within:text-brand'}`}>Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-brand hover:text-brand/80 transition-colors">Forgot?</Link>
                </div>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand'}`}><FiLock size={18} /></span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    onChange={e => { setFormData({ ...formData, password: e.target.value }); clearFieldError('password'); }}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                 {fieldErrors.password && <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">{fieldErrors.password}</span>}
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className={`w-full bg-brand text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-brand/30 transition-all mt-8 flex justify-center items-center gap-2 ${isPending ? 'opacity-80' : 'hover:-translate-y-0.5 active:scale-[0.98]'}`}
              >
                {isPending && <FiLoader className="animate-spin" />}
                {isPending ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
              Don't have an account? <Link to="/signup" className="text-brand hover:underline font-bold">Sign up now</Link>
            </p>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              Security Check
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              We sent an OTP code to your phone.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20 text-left">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6 pt-2">
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-center text-2xl font-bold tracking-widest uppercase"
              />

              <button
                type="submit"
                disabled={isVerifying || isVerifying2FA}
                className={`w-full bg-brand text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 ${isVerifying || isVerifying2FA ? "opacity-80" : "hover:-translate-y-0.5 active:scale-[0.98]"}`}
              >
                {(isVerifying || isVerifying2FA) && <FiLoader className="animate-spin" />}
                {(isVerifying || isVerifying2FA) ? "Verifying..." : "Confirm OTP"}
              </button>
            </form>

            <div className="text-center text-sm font-medium mt-6">
              {timer > 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Resend code in <span className="font-bold text-gray-900 dark:text-white">{timer}s</span>
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Didn't receive the code?{" "}
                  <button type="button" onClick={handleResend} disabled={isResending} className="text-brand font-bold hover:underline ml-1">
                    {isResending ? "Sending..." : "Resend OTP"}
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Login;
