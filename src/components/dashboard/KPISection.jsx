import React, { useState } from "react";
import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import requirementsData from "../../data/requirements.json";

// Map shift names to their exact start times based on your data
const SHIFT_START_TIMES = {
  "A": "6:00 AM",
  "S1": "6:00 AM",
  "SPL A": "8:30 AM",
  "SPL B": "8:30 AM",
  "G": "9:30 AM",
  "B": "2:30 PM",
  "S2": "6:00 PM",
  "C": "11:00 PM",
};

// Get a list of unique start times for the dropdown/buttons
const START_TIMES = [...new Set(Object.values(SHIFT_START_TIMES))];

export default function KPISection() {
  const { selectedPlant, selectedMonth, selectedShift } = useFilter();

  // MD View State: Default to the first available start time
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("8:30 AM");

  // ================= PLANT-WISE (CHANGES WITH SHIFT) =================
  let required = 0;
  let deployed = 0;

  if (selectedPlant) {
    const plantRequirement = requirementsData.find(
      (p) => p.plant === selectedPlant
    );

    if (plantRequirement) {
      if (selectedShift) {
        const shiftRequirement = plantRequirement.shifts?.find(
          (s) => s.name === selectedShift
        );
        required = shiftRequirement?.requirement || 0;
      } else {
        required = plantRequirement.totalRequirement || 0;
      }
    }

    const plantAttendance = attendanceData.find(
      (p) => p.plant === selectedPlant
    );

    if (plantAttendance) {
      plantAttendance.shifts.forEach((shift) => {
        const shiftMatch = !selectedShift || shift.name === selectedShift;
        const monthMatch = !selectedMonth || shift.month === selectedMonth;

        if (shiftMatch && monthMatch) {
          deployed += shift.attendance?.filter((a) => a === 1).length || 0;
        }
      });
    }
  }

  const absentPlant = Math.max(required - deployed, 0);

  // ================= ALL PLANTS (REMAINS CONSTANT) =================
  let totalRequirementAllPlants = 0;
  let totalPresentAllPlants = 0;

  requirementsData.forEach((plant) => {
    totalRequirementAllPlants += plant.totalRequirement || 0;
  });

  attendanceData.forEach((plant) => {
    plant.shifts.forEach((shift) => {
      const monthMatch = !selectedMonth || shift.month === selectedMonth;
      if (monthMatch) {
        totalPresentAllPlants +=
          shift.attendance?.filter((a) => a === 1).length || 0;
      }
    });
  });

  const totalAbsentAllPlants = Math.max(
    totalRequirementAllPlants - totalPresentAllPlants,
    0
  );

  // ================= TIME-SLOT VIEW FOR MD =================
  let timeSlotRequired = 0;
  let timeSlotPresent = 0;
  let matchingShifts = [];

  if (selectedTimeSlot) {
    matchingShifts = Object.keys(SHIFT_START_TIMES).filter(
      (shiftName) => SHIFT_START_TIMES[shiftName] === selectedTimeSlot
    );

    requirementsData.forEach((plant) => {
      plant.shifts?.forEach((shiftReq) => {
        if (matchingShifts.includes(shiftReq.name)) {
          timeSlotRequired += shiftReq.requirement || 0;
        }
      });
    });

    attendanceData.forEach((plant) => {
      plant.shifts?.forEach((shiftAtt) => {
        if (matchingShifts.includes(shiftAtt.name)) {
          const monthMatch = !selectedMonth || shiftAtt.month === selectedMonth;
          if (monthMatch) {
            timeSlotPresent +=
              shiftAtt.attendance?.filter((a) => a === 1).length || 0;
          }
        }
      });
    });
  }

  const timeSlotAbsent = Math.max(timeSlotRequired - timeSlotPresent, 0);

  // ================= UI =================
  return (
    <div className="space-y-12">
      
      {/* ===== MAIN KPIs ===== */}
      <div className="space-y-6">
        <div className="flex flex-col mb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">General Overview</h2>
          <p className="text-sm text-gray-500">Showing requirements and attendance metrics across plants.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ---------- PLANT WISE ---------- */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Plant Required</h3>
            <p className="text-4xl font-black text-gray-800">{required}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Plant Present</h3>
            <p className="text-4xl font-black text-emerald-500">{deployed}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Plant Absent</h3>
            <p className="text-4xl font-black text-rose-500">{absentPlant}</p>
          </div>

          {/* ---------- ALL PLANTS (CONSTANT) ---------- */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-b-blue-500 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">Total Req. (All Plants)</h3>
            <p className="text-4xl font-black text-gray-800">{totalRequirementAllPlants}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-b-emerald-500 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">Total Present (All Plants)</h3>
            <p className="text-4xl font-black text-emerald-500">
              {totalPresentAllPlants}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-b-rose-500 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">Total Absent (All Plants)</h3>
            <p className="text-4xl font-black text-rose-500">
              {totalAbsentAllPlants}
            </p>
          </div>
        </div>
      </div>

      {/* ===== MD TIME-SLOT VIEW ===== */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Shift Analysis by Start Time
            </h2>
            <p className="text-sm text-gray-500 mt-1">Management View: Track current active shifts.</p>
          </div>
          
          {/* Time Slot Selector */}
          <select
            className="w-full md:w-auto p-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
          >
            {START_TIMES.map((time) => (
              <option key={time} value={time}>
                Shifts Starting at {time}
              </option>
            ))}
          </select>
        </div>

        {/* --- SHIFT NAMES CHIPS --- */}
        <div className="mb-8 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
            Included Shifts:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {matchingShifts.length > 0 ? (
              matchingShifts.map((shiftName) => (
                <span 
                  key={shiftName} 
                  className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-200 shadow-sm"
                >
                  {shiftName}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400 italic px-2">No shifts found for this time.</span>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Required at {selectedTimeSlot}</h3>
            <p className="text-4xl font-black text-gray-800">{timeSlotRequired}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Present at {selectedTimeSlot}</h3>
            <p className="text-4xl font-black text-emerald-500">{timeSlotPresent}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Absent at {selectedTimeSlot}</h3>
            <p className="text-4xl font-black text-rose-500">{timeSlotAbsent}</p>
          </div>
        </div>
      </div>

    </div>
  );
}