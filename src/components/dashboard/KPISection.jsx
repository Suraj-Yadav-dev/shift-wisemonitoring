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

    // 2. Helper function for consistent Filtering
    const filterEntry = (entry) => {
      const plantMatch = !selectedPlant || selectedPlant === "All" || entry.project === selectedPlant;
      
      const entryDate = new Date(entry.timestamp);
      const entryMonth = entryDate.toLocaleString('default', { month: 'long' });
      const monthMatch = !selectedMonth || selectedMonth === "All" || entryMonth === selectedMonth;

      return plantMatch && monthMatch;
    };

    // 3. Process Today's Live Data (Passed as liveData prop)
    liveData.forEach((entry) => {
      if (filterEntry(entry)) {
        totalAllotted += Number(entry.target) || 0;
        totalPresent += Number(entry.achievement) || 0;
      }
    });

    // 4. Process Yesterday's Data for Trend Analysis
    yesterdayData.forEach((entry) => {
      if (filterEntry(entry)) {
        yesterdayPresent += Number(entry.achievement) || 0;
      }
    });

    // 5. Calculations
    const totalAbsent = Math.max(totalAllotted - totalPresent, 0);
    const efficiency = totalAllotted > 0 ? ((totalPresent / totalAllotted) * 100).toFixed(1) : "0.0";
    const shortfallPercentage = totalAllotted > 0 ? ((totalAbsent / totalAllotted) * 100).toFixed(1) : "0.0";
    const gap = Math.max(totalReq - totalPresent, 0);
    
    // Trend: Difference between today and yesterday
    const trend = totalPresent - yesterdayPresent;

    return { 
      totalAllotted, 
      totalPresent, 
      totalAbsent, 
      efficiency, 
      shortfallPercentage, 
      totalReq, 
      gap,
      trend 
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
        subText={`Vs. Overall Goal (${kpiStats.totalReq})`}
        icon="📊"
        variant="slate" 
      />

    </div>
  );
}

function KPICard({ title, value, subText, icon, variant }) {
  const styles = {
    blue: "bg-[#0055A4] text-white border-blue-700",
    gold: "bg-white border-amber-400 text-slate-800",
    rose: "bg-white border-rose-500 text-slate-800",
    slate: "bg-slate-800 text-white border-slate-700"
  };

  const labelColors = {
    blue: "text-blue-200",
    gold: "text-slate-400",
    rose: "text-slate-400",
    slate: "text-slate-400"
  };

  return (
    <div className={`p-5 md:p-6 rounded-3xl md:rounded-[2.5rem] border-l-[6px] md:border-l-8 shadow-lg transition-all duration-300 hover:scale-[1.02] ${styles[variant]}`}>
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className="min-w-0">
          <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 truncate ${labelColors[variant]}`}>
            {title}
          </h3>
          <p className="text-3xl md:text-4xl font-black break-words leading-none">
            {value}
          </p>
        </div>
        <span className="text-xl md:text-2xl bg-white/10 p-2 rounded-xl shrink-0">
          {icon}
        </span>
      </div>
      <div className={`text-[10px] md:text-[11px] font-bold truncate ${variant === 'blue' || variant === 'slate' ? 'text-white/60' : 'text-slate-400'}`}>
        {subText}
      </div>
    </div>
  );
}