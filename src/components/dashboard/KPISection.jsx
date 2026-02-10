import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import requirementsData from "../../data/requirements.json";

export default function KPISection() {
  const { selectedPlant, selectedMonth, selectedShift } = useFilter();

  if (!selectedPlant) return null;

  // ------------------ REQUIREMENT CALCULATION ------------------
  const plantRequirement = requirementsData.find(
    (p) => p.plant === selectedPlant
  );

  if (!plantRequirement) return null;

  let required = 0;

  // If shift selected → show shift requirement
  if (selectedShift) {
    const shiftRequirement = plantRequirement.shifts?.find(
      (s) => s.name === selectedShift
    );
    required = shiftRequirement?.requirement || 0;
  } 
  // If no shift selected → show total plant requirement
  else {
    required = plantRequirement.totalRequirement || 0;
  }

  // ------------------ DEPLOYED CALCULATION ------------------
  const plantAttendance = attendanceData.find(
    (p) => p.plant === selectedPlant
  );

  let deployed = 0;

  if (plantAttendance) {
    plantAttendance.shifts.forEach((shift) => {
      // Filter by shift (if selected)
      const shiftMatch = !selectedShift || shift.name === selectedShift;

      // Filter by month (if selected)
      const monthMatch = !selectedMonth || shift.month === selectedMonth;

      if (shiftMatch && monthMatch) {
        deployed += shift.attendance?.filter((a) => a === 1).length || 0;
      }
    });
  }

  // ------------------ SHORTAGE CALCULATION ------------------
  const shortage = required - deployed;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">

      {/* Required */}
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500">Total Required</h3>
        <p className="text-2xl font-bold">{required}</p>
      </div>

      {/* Deployed */}
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500">Total Deployed</h3>
        <p className="text-2xl font-bold text-green-600">
          {deployed}
        </p>
      </div>

      {/* Shortage */}
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500">Total Shortage</h3>
        <p className="text-2xl font-bold text-red-600">
          {shortage > 0 ? shortage : 0}
        </p>
      </div>

    </div>
  );
}
