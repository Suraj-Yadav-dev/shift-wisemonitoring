import React, { useMemo } from "react";
import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import requirementsData from "../../data/requirements.json";

// Shift Categorization
const MORNING_SHIFTS = ["SPL A", "SPL B", "A", "G", "S1"];
const EVENING_SHIFTS = ["B", "C", "S2"];

export default function DayNightMonitoring() {
  const { selectedPlant, selectedMonth } = useFilter();

  // ================= 1. ACTIVE SHIFTS LOGIC FOR SELECTED PLANT =================
  const activeShiftsInfo = useMemo(() => {
    if (!selectedPlant) return { morning: [], evening: [] };

    const activeSet = new Set();

    // Check requirements
    const plantReq = requirementsData.find(p => p.plant === selectedPlant);
    if (plantReq) {
      plantReq.shifts?.forEach(s => {
        if (s.requirement > 0) activeSet.add(s.name);
      });
    }

    // Check attendance
    const plantAtt = attendanceData.find(p => p.plant === selectedPlant);
    if (plantAtt) {
      plantAtt.shifts?.forEach(s => {
        if (s.attendance && s.attendance.length > 0) activeSet.add(s.name);
      });
    }

    const activeArray = Array.from(activeSet);
    
    return {
      morning: activeArray.filter(s => MORNING_SHIFTS.includes(s)),
      evening: activeArray.filter(s => EVENING_SHIFTS.includes(s))
    };
  }, [selectedPlant]);

  // ================= 2. CALCULATION LOGIC (Updated with Shift Details) =================
  const stats = useMemo(() => {
    let morningReq = 0, morningPres = 0;
    let eveningReq = 0, eveningPres = 0;

    // Initialize individual shift trackers
    const shiftDetails = {};
    [...MORNING_SHIFTS, ...EVENING_SHIFTS].forEach(s => {
      shiftDetails[s] = { name: s, req: 0, pres: 0 };
    });

    // Calculate Requirements
    requirementsData.forEach((plant) => {
      if (selectedPlant && plant.plant !== selectedPlant) return;

      plant.shifts?.forEach((shiftReq) => {
        if (shiftDetails[shiftReq.name]) {
          shiftDetails[shiftReq.name].req += shiftReq.requirement || 0;
        }

        if (MORNING_SHIFTS.includes(shiftReq.name)) {
          morningReq += shiftReq.requirement || 0;
        } else if (EVENING_SHIFTS.includes(shiftReq.name)) {
          eveningReq += shiftReq.requirement || 0;
        }
      });
    });

    // Calculate Attendance (Present)
    attendanceData.forEach((plant) => {
      if (selectedPlant && plant.plant !== selectedPlant) return;

      plant.shifts?.forEach((shiftAtt) => {
        const monthMatch = !selectedMonth || shiftAtt.month === selectedMonth;

        if (monthMatch) {
          const presentCount = shiftAtt.attendance?.filter((a) => a === 1).length || 0;
          
          if (shiftDetails[shiftAtt.name]) {
            shiftDetails[shiftAtt.name].pres += presentCount;
          }
          
          if (MORNING_SHIFTS.includes(shiftAtt.name)) {
            morningPres += presentCount;
          } else if (EVENING_SHIFTS.includes(shiftAtt.name)) {
            eveningPres += presentCount;
          }
        }
      });
    });

    // Sub-totals (Morning & Evening)
    const morningAbs = Math.max(morningReq - morningPres, 0);
    const eveningAbs = Math.max(eveningReq - eveningPres, 0);

    const morningPresPct = morningReq > 0 ? ((morningPres / morningReq) * 100).toFixed(1) : 0;
    const morningAbsPct = morningReq > 0 ? ((morningAbs / morningReq) * 100).toFixed(1) : 0;

    const eveningPresPct = eveningReq > 0 ? ((eveningPres / eveningReq) * 100).toFixed(1) : 0;
    const eveningAbsPct = eveningReq > 0 ? ((eveningAbs / eveningReq) * 100).toFixed(1) : 0;

    // Format individual shift arrays for the UI
    const formatShiftData = (name) => {
      const data = shiftDetails[name];
      const abs = Math.max(data.req - data.pres, 0);
      const presPct = data.req > 0 ? ((data.pres / data.req) * 100).toFixed(1) : 0;
      return { ...data, abs, presPct };
    };

    // Only keep shifts that actually have a requirement or attendance
    const morningDetails = MORNING_SHIFTS.map(formatShiftData).filter(s => s.req > 0 || s.pres > 0);
    const eveningDetails = EVENING_SHIFTS.map(formatShiftData).filter(s => s.req > 0 || s.pres > 0);

    // OVERALL TOTALS
    const totalReq = morningReq + eveningReq;
    const totalPres = morningPres + eveningPres;
    const totalAbs = Math.max(totalReq - totalPres, 0);
    
    const totalPresPct = totalReq > 0 ? ((totalPres / totalReq) * 100).toFixed(1) : 0;
    const totalAbsPct = totalReq > 0 ? ((totalAbs / totalReq) * 100).toFixed(1) : 0;

    return {
      morning: { req: morningReq, pres: morningPres, abs: morningAbs, presPct: morningPresPct, absPct: morningAbsPct },
      evening: { req: eveningReq, pres: eveningPres, abs: eveningAbs, presPct: eveningPresPct, absPct: eveningAbsPct },
      overall: { req: totalReq, pres: totalPres, abs: totalAbs, presPct: totalPresPct, absPct: totalAbsPct },
      morningDetails,
      eveningDetails
    };
  }, [selectedPlant, selectedMonth]); 

  // ================= UI RENDER =================
  return (
    <div className="space-y-12">

      {/* ===== 🌍 OVERALL SUMMARY SECTION ===== */}
      <div className="bg-blue-50/50 p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-blue-900 flex items-center gap-3">
            <span className="text-3xl">🌍</span> Overall Summary (All Shifts)
          </h2>
          <p className="text-blue-700/80 text-sm mt-1 font-medium">
            {selectedPlant 
              ? `Total Day & Night combined metrics for ${selectedPlant}` 
              : "Total Day & Night combined metrics across ALL plants"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-blue-500">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Requirement</h3>
            <p className="text-4xl font-black text-gray-800">{stats.overall.req}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-emerald-500">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Present</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-emerald-500">{stats.overall.pres}</p>
              <span className="text-lg font-bold text-emerald-400">({stats.overall.presPct}%)</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-rose-500">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Shortage</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-rose-500">{stats.overall.abs}</p>
              <span className="text-lg font-bold text-rose-400">({stats.overall.absPct}%)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* ===== ☀️ MORNING SHIFTS SECTION ===== */}
      <div className="bg-amber-50/50 p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-sm transition-all hover:shadow-md">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-amber-900 flex items-center gap-3">
              <span className="text-3xl">☀️</span> Morning Shifts Overview
            </h2>
            <p className="text-amber-700/80 text-sm mt-1 font-medium">
              Includes shifts starting between 6:00 AM to 9:30 AM
            </p>
          </div>

          {selectedPlant && (
            <div className="flex flex-wrap items-center gap-2 bg-amber-100/50 px-4 py-2 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Active Now:</span>
              {activeShiftsInfo.morning.length > 0 ? (
                activeShiftsInfo.morning.map(shift => (
                  <span key={shift} className="bg-amber-400 text-amber-950 px-3 py-1 rounded-md text-xs font-black shadow-sm">
                    {shift}
                  </span>
                ))
              ) : (
                <span className="text-xs italic text-amber-600">None</span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-amber-400">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Morning Requirement</h3>
            <p className="text-4xl font-black text-gray-800">{stats.morning.req}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-emerald-500">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Morning Present</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-emerald-500">{stats.morning.pres}</p>
              <span className="text-lg font-bold text-emerald-400">({stats.morning.presPct}%)</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-rose-500">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Morning Shortage</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-rose-500">{stats.morning.abs}</p>
              <span className="text-lg font-bold text-rose-400">({stats.morning.absPct}%)</span>
            </div>
          </div>
        </div>

        {/* --- ☀️ DETAILED MORNING SHIFT BREAKDOWN --- */}
        {stats.morningDetails.length > 0 && (
          <div className="pt-6 border-t border-amber-200/60">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-4">Detailed Shift Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.morningDetails.map(shift => (
                <div key={shift.name} className="bg-white/80 p-4 rounded-xl border border-amber-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="font-black text-amber-900 bg-amber-200/50 border border-amber-300 px-2 py-0.5 rounded text-sm">{shift.name}</span>
                    <div className="text-xs text-gray-600 mt-2 font-medium">
                      Req: {shift.req} | Pres: <span className="text-emerald-600 font-bold">{shift.pres}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${shift.abs > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {shift.abs > 0 ? `Short: ${shift.abs}` : 'Full'}
                    </span>
                    <div className="text-xs font-bold text-gray-400 mt-1">{shift.presPct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== 🌙 EVENING & NIGHT SHIFTS SECTION ===== */}
      <div className="bg-indigo-900 p-6 sm:p-8 rounded-3xl border border-indigo-800 shadow-lg text-white transition-all hover:shadow-xl">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-indigo-100 flex items-center gap-3">
              <span className="text-3xl">🌙</span> Evening & Night Shifts Overview
            </h2>
            <p className="text-indigo-300 text-sm mt-1 font-medium">
              Includes shifts starting between 2:30 PM to 11:00 PM
            </p>
          </div>

          {selectedPlant && (
            <div className="flex flex-wrap items-center gap-2 bg-indigo-800/80 px-4 py-2 rounded-xl border border-indigo-700">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Active Now:</span>
              {activeShiftsInfo.evening.length > 0 ? (
                activeShiftsInfo.evening.map(shift => (
                  <span key={shift} className="bg-indigo-500 text-white px-3 py-1 rounded-md text-xs font-black shadow-sm">
                    {shift}
                  </span>
                ))
              ) : (
                <span className="text-xs italic text-indigo-400">None</span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-indigo-800/50 p-6 rounded-2xl border border-indigo-700">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Evening Requirement</h3>
            <p className="text-4xl font-black text-white">{stats.evening.req}</p>
          </div>

          <div className="bg-emerald-900/40 p-6 rounded-2xl border border-emerald-800/50">
            <h3 className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider mb-2">Evening Present</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-emerald-400">{stats.evening.pres}</p>
              <span className="text-lg font-bold text-emerald-500/80">({stats.evening.presPct}%)</span>
            </div>
          </div>

          <div className="bg-rose-900/40 p-6 rounded-2xl border border-rose-800/50">
            <h3 className="text-xs font-bold text-rose-400/80 uppercase tracking-wider mb-2">Evening Shortage</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-rose-400">{stats.evening.abs}</p>
              <span className="text-lg font-bold text-rose-500/80">({stats.evening.absPct}%)</span>
            </div>
          </div>
        </div>

        {/* --- 🌙 DETAILED EVENING SHIFT BREAKDOWN --- */}
        {stats.eveningDetails.length > 0 && (
          <div className="pt-6 border-t border-indigo-700/60">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">Detailed Shift Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.eveningDetails.map(shift => (
                <div key={shift.name} className="bg-indigo-800/40 p-4 rounded-xl border border-indigo-600 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="font-black text-indigo-100 bg-indigo-600/50 border border-indigo-500 px-2 py-0.5 rounded text-sm">{shift.name}</span>
                    <div className="text-xs text-indigo-200 mt-2 font-medium">
                      Req: {shift.req} | Pres: <span className="text-emerald-400 font-bold">{shift.pres}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${shift.abs > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {shift.abs > 0 ? `Short: ${shift.abs}` : 'Full'}
                    </span>
                    <div className="text-xs font-bold text-indigo-400 mt-1">{shift.presPct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}