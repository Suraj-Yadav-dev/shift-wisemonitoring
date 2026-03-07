import React, { useMemo } from "react";
import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import requirementsData from "../../data/requirements.json";

// Shift Categorization
const MORNING_SHIFTS = ["SPL A", "A", "G", "S1"];
const EVENING_SHIFTS = ["B", "C", "S2", "SPL B"];

export default function DayNightMonitoring() {
  const { selectedPlant, selectedMonth } = useFilter();

  // ================= 1. PERMANENT SYSTEM-WIDE DATA (NO DROPDOWN RELIANCE) =================
  const permanentStats = useMemo(() => {
    let totalAllotted = 0;
    let totalPresent = 0;
    let totalReq = 0;

    // Fixed Target from Requirements
    requirementsData.forEach(p => { totalReq += p.totalRequirement || 0; });

    // Live Numbers from Attendance
    attendanceData.forEach((plant) => {
      plant.shifts?.forEach((shift) => {
        totalAllotted += shift.allotted || 0;
        totalPresent += shift.attendance?.filter((a) => a === 1).length || 0;
      });
    });

    const totalAbsent = Math.max(totalAllotted - totalPresent, 0);
    const shortfallPct = totalAllotted > 0 ? ((totalAbsent / totalAllotted) * 100).toFixed(1) : "0.0";

    return { totalAllotted, totalPresent, totalAbsent, shortfallPct, totalReq };
  }, []);

  // ================= 2. FILTERED CALCULATION LOGIC (FOR THE LOWER GRIDS) =================
  const stats = useMemo(() => {
    let currentReq = 0, morningPres = 0, eveningPres = 0;
    let morningReq = 0, eveningReq = 0;

    const shiftDetails = {};
    [...MORNING_SHIFTS, ...EVENING_SHIFTS].forEach(s => {
      shiftDetails[s] = { name: s, req: 0, pres: 0, allotted: 0 };
    });

    // Sync Requirements
    requirementsData.forEach((plant) => {
      if (selectedPlant && selectedPlant !== "All" && plant.plant !== selectedPlant) return;
      currentReq += plant.totalRequirement || 0;
      plant.shifts?.forEach((s) => {
        if (shiftDetails[s.name]) shiftDetails[s.name].req += s.requirement || 0;
        if (MORNING_SHIFTS.includes(s.name)) morningReq += s.requirement || 0;
        if (EVENING_SHIFTS.includes(s.name)) eveningReq += s.requirement || 0;
      });
    });

    // Sync Attendance
    attendanceData.forEach((plant) => {
      if (selectedPlant && selectedPlant !== "All" && plant.plant !== selectedPlant) return;
      plant.shifts?.forEach((shift) => {
        const monthMatch = !selectedMonth || selectedMonth === "All" || shift.month === selectedMonth;
        if (monthMatch) {
          const presentCount = shift.attendance?.filter((a) => a === 1).length || 0;
          if (shiftDetails[shift.name]) {
            shiftDetails[shift.name].pres += presentCount;
            shiftDetails[shift.name].allotted += (shift.allotted || 0);
          }
          if (MORNING_SHIFTS.includes(shift.name)) morningPres += presentCount;
          if (EVENING_SHIFTS.includes(shift.name)) eveningPres += presentCount;
        }
      });
    });

    const calculateMetrics = (req, pres) => {
      const abs = Math.max(req - pres, 0);
      const sPct = req > 0 ? ((abs / req) * 100).toFixed(1) : "0.0";
      const pPct = req > 0 ? ((pres / req) * 100).toFixed(1) : "0.0";
      return { req, pres, abs, sPct, pPct };
    };

    const morning = calculateMetrics(morningReq, morningPres);
    const evening = calculateMetrics(eveningReq, eveningPres);
    const overall = calculateMetrics(currentReq, morningPres + eveningPres);

    const morningDetails = MORNING_SHIFTS.map(s => ({ ...shiftDetails[s], ...calculateMetrics(shiftDetails[s].req, shiftDetails[s].pres) })).filter(d => d.req > 0 || d.pres > 0);
    const eveningDetails = EVENING_SHIFTS.map(s => ({ ...shiftDetails[s], ...calculateMetrics(shiftDetails[s].req, shiftDetails[s].pres) })).filter(d => d.req > 0 || d.pres > 0);

    return { morning, evening, overall, morningDetails, eveningDetails };
  }, [selectedPlant, selectedMonth]);

  return (
    <div className="space-y-8 p-4">
      
      {/* ===== 📊 PERMANENT GRID 1: SYSTEM TOTAL ALLOTTED (FIXED) ===== */}
      <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white">
        <h2 className="text-xl font-bold text-slate-400 mb-6 flex items-center gap-2">
          <span className="p-2 bg-slate-800 rounded-lg">📋</span> Permanent System Attendance (Total Allotted)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border-l-4 border-blue-400 shadow-inner">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Allotted</h3>
            <p className="text-5xl font-black">{permanentStats.totalAllotted}</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border-l-4 border-emerald-400 shadow-inner">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Present</h3>
            <p className="text-5xl font-black text-emerald-400">{permanentStats.totalPresent}</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border-l-4 border-rose-400 shadow-inner">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Absent</h3>
            <p className="text-5xl font-black text-rose-400">{permanentStats.totalAbsent}</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border-l-4 border-amber-400 shadow-inner">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Shortfall %</h3>
            <p className="text-5xl font-black text-amber-400">{permanentStats.shortfallPct}%</p>
          </div>
        </div>
      </div>

      {/* ===== 🌍 GRID 2: FILTERED PLANT OVERVIEW ===== */}
      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 shadow-sm transition-all">
        <h2 className="text-2xl font-extrabold text-blue-900 mb-6">
          🌍 {selectedPlant === "All" ? "Filtered: All Plants" : `Selected: ${selectedPlant}`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <MetricCard label="Current Target" value={stats.overall.req} color="blue" />
          <MetricCard label="Plant Present" value={stats.overall.pres} subValue={`${stats.overall.pPct}%`} color="emerald" />
          <MetricCard label="Plant Shortage" value={stats.overall.abs} subValue={`${stats.overall.sPct}%`} color="rose" />
        </div>
      </div>

      {/* ===== ☀️ GRID 3: MORNING MONITORING ===== */}
      <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 shadow-sm">
        <h2 className="text-2xl font-extrabold text-amber-900 mb-6 flex items-center gap-3">
          <span className="text-3xl">☀️</span> Morning Shift Performance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <MetricCard label="Morning Allotted" value={stats.morning.req} color="amber" />
          <MetricCard label="Morning Present" value={stats.morning.pres} subValue={`${stats.morning.pPct}%`} color="emerald" />
          <MetricCard label="Morning Shortage" value={stats.morning.abs} subValue={`${stats.morning.sPct}%`} color="rose" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.morningDetails.map(shift => <ShiftDetailCard key={shift.name} shift={shift} type="morning" />)}
        </div>
      </div>

      {/* ===== 🌙 GRID 4: EVENING MONITORING ===== */}
      <div className="bg-indigo-900 p-6 rounded-3xl border border-indigo-800 text-white shadow-lg">
        <h2 className="text-2xl font-extrabold text-indigo-100 mb-6 flex items-center gap-3">
          <span className="text-3xl">🌙</span> Evening Shift Performance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <MetricCard label="Evening Allotted" value={stats.evening.req} color="indigo" isDark />
          <MetricCard label="Evening Present" value={stats.evening.pres} subValue={`${stats.evening.pPct}%`} color="emerald" isDark />
          <MetricCard label="Evening Shortage" value={stats.evening.abs} subValue={`${stats.evening.sPct}%`} color="rose" isDark />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.eveningDetails.map(shift => <ShiftDetailCard key={shift.name} shift={shift} type="evening" />)}
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual Metric Cards
function MetricCard({ label, value, subValue, color, isDark }) {
  const borderColors = {
    blue: "border-blue-500",
    emerald: "border-emerald-500",
    rose: "border-rose-500",
    amber: "border-amber-500",
    indigo: "border-indigo-400"
  };
  return (
    <div className={`${isDark ? 'bg-indigo-800/50 border-indigo-700' : 'bg-white border-gray-100'} p-6 rounded-2xl shadow-sm border-l-4 ${borderColors[color]}`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-indigo-300' : 'text-gray-400'}`}>{label}</h3>
      <div className="flex items-baseline gap-2">
        <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
        {subValue && <span className="text-lg font-bold opacity-70">{subValue}</span>}
      </div>
    </div>
  );
}

// Sub-component for Shift Breakdown
function ShiftDetailCard({ shift, type }) {
  const isMorning = type === 'morning';
  return (
    <div className={`${isMorning ? 'bg-white border-amber-200' : 'bg-indigo-800/40 border-indigo-600'} p-4 rounded-xl border shadow-sm flex justify-between items-center`}>
      <div>
        <span className={`font-black px-2 py-0.5 rounded text-xs ${isMorning ? 'bg-amber-200 text-amber-900' : 'bg-indigo-600 text-white'}`}>{shift.name}</span>
        <div className={`text-[10px] mt-2 font-medium ${isMorning ? 'text-gray-600' : 'text-indigo-200'}`}>
          A: {shift.allotted} | P: <span className="text-emerald-500 font-bold">{shift.present}</span>
        </div>
      </div>
      <div className="text-right">
        <span className={`font-bold text-xs ${shift.absent > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
          {shift.absent > 0 ? `-${shift.absent}` : 'OK'}
        </span>
        <div className="text-[10px] font-bold text-gray-400 mt-1">{shift.pPct}%</div>
      </div>
    </div>
  );
}