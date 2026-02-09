import Dashboard from "./pages/Dashboard";
import { FilterProvider } from "./context/FilterContext";

function App() {
  return (
    <FilterProvider>
      <Dashboard />
    </FilterProvider>
  );
}

export default App;
