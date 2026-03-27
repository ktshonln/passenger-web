import { useState, useRef, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { BiSolidWallet, BiShieldQuarter, BiSolidUserCircle } from "react-icons/bi";
import { FiUser, FiLock, FiBell, FiGlobe, FiCamera, FiCheck, FiLoader } from "react-icons/fi";
import { Link } from "react-router-dom";
import TopUp from "../components/TopUp";
import { useUser, useUpdateUser, useChangePassword } from "../hooks/useUser";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("personal");
  const [topUpPrompt, setTopUpPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // React Query Hooks
  const { data: user, isLoading } = useUser();
  const updateUser = useUpdateUser();
  const changePassword = useChangePassword();

  // States
  const [avatarPreview, setAvatarPreview] = useState("");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [notifications, setNotifications] = useState({ email: true, sms: false });

  // Sync avatar_url from server payload
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarPreview(user.avatar_url);
    }
  }, [user?.avatar_url]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setAvatarPreview(imgUrl);
      // Automatically patch avatar_url
      updateUser.mutate({ avatar_url: imgUrl });
    }
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateUser.mutate({
      first_name: fd.get("first_name") as string,
      last_name: fd.get("last_name") as string,
      email: fd.get("email") as string,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match.");
      return;
    }
    changePassword.mutate(
      { current_password: passwords.current, new_password: passwords.new },
      { onSuccess: () => setPasswords({ current: "", new: "", confirm: "" }) }
    );
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <FiUser size={18} /> },
    { id: "security", label: "Security", icon: <FiLock size={18} /> },
    { id: "preferences", label: "Preferences", icon: <FiBell size={18} /> },
    { id: "wallet", label: t("wallet", "Wallet"), icon: <BiSolidWallet size={18} /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120]">
        <FiLoader className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] pb-20 relative overflow-hidden">

      {/* Subtle Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 pt-10 relative">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">Manage your profile, security, and preferences seamlessly.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Sidebar Navigation */}
          <div className="w-full md:w-1/4 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-md border border-gray-100 dark:border-white/5 shadow-md shadow-gray-200/50 dark:shadow-black/50 rounded-2xl p-3 shrink-0">
            <div className="flex text-sm md:flex-col overflow-x-auto gap-2 custom-scroll hide-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden outline-none whitespace-nowrap ${isActive
                        ? "text-brand dark:text-white bg-brand/10 dark:bg-brand/20"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-r-full" />
                    )}
                    <div className={isActive ? 'text-brand' : 'text-gray-400'}>
                      {tab.icon}
                    </div>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full md:w-3/4 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-gray-100 dark:border-white/5 shadow-lg shadow-gray-200/50 dark:shadow-black/60 rounded-2xl p-6 lg:p-10 transition-all min-h-[500px]">

            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100 dark:border-white/10">
                  <div className="p-2.5 bg-brand/10 rounded-xl text-brand"><FiUser size={20} /></div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Personal Information</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Avatar Editor */}
                  <div className="relative group mx-auto lg:mx-0 shrink-0">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#1F2937] shadow-lg relative bg-gray-50 dark:bg-[#111827]">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <BiSolidUserCircle className="w-full h-full text-gray-200 dark:text-gray-700 scale-[1.15]" />
                      )}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <FiCamera size={24} className="text-white drop-shadow-md" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Form Inputs */}
                  <form className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full" onSubmit={handleProfileSubmit}>
                    {[{
                      id: 'firstName', name: 'first_name', label: t('signUpFirstName', 'First Name'), defaultValue: user?.first_name, type: 'text'
                    }, {
                      id: 'lastName', name: 'last_name', label: t('signUpLastName', 'Last Name'), defaultValue: user?.last_name, type: 'text'
                    }, {
                      id: 'email', name: 'email', label: t('signUpEmail', 'Email Address'), defaultValue: user?.email, type: 'email', fullWidth: true
                    }, {
                      id: 'phone', name: 'phone_number', label: t('signUpPhone', 'Phone Number'), defaultValue: user?.phone_number, type: 'tel', fullWidth: true
                    }].map((field) => (
                      <div key={field.id} className={`${field.fullWidth ? 'sm:col-span-2' : ''} group`}>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 transition-colors group-focus-within:text-brand">{field.label}</label>
                        <input
                          name={field.name}
                          type={field.type}
                          defaultValue={field.defaultValue || ""}
                          disabled={field.name === "phone_number"} // Phone requires OTP re-verification per contract
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#111827] focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    ))}

                    <div className="sm:col-span-2 mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={updateUser.isPending}
                        className={`bg-brand text-white px-6 py-2.5 rounded-xl font-semibold shadow-md border border-brand hover:border-brand/80 hover:bg-brand/90 transition-all w-full sm:w-auto text-sm ${updateUser.isPending ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 hover:-translate-y-0.5 shadow-brand/20 hover:shadow-lg'}`}
                      >
                        {updateUser.isPending ? "Saving..." : t('profileSubmit', 'Save Changes')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100 dark:border-white/10">
                  <div className="p-2.5 bg-brand/10 rounded-xl text-brand"><BiShieldQuarter size={20} /></div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Security Settings</h2>
                </div>

                <form className="max-w-md space-y-5" onSubmit={handlePasswordSubmit}>
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 transition-colors group-focus-within:text-brand">Current Password</label>
                    <input type="password" required placeholder="••••••••" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111827] focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all outline-none" />
                  </div>

                  <div className="pt-5 mt-5 border-t border-gray-100 dark:border-white/5 space-y-5">
                    <div className="group">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 transition-colors group-focus-within:text-brand">New Password</label>
                      <input type="password" required placeholder="••••••••" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111827] focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all outline-none" />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 transition-colors group-focus-within:text-brand">Confirm New Password</label>
                      <input type="password" required placeholder="••••••••" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-[#1F2937]/50 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#111827] focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all outline-none" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={changePassword.isPending}
                      className={`bg-brand text-white px-8 py-3 rounded-xl font-bold shadow-md w-full sm:w-auto text-sm transition-all border border-brand hover:border-brand/80 ${changePassword.isPending ? 'opacity-70 cursor-not-allowed' : 'shadow-brand/20 hover:shadow-lg hover:bg-brand/90 hover:-translate-y-0.5 active:scale-95'}`}
                    >
                      {changePassword.isPending ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="animate-fade-in flex flex-col gap-10">
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/10">
                    <div className="p-2.5 bg-brand/10 rounded-xl text-brand"><FiBell size={20} /></div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h2>
                  </div>
                  <div className="space-y-4 max-w-xl">
                    <label className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#1F2937]/50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                      <div className="pr-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Email Alerts</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Digital tickets & account updates directly to your inbox.</p>
                      </div>
                      <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${notifications.email ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={(e) => { e.preventDefault(); setNotifications({ ...notifications, email: !notifications.email }) }}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-[#1F2937]/50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                      <div className="pr-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Push & SMS</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quick boarding reminders and urgent delay notifications.</p>
                      </div>
                      <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${notifications.sms ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={(e) => { e.preventDefault(); setNotifications({ ...notifications, sms: !notifications.sms }) }}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${notifications.sms ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/10">
                    <div className="p-2.5 bg-brand/10 rounded-xl text-brand"><FiGlobe size={20} /></div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Display Language</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                    {[
                      { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/gb.svg' },
                      { code: 'fr', label: 'Français', flagUrl: 'https://flagcdn.com/fr.svg' },
                      { code: 'kiny', label: 'Kinyarwanda', flagUrl: 'https://flagcdn.com/rw.svg' }
                    ].map((lang) => {
                      const isActive = i18n.language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => i18n.changeLanguage(lang.code)}
                          className={`relative p-4 rounded-2xl transition-all duration-300 text-left border flex flex-col gap-3 overflow-hidden ${isActive
                              ? 'border-brand bg-brand/5 shadow-sm shadow-brand/10'
                              : 'border-gray-100 dark:border-[#1F2937] bg-white dark:bg-[#111827] hover:border-brand/30 hover:shadow-sm'
                            }`}
                        >
                          {isActive && (
                            <div className="absolute top-3 right-3 text-brand">
                              <FiCheck size={18} />
                            </div>
                          )}
                          <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm shrink-0">
                            <img src={lang.flagUrl} alt={`${lang.label} flag`} className="w-full h-full object-cover" />
                          </div>
                          <span className={`text-sm font-semibold mt-1 ${isActive ? 'text-brand dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {lang.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100 dark:border-white/10">
                  <div className="p-2.5 bg-brand/10 rounded-xl text-brand"><BiSolidWallet size={20} /></div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('wallet')}</h2>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand/90 to-blue-800 p-8 md:p-10 rounded-[2rem] shadow-xl shadow-brand/20 mb-8 w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-brand/30 transition-shadow">

                  <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-[30px] pointer-events-none" />
                  <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-[30px] pointer-events-none" />

                  <div className="relative z-10 w-full sm:w-auto text-center sm:text-left">
                    <p className="text-white/80 font-semibold uppercase tracking-[0.15em] text-xs mb-2">Total Balance</p>
                    <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                      <h3 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">12,999<span className="text-2xl opacity-90">.20</span></h3>
                    </div>
                    <span className="inline-block mt-2 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded text-white font-bold tracking-widest text-xs border border-white/20">
                      RWF
                    </span>
                  </div>

                  <div className="relative z-10 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => setTopUpPrompt(true)}
                      className="bg-white text-brand px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-md active:scale-95 w-full flex items-center justify-center gap-2"
                    >
                      <BiSolidWallet size={20} />
                      Top Up Now
                    </button>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto text-center mt-8 bg-gray-50 dark:bg-[#1F2937]/50 py-4 px-6 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <Trans
                      i18nKey='walletNotice'
                      values={{ item: t('termsAndConditions') }}
                      components={{
                        1: <Link to="/terms-and-conditions" className="text-brand font-semibold hover:underline" />
                      }}
                    />
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {topUpPrompt && <TopUp onClose={() => setTopUpPrompt(false)} />}
    </div>
  );
}
