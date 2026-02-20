import React from "react";
import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import greenMale from "../../assets/greenmale.png";
import redMale from "../../assets/Redmale.png";

export default function AttendanceGrid() {
  const { selectedPlant, selectedShift, selectedMonth } = useFilter();

  // 1. Determine which plants to process
  // If "All Plants" (empty string), we use the whole attendanceData array.
  // If a specific plant is selected, we filter just for that one.
  const targetPlants = selectedPlant
    ? attendanceData.filter((p) => p.plant === selectedPlant)
    : attendanceData;

  // 2. Collect all matching shifts across the target plants
  const validShifts = [];

  targetPlants.forEach((plant) => {
    plant.shifts.forEach((shift) => {
      // Filter by Shift Name (if selected)
      if (selectedShift && shift.name !== selectedShift) return;

      // Filter by Month (if selected)
      if (selectedMonth && shift.month !== selectedMonth) return;

      // Filter out empty attendance arrays
      if (!shift.attendance || shift.attendance.length === 0) return;

      // Add to our list, attaching the Plant Name so we can display it
      validShifts.push({
        ...shift,
        plantName: plant.plant, // Important for "All Plants" view
      });
    });
  });

  // 3. Fallback UI if no data matches the filters
  if (validShifts.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 font-medium text-lg">
          No attendance records found for the selected criteria.
        </p>
      </div>
    );
  }

  // 4. Render the Grids
  return (
    <div className="space-y-8">
      {validShifts.map((shift, index) => {
        // Create a unique key using plant + shift + month + index
        const uniqueKey = `${shift.plantName}-${shift.name}-${shift.month}-${index}`;

        return (
          <div
            key={uniqueKey}
            className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            {/* --- SHIFT HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-50 gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Plant Name Badge (Visible in All Plants view) */}
                <span className="bg-gray-800 text-white px-3 py-1 rounded-lg font-bold text-sm tracking-wide shadow-sm">
                  {shift.plantName}
                </span>

                {/* Shift Name Badge */}
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm tracking-wide border border-blue-200 shadow-sm">
                  {shift.name}
                </span>

                <h3 className="text-lg font-extrabold text-gray-800 tracking-tight hidden sm:block">
                  Attendance Roster
                </h3>
              </div>

              {shift.month && (
                <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  {shift.month}
                </span>
              )}
            </div>

            {/* --- ATTENDANCE GRID --- */}
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-12 gap-3 sm:gap-5">
              {shift.attendance.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="group flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-default"
                >
                  <div className="relative">
                    <img
                      src={day === 1 ? greenMale : redMale}
                      alt={day === 1 ? "Present" : "Absent"}
                      className="h-8 w-8 sm:h-10 sm:w-10 object-contain group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs mt-2 font-bold text-gray-400 group-hover:text-gray-700 transition-colors">
                    Day {dayIndex + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* --- FOOTER & LEGEND --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-5 border-t border-gray-50">
              <div className="flex flex-wrap gap-3 text-sm font-medium">
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                  <img src={greenMale} alt="Present" className="h-4 w-4 drop-shadow-sm" />
                  Present
                </div>
                <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-100 shadow-sm">
                  <img src={redMale} alt="Absent" className="h-4 w-4 drop-shadow-sm" />
                  Absent
                </div>
              </div>

              <div className="text-sm text-gray-400 font-medium">
                Total Logs: <span className="text-gray-600 font-bold">{shift.attendance.length}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}