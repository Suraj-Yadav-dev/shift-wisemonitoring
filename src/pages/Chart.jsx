import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/layout/Navbar"; 
import { useFilter } from "../context/FilterContext";
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart 
} from "recharts";

function ChartContent() {
  const { selectedPlant, selectedShift, selectedMonth } = useFilter();
  const [liveData, setLiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpBlVgt1TXWreJ6Ue-Xw08VzEq7KK8XebNNr7-YYifeEf6r8vDt6OuiQ7Ru9vq2pJT/exec";

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

  const chartData = useMemo(() => {
    if (!liveData || liveData.length === 0) return [];

    const groupedData = {};
    // Define our start boundary: 1st May 2026
    const startDate = new Date("2026-05-01T00:00:00");

    liveData.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);

      // --- NEW FILTER LOGIC ---
      // Only process data that is on or after 1st May 2026
      if (entryDate < startDate) return;

      const plantMatch = !selectedPlant || selectedPlant === "All" || entry.project === selectedPlant;
      const entryMonth = entryDate.toLocaleString('default', { month: 'long' });
      const monthMatch = !selectedMonth || selectedMonth === "All" || entryMonth === selectedMonth;
      const rawShiftName = (entry.shift || "").toUpperCase().trim();
      const shiftMatch = !selectedShift || selectedShift === "All" || rawShiftName.includes(selectedShift.replace(" SHIFT", "").toUpperCase());

      if (plantMatch && monthMatch && shiftMatch) {
        const dateKey = entryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); 
        const timestampValue = entryDate.getTime(); 

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            date: dateKey,
            timestamp: timestampValue,
            target: 0,
            achievement: 0
          };
        }

        groupedData[dateKey].target += Number(entry.target) || 0;
        groupedData[dateKey].achievement += Number(entry.achievement) || 0;
      }
    });

    return Object.values(groupedData).map(day => {
      const shortfallCount = Math.max(day.target - day.achievement, 0);
      const shortfallPercentage = day.target > 0 ? ((shortfallCount / day.target) * 100).toFixed(1) : 0;
      
      return {
        ...day,
        shortfall: shortfallCount,
        shortfallPercentage: parseFloat(shortfallPercentage)
      };
    }).sort((a, b) => a.timestamp - b.timestamp);

  }, [liveData, selectedPlant, selectedMonth, selectedShift]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar liveData={liveData} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            Shortfall Analytics
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
            Tracking Deficits from 01 May 2026
          </p>
        </div>
        
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border-b-4 border-slate-200">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
            DOWNFALL REPRESENTATION (MAY 2026 TREND)
          </h3>

          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading Chart Data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No data available from May 1st onwards</p>
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
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(tick) => `${tick}%`}
                    tick={{ fill: '#f43f5e', fontSize: 12, fontWeight: 'bold' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                    labelStyle={{ color: '#0f172a', fontWeight: '900', textTransform: 'uppercase' }}
                    formatter={(value, name) => {
                      if (name === "Shortfall %") return [`${value}%`, name];
                      return [value, name];
                    }}
                  />
                  
                  <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '12px' }} />

                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="shortfall" 
                    name="Deficit Count" 
                    fill="#ffe4e6" 
                    stroke="none" 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="target" 
                    name="Target Requirement" 
                    stroke="#cbd5e1" 
                    strokeWidth={2}
                    strokeDasharray="5 5" 
                    dot={false}
                  />
                  
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="shortfallPercentage" 
                    name="Shortfall %" 
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

export default function ChartsPage() {
  return <ChartContent />;
}