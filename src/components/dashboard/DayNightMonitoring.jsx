import React, { useMemo } from "react";
import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import requirementsData from "../../data/requirements.json";

const MORNING_SHIFTS = ["SPL A", "A", "G", "S1"];
const EVENING_SHIFTS = ["B", "C", "S2", "SPL B"];

export default function DayNightMonitoring() {
  const { selectedPlant, selectedMonth } = useFilter();

  const stats = useMemo(() => {
    let currentReq = 0, morningPres = 0, eveningPres = 0;
    let morningReq = 0, eveningReq = 0;
    const shiftDetails = {};

    [...MORNING_SHIFTS, ...EVENING_SHIFTS].forEach(s => {
      shiftDetails[s] = { name: s, req: 0, pres: 0 };
    });

    requirementsData.forEach((plant) => {
      if (selectedPlant && selectedPlant !== "All" && plant.plant !== selectedPlant) return;
      currentReq += plant.totalRequirement || 0;
      plant.shifts?.forEach((s) => {
        if (shiftDetails[s.name]) shiftDetails[s.name].req += s.requirement || 0;
        if (MORNING_SHIFTS.includes(s.name)) morningReq += s.requirement || 0;
        if (EVENING_SHIFTS.includes(s.name)) eveningReq += s.requirement || 0;
      });
    });

    attendanceData.forEach((plant) => {
      if (selectedPlant && selectedPlant !== "All" && plant.plant !== selectedPlant) return;
      plant.shifts?.forEach((shift) => {
        const monthMatch = !selectedMonth || selectedMonth === "All" || shift.month === selectedMonth;
        if (monthMatch) {
          const presentCount = shift.attendance?.filter((a) => a === 1).length || 0;
          if (shiftDetails[shift.name]) shiftDetails[shift.name].pres += presentCount;
          if (MORNING_SHIFTS.includes(shift.name)) morningPres += presentCount;
          if (EVENING_SHIFTS.includes(shift.name)) eveningPres += presentCount;
        }
      });
    });

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
      morningDetails: MORNING_SHIFTS.map(s => ({ ...shiftDetails[s], ...calc(shiftDetails[s].req, shiftDetails[s].pres) })).filter(d => d.req > 0 || d.pres > 0),
      eveningDetails: EVENING_SHIFTS.map(s => ({ ...shiftDetails[s], ...calc(shiftDetails[s].req, shiftDetails[s].pres) })).filter(d => d.req > 0 || d.pres > 0),
    };
  }, [selectedPlant, selectedMonth]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 py-6">
      
      {/* --- MORNING OPERATIONS PANEL --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-amber-400 p-6 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              ☀️ Morning Operations
            </h3>
            <p className="text-[11px] font-bold text-amber-900 mt-1 uppercase">
              Req: {stats.morning.req} | Pres: {stats.morning.pres}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-amber-900 opacity-60">Shortfall %</p>
            <p className="text-2xl font-black text-rose-600">{stats.morning.sPct}%</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          {stats.morningDetails.map(shift => (
            <ShiftRow key={shift.name} shift={shift} themeColor="bg-amber-400" />
          ))}
        </div>
      </div>

      {/* --- NIGHT OPERATIONS PANEL --- */}
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden text-white">
        <div className="bg-[#0055A4] p-6 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              🌙 Night Operations
            </h3>
            <p className="text-[11px] font-bold text-blue-200 mt-1 uppercase">
              Req: {stats.evening.req} | Pres: {stats.evening.pres}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-blue-200 opacity-60">Shortfall %</p>
            <p className="text-2xl font-black text-rose-400">{stats.evening.sPct}%</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {stats.eveningDetails.map(shift => (
            <ShiftRow key={shift.name} shift={shift} themeColor="bg-[#0055A4]" isDark />
          ))}
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
        <div>
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