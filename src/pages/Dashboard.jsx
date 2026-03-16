import React from "react";
import FilterBar from "../components/filters/FilterBar";
import { FilterProvider } from "../context/FilterContext";
import KPISection from "../components/dashboard/KPISection";
import AttendanceGrid from "../components/dashboard/AttendanceGrid";
import DayNightMonitoring from "../components/dashboard/DayNightMonitoring"; 

import Lottie from "lottie-react";
import gearAnimation from "../assets/Steampunkmechanism.json";
import kpLogo from "../assets/kp.jpg";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans transition-all duration-300">
      
      {/* Container with responsive padding: p-4 for mobile, p-8 for desktop */}
      <div className="max-w-[1600px] mx-auto p-3 sm:p-6 md:p-8 space-y-6 md:space-y-8">
        
        {/* 2. SECONDARY HEADER / BRANDING - Fully Responsive */}
        <header className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl p-5 md:p-10 flex flex-col lg:flex-row items-center justify-between border-b-[6px] md:border-b-[10px] border-[#0055A4] gap-6">
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            {/* Logo container scales for mobile */}
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100 shrink-0">
              <img 
                src={kpLogo} 
                alt="KP Reliable Logo" 
                className="w-16 h-16 md:w-24 md:h-24 object-contain" 
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-800 uppercase leading-tight">
                KP Reliable Technique <span className="text-[#0055A4]">India</span>
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-[10px] sm:text-xs md:text-sm">
                <span className="relative flex h-2 w-2 md:h-3 md:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-emerald-500"></span>
                </span>
                Real-time Industrial Manpower Monitoring
              </div>
            </div>
          </div>

          {/* AUTOMOBILE PARTS ANIMATION - Hidden on mobile/tablet, visible on large screens */}
          <div className="hidden lg:flex items-center gap-6 bg-slate-50 px-8 py-3 rounded-[2rem] border border-slate-200 shadow-inner">
            <div className="w-24 h-24 transform scale-110">
              <Lottie animationData={gearAnimation} loop={true} />
            </div>
            <div className="border-l-2 border-slate-200 pl-6">
              <p className="text-[10px] font-black text-slate-400 leading-tight uppercase tracking-widest">
                Excellence <br /> 
                <span className="text-slate-600 text-xs">Manufacturing</span> <br /> 
                System 4.0
              </p>
            </div>
          </div>
        </header>

        {/* 3. GLOBAL FILTERS (Sticky) 
            top-20 for mobile (assuming smaller navbar), top-24 for desktop 
        */}
        <section className="sticky top-[75px] md:top-24 z-50"> 
          <FilterBar />
        </section>

        {/* 4. KPI ANALYTICS - Handled inside KPISection.jsx for grid responsiveness */}
        <KPISection />

        {/* 5. SHIFT PERFORMANCE COMPARISON */}
        <div className="bg-white/30 md:bg-white/50 rounded-2xl md:rounded-[3rem] p-1 md:p-2">
           <DayNightMonitoring />
        </div>

        {/* 6. DETAILED ROSTER */}
        <div className="pt-6 md:pt-12">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-widest">
              Detailed Plant Roster
            </h2>
            <div className="h-[2px] flex-grow bg-slate-200 rounded-full"></div>
          </div>
          <AttendanceGrid />
        </div>

        <footer className="text-center py-6 md:py-10 opacity-30 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">
          © 2026 KP Reliable Technique India Pvt. Ltd.
        </footer>

      </div>
    </div>
  );
}