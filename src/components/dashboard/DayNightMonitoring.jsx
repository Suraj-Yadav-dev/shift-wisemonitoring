import React, { useMemo } from "react";
import { useFilter } from "../../context/FilterContext";
import requirementsData from "../../data/requirements.json";

// Keywords to look for within the long Google Sheet shift strings
const MORNING_KEYWORDS = ["SPL A", "A SHIFT", "G SHIFT", "S1 SHIFT"];
const EVENING_KEYWORDS = ["B SHIFT", "C SHIFT", "S2 SHIFT", "SPL B"];

export default function DayNightMonitoring({ liveData = [] }) {
  const { selectedPlant, selectedMonth } = useFilter();

  const stats = useMemo(() => {
    let morningPres = 0, eveningPres = 0;
    let morningReq = 0, eveningReq = 0;
    
    // Store shift-specific totals
    const shiftDetails = {};

    // 1. Initialize requirement tracking from requirements.json
    requirementsData.forEach((plant) => {
      if (selectedPlant && selectedPlant !== "All" && plant.plant !== selectedPlant) return;
      
      plant.shifts?.forEach((s) => {
        if (!shiftDetails[s.name]) {
          shiftDetails[s.name] = { name: s.name, req: 0, pres: 0 };
        }
        shiftDetails[s.name].req += s.requirement || 0;

        // Grouping requirements into Morning/Night totals
        const isMorning = MORNING_KEYWORDS.some(k => s.name.toUpperCase().includes(k.replace(" SHIFT", "")));
        if (isMorning) morningReq += s.requirement || 0;
        else eveningReq += s.requirement || 0;
      });
    });

    // 2. Process LIVE Google Sheet data using Partial String Matching
    liveData.forEach((entry) => {
      const plantMatch = !selectedPlant || selectedPlant === "All" || entry.project === selectedPlant;
      
      const entryDate = new Date(entry.timestamp);
      const entryMonth = entryDate.toLocaleString('default', { month: 'long' });
      const monthMatch = !selectedMonth || selectedMonth === "All" || entryMonth === selectedMonth;

      if (plantMatch && monthMatch) {
        const rawShiftName = (entry.shift || "").toUpperCase();
        const presentCount = Number(entry.achievement) || 0;

        // Find which short name from requirements matches the long string in the sheet
        const matchedKey = Object.keys(shiftDetails).find(key => 
          rawShiftName.includes(key.toUpperCase())
        );

        if (matchedKey) {
          shiftDetails[matchedKey].pres += presentCount;
          
          // Categorize for the Sun/Moon panels
          const isMorning = MORNING_KEYWORDS.some(k => rawShiftName.includes(k.toUpperCase()));
          if (isMorning) morningPres += presentCount;
          else eveningPres += presentCount;
        }
      }
    });

    // Calculation helper
    const calc = (req, pres) => {
      const shortfall = Math.max(req - pres, 0);
      return {
        req, 
        pres, 
        pPct: req > 0 ? ((pres / req) * 100).toFixed(1) : "0.0",
        sPct: req > 0 ? ((shortfall / req) * 100).toFixed(1) : "0.0"
      };
    };

    return {
      morning: calc(morningReq, morningPres),
      evening: calc(eveningReq, eveningPres),
      morningDetails: Object.values(shiftDetails)
        .filter(s => MORNING_KEYWORDS.some(k => s.name.toUpperCase().includes(k.replace(" SHIFT", ""))))
        .map(s => ({ ...s, ...calc(s.req, s.pres) })),
      eveningDetails: Object.values(shiftDetails)
        .filter(s => EVENING_KEYWORDS.some(k => s.name.toUpperCase().includes(k.replace(" SHIFT", ""))))
        .map(s => ({ ...s, ...calc(s.req, s.pres) })),
    };
  }, [selectedPlant, selectedMonth, liveData]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 py-6">
      
      {/* --- MORNING OPERATIONS PANEL --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-amber-400 p-6 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              ☀️ Morning Operations
            </h3>
            <p className="text-[11px] font-bold text-amber-900 mt-1 uppercase text-left">
              Target: {stats.morning.req} | Actual: {stats.morning.pres}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-amber-900 opacity-60">Shortfall %</p>
            <p className="text-2xl font-black text-rose-600">{stats.morning.sPct}%</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          {stats.morningDetails.length > 0 ? stats.morningDetails.map(shift => (
            <ShiftRow key={shift.name} shift={shift} themeColor="bg-amber-400" />
          )) : <p className="text-center text-slate-400 font-bold py-4 uppercase text-xs">No Morning Data</p>}
        </div>
      </div>

      {/* --- NIGHT OPERATIONS PANEL --- */}
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden text-white">
        <div className="bg-[#0055A4] p-6 flex justify-between items-center">
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              🌙 Night Operations
            </h3>
            <p className="text-[11px] font-bold text-blue-200 mt-1 uppercase">
              Target: {stats.evening.req} | Actual: {stats.evening.pres}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-blue-200 opacity-60">Shortfall %</p>
            <p className="text-2xl font-black text-rose-400">{stats.evening.sPct}%</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {stats.eveningDetails.length > 0 ? stats.eveningDetails.map(shift => (
            <ShiftRow key={shift.name} shift={shift} themeColor="bg-[#0055A4]" isDark />
          )) : <p className="text-center text-slate-500 font-bold py-4 uppercase text-xs">No Night Data</p>}
        </div>
      </div>

    </div>
  );
}

function ShiftRow({ shift, themeColor, isDark }) {
  const percentage = Math.min(parseFloat(shift.pPct), 100);

  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <div className="text-left">
          <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Shift {shift.name}
          </span>
          <p className="text-sm font-bold uppercase">Efficiency: {shift.pPct}%</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase opacity-60 block">Shortfall</span>
          <span className={`text-lg font-black text-rose-500`}>
            {shift.sPct}%
          </span>
        </div>
      </div>

      <div className={`w-full h-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-full overflow-hidden flex border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div 
          className={`${themeColor} h-full transition-all duration-700 ease-out shadow-inner`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          TARGET: <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{shift.req}</span>
        </p>
        <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          ACTUAL: <span className="text-emerald-500">{shift.pres}</span>
        </p>
      </div>
    </div>
  );
}