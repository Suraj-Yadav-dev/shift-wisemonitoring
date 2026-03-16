import React, { useMemo } from "react";
import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import requirementsData from "../../data/requirements.json";

export default function KPISection() {
  const { selectedPlant, selectedMonth } = useFilter();

  const kpiStats = useMemo(() => {
    let totalAllotted = 0;
    let totalPresent = 0;
    let totalReq = 0;

    requirementsData.forEach((p) => {
      if (!selectedPlant || selectedPlant === "All" || p.plant === selectedPlant) {
        totalReq += p.totalRequirement || 0;
      }
    });

    attendanceData.forEach((plant) => {
      if (!selectedPlant || selectedPlant === "All" || plant.plant === selectedPlant) {
        plant.shifts?.forEach((shift) => {
          const monthMatch = !selectedMonth || selectedMonth === "All" || shift.month === selectedMonth;
          if (monthMatch) {
            totalAllotted += shift.allotted || 0;
            totalPresent += shift.attendance?.filter((a) => a === 1).length || 0;
          }
        });
      }
    });

    const totalAbsent = Math.max(totalAllotted - totalPresent, 0);
    const efficiency = totalAllotted > 0 ? ((totalPresent / totalAllotted) * 100).toFixed(1) : "0.0";
    const shortfallPercentage = totalAllotted > 0 ? ((totalAbsent / totalAllotted) * 100).toFixed(1) : "0.0";
    const gap = Math.max(totalReq - totalPresent, 0);

    return { totalAllotted, totalPresent, totalAbsent, efficiency, shortfallPercentage, totalReq, gap };
  }, [selectedPlant, selectedMonth]);

  return (
    /* Responsive Grid Logic:
       - grid-cols-1: Mobile (Single Column)
       - sm:grid-cols-2: Tablets / Small Laptops
       - lg:grid-cols-4: Desktop (Full Width)
    */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 px-2 md:px-0">
      
      <KPICard 
        title="Total Capacity" 
        value={kpiStats.totalAllotted} 
        subText="Allotted Manpower"
        icon="⚙️"
        variant="blue" 
      />

      <KPICard 
        title="Live Presence" 
        value={kpiStats.totalPresent} 
        subText={`${kpiStats.efficiency}% Presence Rate`}
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
        subText={`Vs. Target (${kpiStats.totalReq})`}
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
    /* Internal Card Responsiveness:
       - Reduced p-6 to p-5 for mobile to save space
       - Reduced rounded-[2rem] to rounded-3xl for better fit
       - Adjusted text sizes with sm: modifiers
    */
    <div className={`p-5 md:p-6 rounded-3xl md:rounded-[2rem] border-l-[6px] md:border-l-8 shadow-lg transition-all duration-300 hover:scale-[1.02] ${styles[variant]}`}>
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className="min-w-0"> {/* Prevents text overflow */}
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