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

    // 1. Calculate Target from Requirements
    requirementsData.forEach((p) => {
      if (!selectedPlant || selectedPlant === "All" || p.plant === selectedPlant) {
        totalReq += p.totalRequirement || 0;
      }
    });

    // 2. Calculate Live Attendance
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
    
    // Efficiency: (Present / Allotted)
    const efficiency = totalAllotted > 0 ? ((totalPresent / totalAllotted) * 100).toFixed(1) : "0.0";
    
    // NEW: Shortfall Percentage (Absent / Allotted)
    const shortfallPercentage = totalAllotted > 0 ? ((totalAbsent / totalAllotted) * 100).toFixed(1) : "0.0";
    
    const gap = Math.max(totalReq - totalPresent, 0);

    return { totalAllotted, totalPresent, totalAbsent, efficiency, shortfallPercentage, totalReq, gap };
  }, [selectedPlant, selectedMonth]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      {/* KPI: TOTAL CAPACITY */}
      <KPICard 
        title="Total Capacity" 
        value={kpiStats.totalAllotted} 
        subText="Allotted Manpower"
        icon="⚙️"
        variant="blue" 
      />

      {/* KPI: TOTAL PRESENT */}
      <KPICard 
        title="Live Presence" 
        value={kpiStats.totalPresent} 
        subText={`${kpiStats.efficiency}% Presence Rate`}
        icon="🛠️"
        variant="gold" 
      />

      {/* KPI: MANPOWER SHORTFALL (Updated with Percentage) */}
      <KPICard 
        title="Shortfall" 
        value={kpiStats.totalAbsent} 
        subText={`${kpiStats.shortfallPercentage}% Shortfall Rate`}
        icon="⚠️"
        variant="rose" 
      />

      {/* KPI: TARGET VARIANCE */}
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
    <div className={`p-6 rounded-[2rem] border-l-8 shadow-lg transition-transform hover:scale-[1.02] ${styles[variant]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xs font-black uppercase tracking-widest mb-1 ${labelColors[variant]}`}>
            {title}
          </h3>
          <p className="text-4xl font-black">{value}</p>
        </div>
        <span className="text-2xl bg-white/10 p-2 rounded-xl">{icon}</span>
      </div>
      <div className={`text-[11px] font-bold ${variant === 'blue' || variant === 'slate' ? 'text-white/60' : 'text-slate-400'}`}>
        {subText}
      </div>
    </div>
  );
}