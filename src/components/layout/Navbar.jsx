import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import requirementsData from "../../data/requirements.json";
import attendanceData from "../../data/attendance.json";
import kpLogo from "../../assets/kp.jpg";

export default function Navbar() {
  const location = useLocation();

  // Calculate Global Live Stats for the Navbar Tracker
  const globalStats = useMemo(() => {
    let totalReq = 0;
    let totalPres = 0;

    // Sum Requirements
    requirementsData.forEach((r) => {
      totalReq += r.totalRequirement || 0;
    });

    // Sum Live Attendance
    attendanceData.forEach((plant) => {
      plant.shifts?.forEach((shift) => {
        totalPres += shift.attendance?.filter((a) => a === 1).length || 0;
      });
    });

    return { totalReq, totalPres };
  }, []);

  return (
    <nav className="bg-[#0055A4] text-white shadow-2xl sticky top-0 z-[100]">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LEFT SIDE: LOGO & LINKS */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-1.5 rounded-lg shadow-md group-hover:scale-110 transition-transform">
              <img src={kpLogo} alt="KP Logo" className="h-8 w-8 object-contain" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase hidden md:block">
              KP <span className="text-amber-400">Reliable</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <NavLink 
              to="/" 
              label="Dashboard" 
              active={location.pathname === "/"} 
            />
            {/* Add more NavLinks here as you create pages */}
          </div>
        </div>

        {/* RIGHT SIDE: LIVE DATA TRACKER */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-5 py-2 gap-6">
            <div className="text-center border-r border-white/20 pr-6">
              <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest leading-none mb-1">Total Requirement</p>
              <p className="text-xl font-black text-white leading-none">{globalStats.totalReq}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-amber-300 uppercase tracking-widest leading-none mb-1">Current Present</p>
              <p className="text-xl font-black text-amber-400 leading-none">{globalStats.totalPres}</p>
            </div>
          </div>

          {/* User Profile / Status Circle */}
          <div className="h-10 w-10 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
            <span className="text-blue-900 font-black text-xs">KPRT</span>
          </div>
        </div>

      </div>
    </nav>
  );
}

// Sub-component for Nav Links with Professional Underline Hover
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
        <span className="absolute bottom-[-10px] left-0 w-full h-1 bg-amber-400 rounded-t-full"></span>
      )}
    </Link>
  );
}