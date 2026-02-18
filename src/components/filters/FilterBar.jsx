import { useFilter } from "../../context/FilterContext";
import plantsData from "../../data/plants.json";
import attendanceData from "../../data/attendance.json";

export default function FilterBar() {
  const {
    selectedPlant,
    setSelectedPlant,
    selectedShift,
    setSelectedShift,
    selectedMonth,
    setSelectedMonth,
  } = useFilter();

  // Get selected plant object to populate shifts
  const plantRecord = plantsData.find((p) => p.plant === selectedPlant);
  const shifts = plantRecord ? plantRecord.shifts : [];

  // Dynamically get months for selected plant & shift
  let months = [];
  if (selectedPlant) {
    const plantAttendance = attendanceData.find(
      (item) => item.plant === selectedPlant
    );

    if (plantAttendance) {
      const monthSet = new Set();

      plantAttendance.shifts.forEach((shift) => {
        // Include only selected shift or all if no shift selected
        if (!selectedShift || shift.name === selectedShift) {
          if (shift.month) monthSet.add(shift.month);
        }
      });

      months = Array.from(monthSet);
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4">

      {/* Plant Dropdown */}
      <select
        className="border p-2 rounded w-52"
        value={selectedPlant}
        onChange={(e) => {
          setSelectedPlant(e.target.value);
          setSelectedShift(""); // Reset shift when plant changes
          setSelectedMonth(""); // Reset month when plant changes
        }}
      >
        <option value="">Select Plant</option>
        {plantsData.map((plant) => (
          <option key={plant.plant} value={plant.plant}>
            {plant.plant}
          </option>
        ))}
      </select>

      {/* Shift Dropdown */}
      <select
        className="border p-2 rounded w-52"
        value={selectedShift}
        onChange={(e) => {
          setSelectedShift(e.target.value);
          setSelectedMonth(""); // Reset month when shift changes
        }}
        disabled={!selectedPlant}
      >
        <option value="">All Shifts</option>
        {shifts.map((shift) => (
          <option key={shift.name} value={shift.name}>
            {shift.name} ({shift.time})
          </option>
        ))}
      </select>

      
    </div>
  );
}
