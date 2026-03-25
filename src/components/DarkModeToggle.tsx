import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const DarkModeToggle = () => {
  // Initialize state from localStorage, default to false (light)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((prev) => !prev)}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors overflow-hidden outline-none mx-1"
      aria-label="Toggle Dark Mode"
    >
      <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${darkMode ? "rotate-90 opacity-0 transform scale-50" : "rotate-0 opacity-100 transform scale-100"}`}>
         <FiSun size={20} className="text-amber-500" />
      </div>
      <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${darkMode ? "rotate-0 opacity-100 transform scale-100" : "-rotate-90 opacity-0 transform scale-50"}`}>
         <FiMoon size={20} className="text-blue-400" />
      </div>
    </button>
  );
};

export default DarkModeToggle;
