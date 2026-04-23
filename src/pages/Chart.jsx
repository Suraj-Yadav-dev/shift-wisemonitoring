import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/layout/Navbar"; // Adjust path if needed
import { FilterProvider, useFilter } from "../context/FilterContext";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart 
} from "recharts";

// 1. We create a sub-component so it has access to the useFilter hooks
function ChartContent() {
  const { selectedPlant, selectedShift, selectedMonth } = useFilter();
  const [liveData, setLiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpBlVgt1TXWreJ6Ue-Xw08VzEq7KK8XebNNr7-YYifeEf6r8vDt6OuiQ7Ru9vq2pJT/exec";

  // Fetch data on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        setLiveData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process and aggregate data for the chart
  const chartData = useMemo(() => {
    if (!liveData || liveData.length === 0) return [];

    const groupedData = {};

    liveData.forEach((entry) => {
      // Apply existing Dashboard Filters
      const plantMatch = !selectedPlant || selectedPlant === "All" || entry.project === selectedPlant;
      
      const entryDate = new Date(entry.timestamp);
      const entryMonth = entryDate.toLocaleString('default', { month: 'long' });
      const monthMatch = !selectedMonth || selectedMonth === "All" || entryMonth === selectedMonth;
      
      const rawShiftName = (entry.shift || "").toUpperCase().trim();
      const shiftMatch = !selectedShift || selectedShift === "All" || rawShiftName.includes(selectedShift.replace(" SHIFT", "").toUpperCase());

      // If the row matches our filters, process it
      if (plantMatch && monthMatch && shiftMatch) {
        // Format date as DD/MM for a clean X-Axis
        const dateKey = entryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); 
        const timestampValue = entryDate.getTime(); // Used for sorting chronologically

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            date: dateKey,
            timestamp: timestampValue,
            target: 0,
            achievement: 0,
            shortfall: 0
          };
        }

        const target = Number(entry.target) || 0;
        const achievement = Number(entry.achievement) || 0;

        groupedData[dateKey].target += target;
        groupedData[dateKey].achievement += achievement;
      }
    });

    // Calculate final Shortfall (Downfall) and sort chronologically
    return Object.values(groupedData).map(day => ({
      ...day,
      shortfall: Math.max(day.target - day.achievement, 0) // Shortfall cannot be negative
    })).sort((a, b) => a.timestamp - b.timestamp);

  }, [liveData, selectedPlant, selectedMonth, selectedShift]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar gets the raw liveData to calculate global top stats */}
      <Navbar liveData={liveData} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            Shortfall Analytics
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
            Tracking Daily Inspector Deficits
          </p>
        </div>
        
        {/* CHART CONTAINER */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-b-4 border-slate-200">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
            DOWNFALL REPRESENTATION (DEFICIT TREND)
          </h3>

          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading Chart Data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No data available for selected filters</p>
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  
                  {/* Custom Tooltip on Hover */}
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                    labelStyle={{ color: '#0f172a', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  
                  <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '12px' }} />

                  {/* The visual elements */}
                  <Area 
                    type="monotone" 
                    dataKey="shortfall" 
                    name="Deficit (Shortfall)" 
                    fill="#ffe4e6" 
                    stroke="none" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    name="Target Requirement" 
                    stroke="#cbd5e1" 
                    strokeWidth={2}
                    strokeDasharray="5 5" 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="shortfall" 
                    name="Daily Downfall" 
                    stroke="#f43f5e" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// 2. Wrap it all in the Provider in the default export
export default function ChartsPage() {
  return (
    <FilterProvider>
      <ChartContent />
    </FilterProvider>
  );
}