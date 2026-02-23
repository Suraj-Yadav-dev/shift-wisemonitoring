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

    // Check requirements: Agar requirement 0 se zyada hai, toh shift active hai
    const plantReq = requirementsData.find(p => p.plant === selectedPlant);
    if (plantReq) {
      plantReq.shifts?.forEach(s => {
        if (s.requirement > 0) activeSet.add(s.name);
      });
    }

    // Check attendance: Agar koi present hai, toh shift active hai
    const plantAtt = attendanceData.find(p => p.plant === selectedPlant);
    if (plantAtt) {
      plantAtt.shifts?.forEach(s => {
        if (s.attendance && s.attendance.length > 0) activeSet.add(s.name);
      });
    }

    const activeArray = Array.from(activeSet);
    
    // Morning aur Evening active shifts ko alag-alag filter karna
    return {
      morning: activeArray.filter(s => MORNING_SHIFTS.includes(s)),
      evening: activeArray.filter(s => EVENING_SHIFTS.includes(s))
    };
  }, [selectedPlant]);

  // ================= 2. CALCULATION LOGIC =================
  const stats = useMemo(() => {
    let morningReq = 0, morningPres = 0;
    let eveningReq = 0, eveningPres = 0;

    // Calculate Requirements
    requirementsData.forEach((plant) => {
      if (selectedPlant && plant.plant !== selectedPlant) return;

      plant.shifts?.forEach((shiftReq) => {
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
          
          if (MORNING_SHIFTS.includes(shiftAtt.name)) {
            morningPres += presentCount;
          } else if (EVENING_SHIFTS.includes(shiftAtt.name)) {
            eveningPres += presentCount;
          }
        }
      });
    });

    // Calculate Absents & Percentages
    const morningAbs = Math.max(morningReq - morningPres, 0);
    const eveningAbs = Math.max(eveningReq - eveningPres, 0);

    const morningPresPct = morningReq > 0 ? ((morningPres / morningReq) * 100).toFixed(1) : 0;
    const morningAbsPct = morningReq > 0 ? ((morningAbs / morningReq) * 100).toFixed(1) : 0;

    const eveningPresPct = eveningReq > 0 ? ((eveningPres / eveningReq) * 100).toFixed(1) : 0;
    const eveningAbsPct = eveningReq > 0 ? ((eveningAbs / eveningReq) * 100).toFixed(1) : 0;

    return {
      morning: { req: morningReq, pres: morningPres, abs: morningAbs, presPct: morningPresPct, absPct: morningAbsPct },
      evening: { req: eveningReq, pres: eveningPres, abs: eveningAbs, presPct: eveningPresPct, absPct: eveningAbsPct }
    };
  }, [selectedPlant, selectedMonth]); 

  // ================= UI RENDER =================
  return (
    <div className="space-y-12">
      
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

          {/* DYNAMIC MORNING BADGES */}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

          {/* DYNAMIC EVENING BADGES */}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
      </div>

    </div>
  );
}