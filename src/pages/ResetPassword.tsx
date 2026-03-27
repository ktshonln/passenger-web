import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useResetPassword } from "../hooks/useAuth";
import { FiLock, FiLoader, FiCheckCircle } from "react-icons/fi";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const { mutate, isPending, isSuccess } = useResetPassword();
  const [passwords, setPasswords] = useState({ new_password: "", confirm_password: "" });
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
          <p className="text-gray-500 dark:text-gray-400">Please request a new password reset email.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.new_password) {
      setError("* Password is required");
      return;
    }
    if (passwords.new_password !== passwords.confirm_password) {
      setError("* Passwords do not match");
      return;
    }
    setError("");
    mutate({ token, new_password: passwords.new_password });
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
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Create New Password</h2>
              <p className="text-gray-500 dark:text-gray-400">Choose a strong new password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">{error}</div>}

              <div className="group relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 transition-colors group-focus-within:text-brand">New Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors"><FiLock size={18} /></span>
                  <input type="password" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none" />
                </div>
              </div>

              <div className="group relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 transition-colors group-focus-within:text-brand">Confirm Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors"><FiLock size={18} /></span>
                  <input type="password" value={passwords.confirm_password} onChange={e => setPasswords({...passwords, confirm_password: e.target.value})} placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1F2937] focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none" />
                </div>
              </div>

              <button type="submit" disabled={isPending} className={`w-full bg-brand text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-brand/30 transition-all mt-6 flex justify-center items-center gap-2 ${isPending ? 'opacity-80' : 'hover:-translate-y-0.5 active:scale-[0.98]'}`}>
                {isPending && <FiLoader className="animate-spin" />}
                {isPending ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
export default ResetPassword;
