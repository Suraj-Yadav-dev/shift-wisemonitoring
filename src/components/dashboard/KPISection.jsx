import React, { useMemo, useState } from "react";
import { useFilter } from "../../context/FilterContext";
import requirementsData from "../../data/requirements.json";

export default function KPISection({ liveData = [], yesterdayData = [] }) {
  const { selectedPlant, selectedMonth, selectedShift } = useFilter();

  const kpiStats = useMemo(() => {
    let totalAllotted = 0;
    let totalPresent = 0;
    let totalReq = 0;
    let yesterdayPresent = 0;

    const filteredRequirements = requirementsData.filter((p) => {
      const match = !selectedPlant || selectedPlant === "All" || p.plant.trim() === selectedPlant.trim();
      if (match) totalReq += p.totalRequirement || 0;
      return match;
    });

    const filterEntry = (entry) => {
      const plantMatch = !selectedPlant || selectedPlant === "All" || entry.project === selectedPlant;
      const entryDate = new Date(entry.timestamp);
      const entryMonth = entryDate.toLocaleString('default', { month: 'long' });
      const monthMatch = !selectedMonth || selectedMonth === "All" || entryMonth === selectedMonth;
      const shiftMatch = !selectedShift || selectedShift === "All" || entry.shift === selectedShift;
      return plantMatch && monthMatch && shiftMatch;
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

    const totalAbsent = Math.max(totalAllotted - totalPresent, 0);
    const efficiency = totalAllotted > 0 ? ((totalPresent / totalAllotted) * 100).toFixed(1) : "0.0";
    const gap = Math.max(totalReq - totalPresent, 0);
    const gapPercentage = totalReq > 0 ? ((gap / totalReq) * 100).toFixed(1) : "0.0";
    const trend = totalPresent - yesterdayPresent;

    return { 
      totalAllotted, totalPresent, totalAbsent, 
      efficiency, totalReq, gap, gapPercentage, trend,
      filteredRequirements 
    };
  }, [selectedPlant, selectedMonth, selectedShift, liveData, yesterdayData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
        <KPICard title="Total Capacity" value={kpiStats.totalAllotted} subText="Target Manpower (Today)" icon="⚙️" variant="blue" />
        <KPICard title="Live Presence" value={kpiStats.totalPresent} subText={`${kpiStats.efficiency}% Efficiency ${kpiStats.trend >= 0 ? '↗︎' : '↘︎'}`} icon="🛠️" variant="gold" />
        <KPICard title="Shortfall" value={kpiStats.totalAbsent} subText="Gap vs Target" icon="⚠️" variant="rose" />
        <KPICard title="Production Gap" value={kpiStats.gap} subText={`${kpiStats.gapPercentage}% Deficit vs Goal (${kpiStats.totalReq})`} icon="📊" variant="slate" />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden mx-2 md:mx-0">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-4 bg-[#0055A4] rounded-full"></span>
            Project Breakdown & Requirements
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {kpiStats.filteredRequirements.map((item, idx) => (
            <ProjectDropdown key={idx} item={item} liveData={liveData} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectDropdown({ item, liveData }) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedShift } = useFilter();

  // Calculate live presence for this specific project
  const liveStats = useMemo(() => {
    let present = 0;
    liveData.forEach(entry => {
      // Logic to match project name and shift
      if (entry.project === item.plant) {
        if (!selectedShift || selectedShift === "All" || entry.shift === selectedShift) {
          present += Number(entry.achievement) || 0;
        }
      }
    });
    return present;
  }, [liveData, item.plant, selectedShift]);

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-all"
      >
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-800 text-lg uppercase">{item.plant}</span>
          <span className="px-3 py-1 bg-blue-50 text-[#0055A4] rounded-full text-[10px] font-black uppercase">
            Goal: {item.totalRequirement}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase">Live Presence</p>
            <p className="text-sm font-black text-emerald-600">{liveStats} Present</p>
          </div>
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}></span>
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 bg-slate-50/50">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Shift Name</th>
                  <th className="px-4 py-3 text-center">Standard Req.</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {item.shifts.map((shift, sIdx) => {
                  // Check if this shift is currently active in filters
                  const isFiltered = !selectedShift || selectedShift === "All" || shift.name === selectedShift;
                  
                  return (
                    <tr key={sIdx} className={isFiltered ? "bg-blue-50/30" : "opacity-40"}>
                      <td className="px-4 py-3 font-bold text-slate-700 text-sm">{shift.name}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-600">
                        {shift.requirement || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-1 rounded text-[9px] font-black uppercase ${isFiltered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {isFiltered ? "Monitored" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#0055A4] rounded-xl text-white">
               <p className="text-[9px] font-bold uppercase opacity-70">Total Project Goal</p>
               <p className="text-xl font-black">{item.totalRequirement}</p>
            </div>
            <div className="p-3 bg-emerald-500 rounded-xl text-white">
               <p className="text-[9px] font-bold uppercase opacity-70">Actual Present</p>
               <p className="text-xl font-black">{liveStats}</p>
            </div>
          </div>
        </div>
      )}
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
    <div className={`relative p-5 md:p-7 rounded-[2rem] border-b-4 shadow-xl transition-all duration-300 hover:-translate-y-1 ${styles[variant]}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">{icon}</div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-3">{title}</h3>
          <p className="text-3xl md:text-5xl font-black tracking-tighter">{value}</p>
        </div>
        <div className={`mt-4 pt-4 border-t border-current/10 text-[10px] font-bold italic ${subStyles[variant]}`}>
          {subText}
        </div>
      </div>
    </div>
  );
}