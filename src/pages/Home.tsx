import { useState, useRef, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { MdOutlineLocationOn } from "react-icons/md";
import useLocations from "../hooks/useLocations";
import { BsTicketFill } from "react-icons/bs";
import LogoName from "../components/LogoName";

function Home() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: BUS_ROUTES } = useLocations();

  // Close dropdown when clicking outside
  useEffect(() => {
    setMounted(true); // Trigger fade-in for background vectors

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

  // Filter routes based on query using smart tokenized matching
  const filteredSuggestions = (query.trim() !== ""
    ? BUS_ROUTES?.pages.flat().filter((route) => {
      const searchTokens = query.toLowerCase().trim().split(/\s+/);
      const routeLower = route.toLowerCase();
      // Route must contain every typed word regardless of exact formatting or order
      return searchTokens.every(token => routeLower.includes(token));
    })
    : []) ?? [];

  const showDropdown = isFocused && query.trim() !== "";

  const handleSelect = (route: string) => {
    setQuery(route);
    setIsFocused(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-20">

      {/* Decorative Floating Tickets matching the mockup aesthetic */}
      <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-[1200ms] ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 sm:translate-x-24'}`}>
        <BsTicketFill className="hidden md:block absolute top-[20%] right-[25%] w-32 h-32 text-[#289CFD] rotate-12" />
        <BsTicketFill className="absolute top-[15%] left-[10%] w-16 h-16 md:w-24 md:h-24 text-[#289CFD] rotate-12 opacity-50 md:opacity-100" />
        <BsTicketFill className="absolute bottom-[25%] left-[20%] w-24 h-24 md:w-40 md:h-40 text-[#289CFD] rotate-6 opacity-30 md:opacity-100" />
        <BsTicketFill className="hidden sm:block absolute bottom-[30%] right-[15%] w-20 h-20 text-[#289CFD] rotate-45" />
        <BsTicketFill className="hidden lg:block absolute top-[60%] right-[5%] w-16 h-16 text-[#289CFD] rotate-12" />
        <BsTicketFill className="hidden md:block absolute top-[50%] right-[0%] w-5 h-5 text-[#289CFD] -rotate-12" />
        <BsTicketFill className="hidden md:block absolute top-[75%] left-[5%] w-40 h-40 text-[#289CFD] rotate-[30deg]" />
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center relative z-10">
        <LogoName className="w-48 sm:w-52 h-full mb-5 text-white" />

        <div
          ref={dropdownRef}
          className={`w-full relative z-50 bg-white transition-all duration-300 font-inter ${showDropdown ? 'rounded-3xl shadow-2xl' : 'rounded-[2rem] shadow-2xl shadow-black/10 hover:shadow-black/20'}`}
        >
          <form
            onSubmit={(e) => { e.preventDefault() }}
            className="flex items-center p-1 w-full"
          >
            <AiOutlineSearch
              size={32}
              className={`ml-3 transition-colors duration-300 ${isFocused ? "text-[#0E8BF1]" : "text-gray-400"}`}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Murifuza kujya he?"
              className="w-full outline-none bg-transparent text-gray-900 text-xl placeholder-gray-400 ml-4 py-3 border-none ring-0 focus:ring-0"
            />
          </form>

          {/* Suggestions Dropdown */}
          <div
            className={`w-full grid transition-all duration-300 ease-in-out ${showDropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ gridTemplateRows: showDropdown ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-100 pb-3 mt-1 text-gray-900">
                {filteredSuggestions.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto w-full custom-scroll scroll-smooth overscroll-contain">
                    {filteredSuggestions.map((route, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelect(route)}
                        className="w-full text-left flex items-center px-6 py-3.5 hover:bg-gray-50 transition-colors group"
                      >
                        <MdOutlineLocationOn
                          className="text-gray-400 group-hover:text-[#0E8BF1] mr-4 transition-colors shrink-0"
                          size={24}
                        />
                        <span className="text-gray-700 font-semibold group-hover:text-gray-900">{route}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-6 text-gray-400 text-center font-medium font-inter">
                    No destinations found for "{query}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-white/90 text-center text-sm md:text-base max-w-lg tracking-wide">
          Shyiramo akarere wifuza kujyamo, maze ugure itike utavuye aho uri!
        </p>
      </div>
    </div>
  );
}

export default Home;
