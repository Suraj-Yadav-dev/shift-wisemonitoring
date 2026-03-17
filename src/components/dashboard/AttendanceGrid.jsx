import React from "react";
import { useFilter } from "../../context/FilterContext";
// Note: We no longer import attendanceData from JSON
import greenMale from "../../assets/greenmale.png";
import redMale from "../../assets/Redmale.png";

export default function AttendanceGrid({ liveData = [] }) {
  const { selectedPlant, selectedShift, selectedMonth } = useFilter();

  // 1. Process and Filter the Live Data from Google Sheets
  const filteredEntries = liveData.filter((entry) => {
    // Plant Filter
    const plantMatch = !selectedPlant || selectedPlant === "All" || entry.project === selectedPlant;
    
    // Shift Filter (Matches "S1 SHIFT", "A SHIFT", etc.)
    const shiftMatch = !selectedShift || selectedShift === "All" || entry.shift.includes(selectedShift);
    
    // Month Filter
    const entryDate = new Date(entry.timestamp);
    const entryMonth = entryDate.toLocaleString('default', { month: 'long' });
    const monthMatch = !selectedMonth || selectedMonth === "All" || entryMonth === selectedMonth;

    return plantMatch && shiftMatch && monthMatch;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      {filteredEntries.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
            No Live Records Found for selected filters
          </p>
        </div>
      ) : (
        filteredEntries.map((entry, idx) => {
          // Calculate if the entry is a success (Achievement >= Target)
          const isSuccess = Number(entry.achievement) >= Number(entry.target);
          const percentage = ((Number(entry.achievement) / Number(entry.target)) * 100).toFixed(1);

          return (
            <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
                <div className="flex flex-col">
                  <span className="font-black text-xs uppercase tracking-tight">{entry.project}</span>
                  <span className="text-[9px] text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
                <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-full font-bold text-[10px]">
                  {entry.shift}
                </span>
              </div>

              {/* Attendance Status Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Performance</p>
                      <p className={`text-xl font-black ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {percentage}%
                      </p>
                   </div>
                   <img 
                    src={isSuccess ? greenMale : redMale} 
                    className="w-12 h-12 object-contain" 
                    alt="status"
                   />
                </div>

                {/* Data Breakdown */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Target</span>
                    <span className="font-black text-slate-700">{entry.target}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Achievement</span>
                    <span className="font-black text-slate-700">{entry.achievement}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="block text-[9px] font-bold text-slate-300 uppercase truncate">
                    Submitted by: {entry.email}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}