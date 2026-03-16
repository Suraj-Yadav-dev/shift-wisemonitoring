import React from "react";
// Navbar import removed from here
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
    // FilterProvider is already in App.jsx, but keeping it here as a safety wrapper is fine
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      
      {/* 1. TOP NAVBAR REMOVED FROM HERE TO PREVENT DUPLICATION */}

      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* 2. SECONDARY HEADER / BRANDING */}
        <header className="bg-white rounded-[2.5rem] shadow-xl p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between border-b-[10px] border-[#0055A4]">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="p-4 bg-white rounded-3xl shadow-lg border border-slate-100">
              <img 
                src={kpLogo} 
                alt="KP Reliable Logo" 
                className="w-24 h-24 object-contain" 
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-800 uppercase leading-none">
                KP Reliable Technique <span className="text-[#0055A4]">India</span>
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3 text-slate-500 font-bold text-sm mt-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Real-time Industrial Manpower Monitoring
              </div>
            </div>
          </div>

          {/* AUTOMOBILE PARTS ANIMATION */}
          <div className="hidden lg:flex items-center gap-6 bg-slate-50 px-8 py-3 rounded-[2rem] border border-slate-200 shadow-inner mt-6 lg:mt-0">
            <div className="w-28 h-28 transform scale-125">
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

        {/* 3. GLOBAL FILTERS (Sticky) */}
        <section className="sticky top-24 z-50"> 
          <FilterBar />
        </section>

        {/* 4. KPI ANALYTICS */}
        <KPISection />

        {/* 5. SHIFT PERFORMANCE COMPARISON */}
        <div className="bg-white/50 rounded-[3rem] p-2">
           <DayNightMonitoring />
        </div>

        {/* 6. DETAILED ROSTER */}
        <div className="pt-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">
              Detailed Plant Roster
            </h2>
            <div className="h-[2px] flex-grow bg-slate-200 rounded-full"></div>
          </div>
          <AttendanceGrid />
        </div>

        <footer className="text-center py-10 opacity-30 text-[10px] font-bold uppercase tracking-[0.3em]">
          © 2026 KP Reliable Technique India Pvt. Ltd.
        </footer>

      </div>
    </div>
  );
}