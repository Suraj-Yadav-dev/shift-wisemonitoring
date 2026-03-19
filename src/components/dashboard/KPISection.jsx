import React, { useMemo } from "react";
import { useFilter } from "../../context/FilterContext";
import requirementsData from "../../data/requirements.json";

export default function KPISection({ liveData = [], yesterdayData = [] }) {
  const { selectedPlant, selectedMonth } = useFilter();

  const kpiStats = useMemo(() => {
    let totalAllotted = 0;
    let totalPresent = 0;
    let totalReq = 0;
    let yesterdayPresent = 0;

    // 1. Static Requirements Logic
    requirementsData.forEach((p) => {
      if (!selectedPlant || selectedPlant === "All" || p.plant === selectedPlant) {
        totalReq += p.totalRequirement || 0;
      }
    });

    const filterEntry = (entry) => {
      const plantMatch = !selectedPlant || selectedPlant === "All" || entry.project === selectedPlant;
      const entryDate = new Date(entry.timestamp);
      const entryMonth = entryDate.toLocaleString('default', { month: 'long' });
      const monthMatch = !selectedMonth || selectedMonth === "All" || entryMonth === selectedMonth;
      return plantMatch && monthMatch;
    };

    liveData.forEach((entry) => {
      if (filterEntry(entry)) {
        totalAllotted += Number(entry.target) || 0;
        totalPresent += Number(entry.achievement) || 0;
      }
    });

    yesterdayData.forEach((entry) => {
      if (filterEntry(entry)) {
        yesterdayPresent += Number(entry.achievement) || 0;
      }
    });

    // --- CALCULATIONS ---
    const totalAbsent = Math.max(totalAllotted - totalPresent, 0);
    const efficiency = totalAllotted > 0 ? ((totalPresent / totalAllotted) * 100).toFixed(1) : "0.0";
    const shortfallPercentage = totalAllotted > 0 ? ((totalAbsent / totalAllotted) * 100).toFixed(1) : "0.0";
    
    // Gap Logic: Difference between required (master plan) and current actual
    const gap = Math.max(totalReq - totalPresent, 0);
    const gapPercentage = totalReq > 0 ? ((gap / totalReq) * 100).toFixed(1) : "0.0";
    
    const trend = totalPresent - yesterdayPresent;

    return { 
      totalAllotted, totalPresent, totalAbsent, 
      efficiency, shortfallPercentage, totalReq, 
      gap, gapPercentage, trend 
    };
  }, [selectedPlant, selectedMonth, liveData, yesterdayData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 px-2 md:px-0">
      
      <KPICard 
        title="Total Capacity" 
        value={kpiStats.totalAllotted} 
        subText="Target Manpower (Today)"
        icon="⚙️"
        variant="blue" 
      />

      <KPICard 
        title="Live Presence" 
        value={kpiStats.totalPresent} 
        subText={`${kpiStats.efficiency}% Efficiency ${kpiStats.trend >= 0 ? '↗︎' : '↘︎'}`}
        icon="🛠️"
        variant="gold" 
      />

      <KPICard 
        title="Shortfall" 
        value={kpiStats.totalAbsent} 
        subText={`${kpiStats.shortfallPercentage}% Shortfall Rate`}
        icon="⚠️"
        variant="rose" 
      />

      <KPICard 
        title="Production Gap" 
        value={kpiStats.gap} 
        subText={`${kpiStats.gapPercentage}% Deficit vs Goal (${kpiStats.totalReq})`}
        icon="📊"
        variant="slate" 
      />

    </div>
  );
}

function KPICard({ title, value, subText, icon, variant }) {
  const styles = {
    blue: "bg-gradient-to-br from-[#0055A4] to-[#003d75] text-white border-blue-400/30",
    gold: "bg-white text-slate-800 border-amber-400 shadow-amber-100",
    rose: "bg-white text-slate-800 border-rose-500 shadow-rose-100",
    slate: "bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-600"
  };

  const subStyles = {
    blue: "text-blue-100/80",
    gold: "text-slate-500",
    rose: "text-slate-500",
    slate: "text-slate-400"
  };

  return (
    <div className={`relative p-5 md:p-7 rounded-[2rem] border-b-4 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${styles[variant]}`}>
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl grayscale">
        {icon}
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current opacity-50"></span>
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl md:text-5xl font-black tracking-tighter">
              {value}
            </p>
            <span className="text-xs font-bold opacity-40 uppercase">Units</span>
          </div>
        </div>

        <div className={`mt-4 pt-4 border-t border-current/10 text-[10px] md:text-xs font-bold italic ${subStyles[variant]}`}>
          {subText}
        </div>
      </div>
    </div>
  );
}