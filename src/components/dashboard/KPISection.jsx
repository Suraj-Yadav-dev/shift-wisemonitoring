import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import requirementsData from "../../data/requirements.json";

export default function KPISection() {
  const { selectedPlant, selectedMonth } = useFilter();

  if (!selectedPlant) return null;

  // Get plant requirement
  const plantRequirement = requirementsData.find(
    (p) => p.plant === selectedPlant
  );

  if (!plantRequirement) return null;

  const required = plantRequirement.totalRequirement || 0;

  // Get plant attendance
  const plantAttendance = attendanceData.find(
    (p) => p.plant === selectedPlant
  );

  let deployed = 0;

  if (plantAttendance) {
    plantAttendance.shifts.forEach((shift) => {
      if (!selectedMonth || shift.month === selectedMonth) {
        deployed +=
          shift.attendance?.filter((a) => a === 1).length || 0;
      }
    });
  }

  const shortage = required - deployed;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500">Total Required</h3>
        <p className="text-2xl font-bold">{required}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500">Total Deployed</h3>
        <p className="text-2xl font-bold text-green-600">{deployed}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500">Total Shortage</h3>
        <p className="text-2xl font-bold text-red-600">
          {shortage > 0 ? shortage : 0}
        </p>
      </div>
    </div>
  );
}
