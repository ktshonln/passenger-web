import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineSearch } from "react-icons/ai";
import { MdOutlineLocationOn } from "react-icons/md";

const BUS_ROUTES = [
  "Kigali - Muhanga",
  "Kigali - Musanze",
  "Kigali - Rubavu",
  "Kigali - Nyagatare",
  "Kigali - Huye",
  "Kigali - Rusizi",
  "Muhanga - Karongi",
  "Musanze - Rubavu"
];

function Home() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter routes based on query
  const filteredSuggestions = query.trim() !== ""
    ? BUS_ROUTES.filter((route) =>
        route.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const showDropdown = isFocused && query.trim() !== "";

  const handleSelect = (route: string) => {
    setQuery(route);
    setIsFocused(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 md:px-0">
      <div className="w-full max-w-2xl flex flex-col items-center relative">
        <img 
          src="./logoTwo.svg" 
          alt="Logo" 
          className="dark:invert w-48 mb-10 transition-transform duration-300 hover:scale-105" 
        />
        
        <div ref={dropdownRef} className="w-full relative z-50">
          <form 
            onSubmit={(e) => e.preventDefault()}
            className={`flex items-center space-x-4 p-3 w-full transition-all duration-300 ${
              showDropdown 
                ? "bg-white dark:bg-black shadow-lg shadow-neutral-300 dark:shadow-gray-700/50 rounded-t-3xl border-b border-gray-100 dark:border-gray-800"
                : "bg-[#E2E8F0] dark:bg-gray-800 shadow-sm shadow-neutral-400 dark:shadow-gray-500 rounded-full hover:shadow-md"
            }`}
          >
            <AiOutlineSearch 
              size={28} 
              className={`ml-2 transition-colors duration-300 ${
                isFocused ? "text-brand2" : "text-gray-400"
              }`} 
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={t("searchPlaceholder")}
              className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-100 text-lg placeholder-gray-500"
            />
          </form>

          {/* Suggestions Dropdown */}
          <div className={`absolute top-full left-0 right-0 bg-white dark:bg-black shadow-lg shadow-neutral-300 dark:shadow-gray-700/50 rounded-b-3xl overflow-hidden border-t border-gray-100 dark:border-gray-800 transition-all duration-200 z-40 transform origin-top ${showDropdown ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
            <div className="pb-2">
              {filteredSuggestions.length > 0 ? (
                <div className="max-h-64 overflow-y-auto w-full custom-scroll">
                  {filteredSuggestions.map((route, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(route)}
                      className="w-full text-left flex items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <MdOutlineLocationOn 
                        className="text-gray-400 group-hover:text-brand2 mr-4 transition-colors" 
                        size={22} 
                      />
                      <span className="text-gray-700 dark:text-gray-200 font-medium">{route}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-4 text-gray-500 text-center">
                  No routes found for "{query}"
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-16 text-neutral-500 dark:text-neutral-400 text-center text-sm md:text-base">
          {t("explainer")}
        </p>
      </div>
    </div>
  );
}

export default Home;
