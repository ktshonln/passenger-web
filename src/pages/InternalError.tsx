import LogoName from "../components/LogoName";
import { BiWrench } from "react-icons/bi";

const InternalError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand to-[#1E99FF] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden font-inter">
      {/* Decorative Circles */}
      <div className="absolute top-[10%] left-[-5%] w-96 h-96 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-72 h-72 bg-black/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <LogoName className="w-32 sm:w-40 mb-12 text-white/50" />
        
        <h1 className="text-[8rem] sm:text-[12rem] font-black leading-none drop-shadow-2xl opacity-90 tracking-tighter mb-4 text-white">
          500
        </h1>
        
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight text-white">
          Oops, The Engine Stalled.
        </h2>
        
        <p className="text-white/80 text-lg md:text-xl max-w-xl mb-10">
          We experienced a critical system failure while processing your request. Our mechanics have been notified and are fixing the infrastructure immediately.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-[#0E8BF1] px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3"
        >
          <BiWrench size={24} />
          Retry Connection
        </button>
      </div>
    </div>
  );
};

export default InternalError;
