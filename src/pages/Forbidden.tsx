import { Link } from "react-router-dom";
import { BiShieldX } from "react-icons/bi";
import LogoName from "../components/LogoName";

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col items-center justify-center text-gray-900 dark:text-white px-4 relative overflow-hidden font-inter transition-colors duration-300">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <LogoName className="w-32 sm:w-40 mb-10 text-gray-300 dark:text-gray-700" />
        
        <div className="w-24 h-24 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <BiShieldX size={48} />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight text-gray-900 dark:text-white">
          Access Denied
        </h1>
        
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-brand dark:text-[#88C9FF]">
          You don't have the right ticket for this zone.
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-10">
          This area is restricted to authorized personnel or specific account types. If you believe this is an error, please contact support.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/profile" 
            className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-8 py-3.5 rounded-xl font-bold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all active:scale-95"
          >
            My Profile
          </Link>
          <Link 
            to="/" 
            className="bg-brand text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-brand/20 hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95"
          >
            Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
