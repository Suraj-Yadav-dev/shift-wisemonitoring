import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import requirementsData from "../../data/requirements.json";

export default function KPISection() {
  const { selectedPlant, selectedMonth, selectedShift } = useFilter();

  /* ================= OVERALL (ALL PLANTS) ================= */

  let totalRequirement = 0;
  let totalPresent = 0;
  let totalAbsent = 0;

  // ---- Requirement (All Plants)
  requirementsData.forEach((plant) => {
    if (selectedShift) {
      const shift = plant.shifts?.find(
        (s) => s.name === selectedShift
      );
      totalRequirement += shift?.requirement || 0;
    } else {
      totalRequirement += plant.totalRequirement || 0;
    }
  });

  // ---- Attendance (All Plants)
  attendanceData.forEach((plant) => {
    plant.shifts.forEach((shift) => {
      const shiftMatch =
        !selectedShift || shift.name === selectedShift;

      const monthMatch =
        !selectedMonth || shift.month === selectedMonth;

      if (shiftMatch && monthMatch) {
        const present =
          shift.attendance?.filter((a) => a === 1).length || 0;

        const absent =
          shift.attendance?.filter((a) => a === 0).length || 0;

        totalPresent += present;
        totalAbsent += absent;
      }
    });
  });

  const totalShortage =
    totalRequirement - totalPresent > 0
      ? totalRequirement - totalPresent
      : 0;

  /* ================= INDIVIDUAL PLANT ================= */

  let plantRequirement = 0;
  let plantPresent = 0;
  let plantAbsent = 0;

  if (selectedPlant) {
    const reqPlant = requirementsData.find(
      (p) => p.plant === selectedPlant
    );

    if (reqPlant) {
      if (selectedShift) {
        const shift = reqPlant.shifts?.find(
          (s) => s.name === selectedShift
        );
        plantRequirement = shift?.requirement || 0;
      } else {
        plantRequirement = reqPlant.totalRequirement || 0;
      }
    }

    const attPlant = attendanceData.find(
      (p) => p.plant === selectedPlant
    );

    if (attPlant) {
      attPlant.shifts.forEach((shift) => {
        const shiftMatch =
          !selectedShift || shift.name === selectedShift;

        const monthMatch =
          !selectedMonth || shift.month === selectedMonth;

        if (shiftMatch && monthMatch) {
          plantPresent +=
            shift.attendance?.filter((a) => a === 1).length || 0;

          plantAbsent +=
            shift.attendance?.filter((a) => a === 0).length || 0;
        }
      });
    }
  }

  const plantShortage =
    plantRequirement - plantPresent > 0
      ? plantRequirement - plantPresent
      : 0;

  /* ================= UI ================= */

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">

      {/* -------- OVERALL -------- */}

      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500 text-sm">
          Total Requirement (All)
        </h3>
        <p className="text-2xl font-bold">
          {totalRequirement}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500 text-sm">
          Total Present (All)
        </h3>
        <p className="text-2xl font-bold text-green-600">
          {totalPresent}
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-500 text-sm">
          Total Absent (All)
        </h3>
        <p className="text-2xl font-bold text-red-600">
          {totalAbsent}
        </p>
      </div>

      {/* -------- INDIVIDUAL PLANT -------- */}

      <div className="bg-blue-50 p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-600 text-sm">
          {selectedPlant || "Plant"} Requirement
        </h3>
        <p className="text-2xl font-bold">
          {plantRequirement}
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-600 text-sm">
          {selectedPlant || "Plant"} Present
        </h3>
        <p className="text-2xl font-bold text-green-700">
          {plantPresent}
        </p>
      </div>

      <div className="bg-red-50 p-4 rounded-xl shadow text-center">
        <h3 className="text-gray-600 text-sm">
          {selectedPlant || "Plant"} Absent
        </h3>
        <p className="text-2xl font-bold text-red-700">
          {plantAbsent}
        </p>
      </div>

    </div>
  );
}
