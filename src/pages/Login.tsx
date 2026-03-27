import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { FiMail, FiLock, FiLoader } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();
  
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const phoneRegex = /^(\+2507|07)\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.identifier) {
      errors.identifier = "Phone or email required";
    } else {
      const cleanInput = formData.identifier.replace(/\s/g, "");
      const isPhone = phoneRegex.test(cleanInput);
      const isEmail = emailRegex.test(cleanInput);
      if (!isPhone && !isEmail) {
        errors.identifier = "Invalid phone or email format";
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
    login(formData, { onSuccess: () => navigate("/profile") });
  };

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl p-8 md:p-10 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Welcome Back</h2>
          <p className="text-gray-500 dark:text-gray-400">Log in to manage your tickets.</p>
        </div>

        {error && <div className="mb-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="group relative">
            <label className={`block text-xs font-bold mb-2 transition-colors ${fieldErrors.identifier ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-focus-within:text-brand'}`}>Phone or Email</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.identifier ? 'text-red-400' : 'text-gray-400 group-focus-within:text-brand'}`}><FiMail size={18} /></span>
              <input 
                type="text" 
                value={formData.identifier} 
                onChange={e => { setFormData({ ...formData, identifier: e.target.value }); clearFieldError('identifier'); }}
                placeholder="0781234567 or email"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.identifier ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10'}`}
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
                type="password" 
                value={formData.password} 
                onChange={e => { setFormData({ ...formData, password: e.target.value }); clearFieldError('password'); }}
                placeholder="••••••••"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] transition-all outline-none ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10 focus:border-brand focus:ring-4 focus:ring-brand/10'}`}
              />
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
    </div>
  );
};
export default Login;
