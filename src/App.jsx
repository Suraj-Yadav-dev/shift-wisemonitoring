import React from "react";
import { Routes, Route } from "react-router-dom"; // Notice we removed BrowserRouter from here!
import { FilterProvider } from "./context/FilterContext";

// Import your pages
import Dashboard from "./pages/Dashboard";
import ChartsPage from "./pages/Chart"; 

export default function App() {
  return (
    <FilterProvider>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/charts" element={<ChartsPage />} />
          </Routes>
        </main>
      </div>
    </FilterProvider>
  );
}