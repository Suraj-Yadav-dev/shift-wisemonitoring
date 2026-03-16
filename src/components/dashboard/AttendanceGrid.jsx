import React from "react";
import { useFilter } from "../../context/FilterContext";
import attendanceData from "../../data/attendance.json";
import greenMale from "../../assets/greenmale.png";
import redMale from "../../assets/Redmale.png";

export default function AttendanceGrid() {
  const { selectedPlant, selectedShift, selectedMonth } = useFilter();

  const targetPlants = selectedPlant ? attendanceData.filter((p) => p.plant === selectedPlant) : attendanceData;
  const validShifts = [];

  targetPlants.forEach((plant) => {
    plant.shifts.forEach((shift) => {
      if (selectedShift && shift.name !== selectedShift) return;
      if (selectedMonth && shift.month !== selectedMonth) return;
      if (!shift.attendance || shift.attendance.length === 0) return;
      validShifts.push({ ...shift, plantName: plant.plant });
    });
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      {validShifts.map((shift, idx) => (
        <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
            <span className="font-black text-sm">{shift.plantName}</span>
            <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-full font-bold text-[10px]">
              {shift.name}
            </span>
          </div>
          <div className="p-6 grid grid-cols-6 gap-3">
            {shift.attendance.map((day, dIdx) => (
              <div key={dIdx} className="flex flex-col items-center">
                <img src={day === 1 ? greenMale : redMale} className="w-8 h-8 opacity-90" />
                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">D{dIdx+1}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}