import React from "react";
import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import greenMale from "../../assets/greenmale.png";
import redMale from "../../assets/Redmale.png";

export default function AttendanceGrid() {
  const { selectedPlant, selectedShift, selectedMonth } = useFilter();

  // Find selected plant attendance
  const plantAttendance = attendanceData.find(
    (p) => p.plant === selectedPlant
  );

  // Fallback UI if no plant is selected
  if (!plantAttendance) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 font-medium text-lg">
          Please select a plant to view attendance records.
        </p>
      </div>
    );
  }

  // Determine shifts to display
  const shiftsToShow = selectedShift
    ? plantAttendance.shifts.filter((s) => s.name === selectedShift)
    : plantAttendance.shifts;

  // Fallback UI if no shifts match
  if (!shiftsToShow.length) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 font-medium text-lg">
          No shifts available for the selected criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {shiftsToShow.map((shift) => {
        // Skip if month filter doesn't match
        if (selectedMonth && shift.month !== selectedMonth) return null;

        const attendance = shift.attendance || [];
        
        // Hide shifts entirely if they have empty attendance arrays
        if (attendance.length === 0) return null;

        return (
          <div
            key={shift.name}
            className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            {/* --- SHIFT HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-50 gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm tracking-wide border border-blue-200 shadow-sm">
                  {shift.name}
                </span>
                <h3 className="text-lg font-extrabold text-gray-800 tracking-tight">
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
            {/* Added grid-cols-5 for mobile, scaling up to 12 for desktop */}
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-12 gap-3 sm:gap-5">
              {attendance.map((day, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-default"
                >
                  <div className="relative">
                    <img
                      src={day === 1 ? greenMale : redMale}
                      alt={day === 1 ? "Present" : "Absent"}
                      // Scaled down slightly for mobile, larger on sm+
                      className="h-8 w-8 sm:h-10 sm:w-10 object-contain group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs mt-2 font-bold text-gray-400 group-hover:text-gray-700 transition-colors">
                    Day {index + 1}
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
                Total Logs: <span className="text-gray-600 font-bold">{attendance.length}</span>
              </div>
            </div>
            
          </div>
        );
      })}
    </div>
  );
}