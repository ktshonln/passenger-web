import { GrLanguage } from "react-icons/gr";
import DarkModeToggle from "./components/DarkModeToggle";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { BiSolidUserCircle } from "react-icons/bi";
import { FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
import { useUser } from "./hooks/useUser";
import { useLogout } from "./hooks/useAuth";

const MainLayout = () => {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const logout = useLogout();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const currentYear = new Date().getFullYear();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) setShowLanguageMenu(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-inter bg-[#F8FAFC] dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link to="/" className="flex items-center gap-2 group outline-none">
                <div className="bg-brand text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-brand/20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">Katisha</span>
              </Link>
            </div>

            {/* Mobile Menu & Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
              <DarkModeToggle />

              {/* Language Menu Dropdown */}
              <div className="relative" ref={languageMenuRef}>
                <button 
                  className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#1F2937] px-3 py-2 rounded-xl transition-all"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                >
                  <GrLanguage size={18} className="text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:block uppercase">{i18n.language}</span>
                  <FiChevronDown className={`text-gray-400 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 top-12 w-40 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 py-2 z-50 animate-fade-in">
                    <button onClick={() => { i18n.changeLanguage("en"); setShowLanguageMenu(false); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-brand/5 dark:hover:bg-brand/10 hover:text-brand transition-colors">English</button>
                    <button onClick={() => { i18n.changeLanguage("fr"); setShowLanguageMenu(false); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-brand/5 dark:hover:bg-brand/10 hover:text-brand transition-colors">Français</button>
                    <button onClick={() => { i18n.changeLanguage("kiny"); setShowLanguageMenu(false); }} className="w-full text-left px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-brand/5 dark:hover:bg-brand/10 hover:text-brand transition-colors">Kinyarwanda</button>
                  </div>
                )}
              </div>

              {user ? (
                <div className="relative ml-1 sm:ml-4" ref={profileMenuRef}>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center justify-center rounded-full hover:ring-4 ring-brand/10 transition-all outline-none overflow-hidden w-11 h-11 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/5 shadow-sm shrink-0 hover:shadow-md"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform hover:scale-105" />
                    ) : (
                      <BiSolidUserCircle className="text-gray-300 dark:text-gray-600 hover:text-brand/50 transition-colors w-full h-full scale-110 mt-1" />
                    )}
                  </button>

                  <div className={`absolute right-0 top-14 w-56 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/60 py-2 origin-top-right z-50 transition-all duration-200 ${showProfileMenu ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <BiSolidUserCircle className="w-full h-full text-brand/70" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email || "Passenger"}
                        </p>
                      </div>
                    </div>
                    <Link 
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-brand/5 dark:hover:bg-brand/10 hover:text-brand transition-colors"
                    >
                      <FiUser size={16} /> Profile
                    </Link>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout.mutate();
                      }}
                      className="w-full flex justify-start items-center gap-3 px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <FiLogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3 ml-2 sm:ml-4 border-l pl-4 sm:pl-6 border-gray-200 dark:border-white/10">
                  <Link to="/login" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-brand transition-colors py-2">
                    {t('login', 'Log In')}
                  </Link>
                  <Link to="/signup" className="text-sm font-bold bg-brand text-white px-5 py-2.5 rounded-xl hover:bg-brand/90 hover:-translate-y-0.5 transition-all shadow-md shadow-brand/20 active:scale-95">
                    {t('signup', 'Sign Up')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-[#0B1120] border-t border-gray-100 dark:border-white/5 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-8 mb-6">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((item, idx) => (
              <a key={idx} href="#" className="font-medium text-sm text-gray-500 dark:text-gray-400 hover:text-brand dark:hover:text-brand transition-colors">
                {item}
              </a>
            ))}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">
            &copy; {currentYear} Katisha Online. {t("allRights", "All rights reserved.")}
          </p>
        </div>
      </footer>
    </div>
  );
};
export default MainLayout;
