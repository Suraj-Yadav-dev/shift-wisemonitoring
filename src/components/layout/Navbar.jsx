import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import requirementsData from "../../data/requirements.json";
import kpLogo from "../../assets/kp.jpg";

export default function Navbar({ liveData = [] }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const globalStats = useMemo(() => {
    let totalReq = 0;
    let totalPres = 0;

    // 1. Static Requirements
    requirementsData.forEach((r) => { totalReq += r.totalRequirement || 0; });

    // 2. Dynamic presence based on the filtered data passed from Dashboard
    liveData.forEach((entry) => {
      totalPres += Number(entry.achievement) || 0;
    });

    return { totalReq, totalPres };
  }, [liveData]);

  return (
    <nav className="bg-[#0055A4] text-white shadow-2xl sticky top-0 z-[100] transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>

          <div className="flex items-center gap-4 lg:gap-10">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="bg-white p-1 rounded-lg shadow-md group-hover:scale-105 transition-transform">
                <img src={kpLogo} alt="KP Logo" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
              </div>
              <span className="font-black text-lg sm:text-xl tracking-tighter uppercase whitespace-nowrap">
                KP <span className="text-amber-400">Reliable</span>
              </span>
            </Link>

            {/* --- DESKTOP NAVIGATION LINKS --- */}
            <div className="hidden lg:flex items-center gap-2">
              <NavLink to="/" label="Dashboard" active={location.pathname === "/"} />
              <NavLink to="/charts" label="Charts" active={location.pathname === "/charts"} />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 px-3 py-1.5 sm:px-5 sm:py-2 gap-3 sm:gap-6">
              <div className="text-center border-r border-white/20 pr-3 sm:pr-6">
                <p className="text-[7px] sm:text-[9px] font-black text-blue-200 uppercase tracking-widest leading-none mb-1">Target</p>
                <p className="text-sm sm:text-xl font-black text-white leading-none">{globalStats.totalReq}</p>
              </div>
              <div className="text-center">
                <p className="text-[7px] sm:text-[9px] font-black text-amber-300 uppercase tracking-widest leading-none mb-1">Live</p>
                <p className="text-sm sm:text-xl font-black text-amber-400 leading-none">{globalStats.totalPres}</p>
              </div>
            </div>

            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg shrink-0">
              <span className="text-blue-900 font-black text-[10px] sm:text-xs">KPRT</span>
            </div>
          </div>
        </div>

        {/* --- MOBILE NAVIGATION LINKS --- */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6 pt-2 border-t border-white/10 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-bold transition-colors ${
                  location.pathname === "/" ? "bg-amber-400 text-blue-900" : "hover:bg-white/10 text-white"
                }`}
              >
                📊 Dashboard Summary
              </Link>
              
              <Link
                to="/charts"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-bold transition-colors ${
                  location.pathname === "/charts" ? "bg-amber-400 text-blue-900" : "hover:bg-white/10 text-white"
                }`}
              >
                📈 Analytics & Charts
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 ${
        active ? "text-amber-400" : "text-white hover:text-amber-200"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-[-24px] left-0 w-full h-1.5 bg-amber-400 rounded-t-full shadow-[0_-4px_10px_rgba(251,191,36,0.5)]"></span>
      )}
    </Link>
  );
}