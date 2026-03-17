import React, { useState, useEffect } from "react";
import FilterBar from "../components/filters/FilterBar";
import { FilterProvider } from "../context/FilterContext";
import KPISection from "../components/dashboard/KPISection";
import AttendanceGrid from "../components/dashboard/AttendanceGrid";
import DayNightMonitoring from "../components/dashboard/DayNightMonitoring"; 

import Lottie from "lottie-react";
import gearAnimation from "../assets/Steampunkmechanism.json";
import kpLogo from "../assets/kp.jpg";

export default function Dashboard() {
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: [], yesterday: [] });
  const [lastSync, setLastSync] = useState("");

  const fetchShiftData = async () => {
    try {
      const response = await fetch('/api/update');
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error("Data received is not an array:", data);
        return;
      }

      setLiveData(data);
      setLastSync(new Date().toLocaleTimeString());
      
      // --- LOGIC TO SPLIT DATA BY DATE ---
      const now = new Date();
      const todayStr = now.toDateString(); // e.g., "Tue Mar 17 2026"

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      // Filter logic to isolate specific days
      const todayEntries = data.filter(entry => 
        entry.timestamp && new Date(entry.timestamp).toDateString() === todayStr
      );
      
      const yesterdayEntries = data.filter(entry => 
        entry.timestamp && new Date(entry.timestamp).toDateString() === yesterdayStr
      );

      setStats({ today: todayEntries, yesterday: yesterdayEntries });

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

  return (
    <FilterProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans transition-all duration-300">
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
                    {loading ? "Syncing..." : `Live as of ${lastSync}`}
                  </div>
                  <div className="text-[10px] md:text-xs font-bold px-3 py-1 bg-slate-200 rounded-full text-slate-600">
                    Yesterday: {stats.yesterday.length} entries
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 bg-slate-50 px-8 py-3 rounded-[2rem] border border-slate-200 shadow-inner">
              <div className="w-24 h-24 transform scale-110">
                <Lottie animationData={gearAnimation} loop={true} />
              </div>
              <div className="border-l-2 border-slate-200 pl-6">
                <p className="text-[10px] font-black text-slate-400 leading-tight uppercase tracking-widest">
                  System 4.0 <br /> 
                  <span className="text-[#0055A4] text-xs">Analytics Mode</span>
                </p>
              </div>
            </div>
          </header>

          <section className="sticky top-[75px] md:top-24 z-50"> 
            <FilterBar />
          </section>

          {/* KPI SECTION: Passing only today's entries for the big numbers */}
          <KPISection 
            liveData={stats.today} 
            yesterdayData={stats.yesterday} 
          />

          {/* MONITORING: Focusing on today's shift performance */}
          <div className="bg-white/30 md:bg-white/50 rounded-2xl md:rounded-[3rem] p-1 md:p-2">
             <DayNightMonitoring liveData={stats.today} />
          </div>

          {/* DETAILED ROSTER: Showing today's logs by default */}
          <div className="pt-6 md:pt-12">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-widest">
                Today's Attendance Log ({new Date().toLocaleDateString()})
              </h2>
              <div className="h-[2px] flex-grow bg-slate-200 rounded-full"></div>
            </div>
            <AttendanceGrid liveData={stats.today} />
          </div>

          <footer className="text-center py-6 md:py-10 opacity-30 text-[8px] font-bold uppercase tracking-[0.3em]">
            © 2026 KP Reliable Technique India Pvt. Ltd.
          </footer>
        </div>
      </div>
    </FilterProvider>
  );
}