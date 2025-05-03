// DarkModeToggle.jsx
import { useEffect, useState } from "react";
import { BiSolidMoon } from "react-icons/bi";

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
      className="cursor-pointer ml-3 mr-3"
    >
      {darkMode ? "☀️" : <BiSolidMoon size={20}/>}
    </button>
  );
};

export default DarkModeToggle;
