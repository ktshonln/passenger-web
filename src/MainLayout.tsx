import { GrLanguage } from "react-icons/gr";
import DarkModeToggle from "./components/DarkModeToggle";
// Removed changeLanguage
import i18n from "./i18n";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { BiSolidUserCircle } from "react-icons/bi";
import { FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
import { useUser } from "./hooks/useUser";

type Language = "en" | "kiny" | "fr";

const MainLayout = () => {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const currentYear = new Date().getFullYear();

  // Close menus when clicking outside
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (lng: Language) => {
    i18n.changeLanguage(lng);
    setShowLanguageMenu(false);
  };

  const languages = [
    { code: "en", label: "EN" },
    { code: "kiny", label: "KINY" },
    { code: "fr", label: "FR" },
  ];

  const currentLangLabel = languages.find(l => l.code === i18n.language)?.label || "EN";

  return (
    <div className="font-heebo dark:bg-[#0B1120] min-h-screen flex flex-col">
      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-[100] backdrop-blur-xl bg-white/80 dark:bg-[#0B1120]/80 border-b border-gray-100 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to='/' className="flex items-center gap-2 group outline-none">
            <img src="./logoOne.svg" alt="Katisha Logo" className="h-8 md:h-10 dark:invert transition-transform group-hover:scale-105" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            
            {/* Custom Language Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button 
                onClick={() => setShowLanguageMenu(!showLanguageMenu)} 
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium text-sm md:text-base outline-none focus:ring-2 focus:ring-brand/20"
              >
                <GrLanguage className="text-gray-500 dark:text-gray-400" />
                <span>{currentLangLabel}</span>
                <FiChevronDown className={`transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              <div className={`absolute top-12 right-0 w-32 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 py-2 origin-top z-50 overflow-hidden transition-all duration-200 ${showLanguageMenu ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as Language)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${i18n.language === lang.code ? 'text-brand bg-brand/5 dark:bg-brand/10' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <DarkModeToggle />

            {/* Auth Buttons - Hidden on very small screens to save space, but visible normally */}
            <div className="hidden sm:flex items-center gap-3 border-l border-gray-200 dark:border-white/10 pl-4 md:pl-6 ml-1 md:ml-2">
              <Link to={'/login'} className="font-bold text-gray-700 dark:text-gray-300 hover:text-brand dark:hover:text-brand px-4 py-2 rounded-xl transition-colors">
                {t("login")}
              </Link>
              <Link to='/signup' className="font-bold px-6 py-2.5 bg-brand text-white rounded-xl shadow-md shadow-brand/20 hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 transition-all active:scale-95">
                {t("signup")}
              </Link>
            </div>

            {/* User Profile Area */}
            <div className="relative ml-1 sm:ml-4" ref={profileMenuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center justify-center rounded-full hover:ring-4 ring-brand/10 transition-all outline-none"
              >
                <BiSolidUserCircle className="text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 transition-colors" size={44} />
              </button>

              <div className={`absolute right-0 top-14 w-56 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/60 py-2 origin-top-right z-50 transition-all duration-200 ${showProfileMenu ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <BiSolidUserCircle className="w-full h-full text-brand/70" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {user ? `${user.first_name} ${user.last_name}` : "Passenger"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || "Manage your bookings"}
                    </p>
                  </div>
                </div>
                <Link 
                  to='/profile' 
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-brand dark:hover:text-brand transition-colors mx-2 rounded-xl"
                >
                  <FiUser size={16} />
                  {t('profile', 'Settings')}
                </Link>
                <button 
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mx-2 rounded-xl w-full text-left mt-1"
                >
                  <FiLogOut size={16} />
                  {t('logout', 'Log out')}
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>

      {/* Footer */}
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
            © {currentYear} Katisha Online. {t("allRights", "All rights reserved.")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
