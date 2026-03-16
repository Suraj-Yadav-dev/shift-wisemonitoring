import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/layout/Navbar";
import { FilterProvider } from "./context/FilterContext";

function App() {
  return (
    <FilterProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          
          {/* Navbar sits at the top of all routes */}
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* Main Dashboard Route */}
              <Route path="/" element={<Dashboard />} />

              {/* You can add more routes here as your business grows */}
              {/* <Route path="/reports" element={<Reports />} /> */}
            </Routes>
          </main>

        </div>
      </Router>
    </FilterProvider>
  );
}

export default App;