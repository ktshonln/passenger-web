import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister, useVerifyPhone, useResendOtp } from "../hooks/useAuth";
import { FiUser, FiMail, FiPhone, FiLock, FiLoader } from "react-icons/fi";

const Signup = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending: isRegistering } = useRegister();
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyPhone();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  const [step, setStep] = useState<1 | 2>(1);
  const [timer, setTimer] = useState(60);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [countryCode, setCountryCode] = useState("+250");

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    otp: "",
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const phoneRegex = /^(\+2507|07)\d{8}$/;

    if (!formData.first_name) errors.first_name = "First name required";
    if (!formData.last_name) errors.last_name = "Last name required";

    if (!formData.phone_number) {
      errors.phone_number = "Phone number required";
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      errors.password = "Password required";
    } else if (!strongPasswordRegex.test(formData.password)) {
      errors.password = "Use 8+ chars, upper & lowercase, number & special char.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill out all required fields.");
      return;
    }

    setFieldErrors({});
    setError("");

    let inputPhone = formData.phone_number.replace(/\s/g, "");
    if (inputPhone.startsWith("0")) inputPhone = inputPhone.substring(1);
    const formattedPhone = `${countryCode}${inputPhone}`;

    const payload: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formattedPhone,
      password: formData.password,
      locale: "rw" // Could dynamically fetch from i18n, but assuming 'rw' default locally initially
    };
    
    if (formData.email && formData.email.trim() !== "") {
      payload.email = formData.email.trim();
    }

    register(payload, {
      onSuccess: (data: any) => {
        setUserId(data.user_id);
        setStep(2);
        setTimer(60);
      },
    });
  };

  const handleResend = () => {
    resendOtp(
      { phone_number: formData.phone_number },
      {
        onSuccess: () => setTimer(60),
      },
    );
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length < 6) {
      setError("* 6-digit OTP required");
      return;
    }
    setError("");
    verifyOtp(
      { user_id: userId, otp: formData.otp },
      {
        onSuccess: (data: any) => navigate("/login", { state: { identifier: data?.login_identifier || formData.phone_number } }),
      },
    );
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 transition-all">
        {step === 1 ? (
          <>
            <div className="text-center mb-10 animate-fade-in">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                Create Account
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Join Katisha to easily manage your tickets.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">
                {error}
              </div>
            )}

            <form
              onSubmit={handleRegister}
              className="space-y-6 animate-fade-in pt-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-5">
                {/* First Name */}
                <div className="group relative">
                  <label
                    className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.first_name ? "text-red-500" : "text-gray-500 dark:text-gray-400 group-focus-within:text-brand"}`}
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <span
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.first_name ? "text-red-400" : "text-gray-400 group-focus-within:text-brand"}`}
                    >
                      <FiUser size={18} />
                    </span>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          first_name: e.target.value,
                        });
                        clearFieldError("first_name");
                      }}
                      placeholder="First name"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.first_name ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10"}`}
                    />
                  </div>
                  {fieldErrors.first_name && (
                    <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">
                      {fieldErrors.first_name}
                    </span>
                  )}
                </div>
                {/* Last Name */}
                <div className="group relative">
                  <label
                    className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.last_name ? "text-red-500" : "text-gray-500 dark:text-gray-400 group-focus-within:text-brand"}`}
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <span
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.last_name ? "text-red-400" : "text-gray-400 group-focus-within:text-brand"}`}
                    >
                      <FiUser size={18} />
                    </span>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => {
                        setFormData({ ...formData, last_name: e.target.value });
                        clearFieldError("last_name");
                      }}
                      placeholder="Last name"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.last_name ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10"}`}
                    />
                  </div>
                  {fieldErrors.last_name && (
                    <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">
                      {fieldErrors.last_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone Content */}
              <div className="group relative">
                <label
                  className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.phone_number ? "text-red-500" : "text-gray-500 dark:text-gray-400 group-focus-within:text-brand"}`}
                >
                  Phone Number
                </label>
                <div className="relative flex">
                  <span
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${fieldErrors.phone_number ? "text-red-400" : "text-gray-400 group-focus-within:text-brand"}`}
                  >
                    <FiPhone size={18} />
                  </span>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="absolute left-10 top-0 bottom-0 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 z-10 font-semibold appearance-none pl-1 pr-6 cursor-pointer"
                  >
                    <option value="+250">🇷🇼 +250</option>
                    <option value="+254">🇰🇪 +254</option>
                    <option value="+256">🇺🇬 +256</option>
                    <option value="+255">🇹🇿 +255</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        phone_number: e.target.value.replace(/\D/g, ''),
                      });
                      clearFieldError("phone_number");
                    }}
                    placeholder="780 000 000"
                    className={`w-full pl-32 pr-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.phone_number ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10"}`}
                  />
                </div>
                {fieldErrors.phone_number && (
                  <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">
                    {fieldErrors.phone_number}
                  </span>
                )}
              </div>

              {/* Email Content */}
              <div className="group relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 transition-colors group-focus-within:text-brand">
                  Email{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors">
                    <FiMail size={18} />
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@domain.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group relative">
                <label
                  className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.password ? "text-red-500" : "text-gray-500 dark:text-gray-400 group-focus-within:text-brand"}`}
                >
                  Password
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? "text-red-400" : "text-gray-400 group-focus-within:text-brand"}`}
                  >
                    <FiLock size={18} />
                  </span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      clearFieldError("password");
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.password ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10"}`}
                  />
                </div>
                {fieldErrors.password && (
                  <span className="absolute -bottom-5 left-1 text-[11px] font-bold text-red-500">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className={`w-full bg-brand text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all mt-8 flex justify-center items-center gap-2 ${isRegistering ? "opacity-80" : "hover:-translate-y-0.5 active:scale-[0.98]"}`}
              >
                {isRegistering && <FiLoader className="animate-spin" />}
                {isRegistering ? "Processing..." : "Create Account"}
              </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand hover:underline font-bold"
              >
                Log in here
              </Link>
            </p>
          </>
        ) : (
          <div className="animate-fade-in text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              Verify Phone
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              We sent an SMS OTP code to <br className="hidden sm:block" />
              <span className="font-bold text-gray-900 dark:text-white">
                {formData.phone_number}
              </span>
              .
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
                onChange={(e) =>
                  setFormData({ ...formData, otp: e.target.value })
                }
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none text-center text-2xl font-bold tracking-widest uppercase"
              />

              <button
                type="submit"
                disabled={isVerifying}
                className={`w-full bg-brand  text-white  py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 ${isVerifying ? "opacity-80" : "hover:-translate-y-0.5 active:scale-[0.98]"}`}
              >
                {isVerifying && (
                  <FiLoader className="animate-spin text-gray-900 dark:text-brand" />
                )}
                {isVerifying ? "Verifying..." : "Confirm OTP"}
              </button>
            </form>

            <div className="text-center text-sm font-medium mt-6">
              {timer > 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Resend code in{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {timer}s
                  </span>
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-brand font-bold hover:underline ml-1"
                  >
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
export default Signup;
