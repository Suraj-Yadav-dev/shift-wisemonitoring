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

  if (!plantAttendance) return null;

  // Determine shifts to display
  const shiftsToShow = selectedShift
    ? plantAttendance.shifts.filter((s) => s.name === selectedShift)
    : plantAttendance.shifts;

  if (!shiftsToShow.length) return null;

  return (
    <div className="space-y-8">
      {shiftsToShow.map((shift) => {
        // Skip if month filter doesn't match
        if (selectedMonth && shift.month !== selectedMonth) return null;

        const attendance = shift.attendance || [];

        return (
          <div
            key={shift.name}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
          >
            {/* Shift Title */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Shift: {shift.name}
              </h3>

              {shift.month && (
                <span className="text-sm text-gray-500">
                  Month: {shift.month}
                </span>
              )}
            </div>

            {/* Attendance Grid */}
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-12 gap-4">
              {attendance.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center"
                >
                  <img
                    src={day === 1 ? greenMale : redMale}
                    alt={day === 1 ? "Present" : "Absent"}
                    className="h-10 w-10 object-contain hover:scale-110 transition-transform duration-200"
                  />
                  <span className="text-xs mt-1 text-gray-600">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <img src={greenMale} alt="Present" className="h-5 w-5" />
                Present
              </div>
              <div className="flex items-center gap-2">
                <img src={redMale} alt="Absent" className="h-5 w-5" />
                Absent
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
