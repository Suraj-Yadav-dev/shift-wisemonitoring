import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [selectedPlant, setSelectedPlant] = useState(""); // string or array if multiple
  const [selectedShift, setSelectedShift] = useState(""); // string or array if multiple
  const [selectedMonth, setSelectedMonth] = useState(""); // string like "Feb-2026"

  // Optional: store selected attendance filter or remaining requirement filter
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

  return (
    <FilterContext.Provider
      value={{
        selectedPlant,
        setSelectedPlant,
        selectedShift,
        setSelectedShift,
        selectedMonth,
        setSelectedMonth,
        showOnlyIncomplete,
        setShowOnlyIncomplete, // for filtering shifts with remaining workers
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}
