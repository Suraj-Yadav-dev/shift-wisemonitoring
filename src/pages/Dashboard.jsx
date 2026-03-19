import React, { useState, useEffect, useCallback } from "react";
import FilterBar from "../components/filters/FilterBar";
import { FilterProvider } from "../context/FilterContext";
import KPISection from "../components/dashboard/KPISection";
import AttendanceGrid from "../components/dashboard/AttendanceGrid";
import DayNightMonitoring from "../components/dashboard/DayNightMonitoring"; 
import Navbar from "../components/layout/Navbar";

import Lottie from "lottie-react";
import gearAnimation from "../assets/Steampunkmechanism.json";
import kpLogo from "../assets/kp.jpg";

export default function Dashboard() {
  const [allData, setAllData] = useState([]); // Stores everything from Google
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [stats, setStats] = useState({ current: [], comparison: [] });
  const [lastSync, setLastSync] = useState("");

  // Logic to filter data whenever allData or viewDate changes
  const applyFilters = useCallback((data, selectedDate) => {
    const target = new Date(selectedDate);
    const targetStr = target.toDateString();

    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const currentEntries = data.filter(entry => 
      entry.timestamp && new Date(entry.timestamp).toDateString() === targetStr
    );

    const comparisonEntries = data.filter(entry => 
      entry.timestamp && new Date(entry.timestamp).toDateString() === yesterdayStr
    );

    setStats({ current: currentEntries, comparison: comparisonEntries });
  }, []);

  const fetchShiftData = async () => {
    try {
      const response = await fetch('/api/update');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllData(data);
        setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        applyFilters(data, viewDate);
      }
    } catch (error) {
      console.error("Critical error in fetchShiftData:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
    const interval = setInterval(fetchShiftData, 300000); 
    return () => clearInterval(interval);
  }, []);

  // Re-filter when user changes the date
  useEffect(() => {
    if (allData.length > 0) {
      applyFilters(allData, viewDate);
    }
  }, [viewDate, allData, applyFilters]);

  return (
    <FilterProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans transition-all duration-300">
        
        {/* Navbar receives data based on the selected date */}
        <Navbar liveData={stats.current} />

        <div className="max-w-[1600px] mx-auto p-3 sm:p-6 md:p-8 space-y-6 md:space-y-8">
          
          {/* HEADER */}
          <header className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl p-5 md:p-10 flex flex-col lg:flex-row items-center justify-between border-b-[6px] md:border-b-[10px] border-[#0055A4] gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
              <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-100 shrink-0">
                <img src={kpLogo} alt="Logo" className="w-16 h-16 md:w-24 md:h-24 object-contain" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-800 uppercase leading-tight">
                  KP Reliable Technique <span className="text-[#0055A4]">India</span>
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-sm">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    {loading ? "Syncing..." : `Status: ${new Date(viewDate).toDateString()}`}
                  </div>
                  <div className="text-[10px] md:text-xs font-bold px-3 py-1 bg-slate-200 rounded-full text-slate-600 uppercase tracking-widest">
                    Last Sync: {lastSync}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 bg-slate-50 px-8 py-3 rounded-[2rem] border border-slate-200 shadow-inner">
              <div className="w-24 h-24 transform scale-110">
                <Lottie animationData={gearAnimation} loop={true} />
              </div>
              <div className="border-l-2 border-slate-200 pl-6 text-left">
                <p className="text-[10px] font-black text-slate-400 leading-tight uppercase tracking-widest">
                  System 4.0 <br /> 
                  <span className="text-[#0055A4] text-xs">Analytics Mode</span>
                </p>
              </div>
            </div>
          </header>

          {/* DATE & YEAR SELECTOR BAR */}
          <div className="sticky top-[85px] z-[60] flex flex-wrap items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg border-l-8 border-amber-400 gap-4">
             <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl">📅</div>
                <span className="font-black uppercase text-slate-700 tracking-tight text-sm sm:text-base">History Viewer</span>
             </div>
             <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={viewDate}
                  onChange={(e) => setViewDate(e.target.value)}
                  className="bg-slate-100 border-none rounded-xl px-4 py-2 font-black text-[#0055A4] focus:ring-2 focus:ring-amber-400 outline-none transition-all"
                />
                <button 
                  onClick={() => setViewDate(new Date().toISOString().split('T')[0])}
                  className="bg-amber-400 text-blue-900 px-4 py-2 rounded-xl font-black text-xs uppercase hover:bg-amber-500 transition-colors"
                >
                  Reset
                </button>
             </div>
          </div>

          <section className="z-50"> 
            <FilterBar />
          </section>

          <KPISection 
            liveData={stats.current} 
            yesterdayData={stats.comparison} 
          />

          <div className="bg-white/30 md:bg-white/50 rounded-2xl md:rounded-[3rem] p-1 md:p-2">
             <DayNightMonitoring liveData={stats.current} />
          </div>

          <div className="pt-6 md:pt-12">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-widest">
                Attendance Log: {new Date(viewDate).toLocaleDateString('en-GB')}
              </h2>
              <div className="h-[2px] flex-grow bg-slate-200 rounded-full"></div>
            </div>
            <AttendanceGrid liveData={stats.current} />
          </div>

          <footer className="text-center py-6 md:py-10 opacity-30 text-[8px] font-bold uppercase tracking-[0.3em]">
            © 2026 KP Reliable Technique India Pvt. Ltd. | History Mode Enabled
          </footer>
        </div>
      </div>
    </FilterProvider>
  );
}