import React, { useEffect } from "react";
import FilterBar from "../components/filters/FilterBar";
import { FilterProvider, useFilter } from "../context/FilterContext";
import plantsData from "../data/plants.json";
import attendanceData from "../data/attendance.json";
import KPISection from "../components/dashboard/KPISection";
import AttendanceGrid from "../components/dashboard/AttendanceGrid";
import Lottie from "lottie-react";
import animationData from "../assets/Steampunkmechanism.json";
import kpLogo from "../assets/kp.jpg";

// ---------------- Dashboard Content ----------------
function DashboardContent() {
  const {
    selectedPlant,
    setSelectedPlant,
    selectedShift,
    setSelectedShift,
    selectedMonth,
    setSelectedMonth,
  } = useFilter();

  // Set default plant, shift, month on initial load
  useEffect(() => {
    if (!selectedPlant && plantsData.length > 0) {
      const firstPlant = plantsData[0].plant;
      const firstShift = plantsData[0].shifts[0].name;

      setSelectedPlant(firstPlant);
      setSelectedShift(firstShift);

      const plantAttendance = attendanceData.find(
        (p) => p.plant === firstPlant
      );

      if (plantAttendance) {
        const shiftRecord = plantAttendance.shifts.find(
          (s) => s.name === firstShift
        );
        if (shiftRecord?.month) setSelectedMonth(shiftRecord.month);
      }
    }
  }, []); // Only runs once on mount

  // REMOVED: if (!selectedPlant) return null;  <-- This was causing the blank screen!

  return (
    <div className="space-y-6">

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between">
        
        {/* Left Side - Logo + Company Name */}
        <div className="flex items-center gap-4">
          <img
            src={kpLogo}
            alt="KP Logo"
            className="w-16 h-16 object-contain rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              KP Reliable Technique India Private Limited
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Shift Monitoring & Attendance Dashboard
            </p>
          </div>
        </div>

        {/* Right Side - Animation */}
        <div className="w-40 md:w-64 mt-6 md:mt-0">
          <Lottie animationData={animationData} loop />
        </div>

      </div>

      {/* Filters */}
      <FilterBar />

      {/* KPI Section */}
      <KPISection />

      {/* Attendance Grid */}
      <AttendanceGrid />

    </div>
  );
}

// ---------------- Main Dashboard Page ----------------
export default function Dashboard() {
  return (
    <FilterProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-6">
          <DashboardContent />
        </div>
      </div>
    </FilterProvider>
  );
}