import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";

import CompaniesList from "./pages/CompaniesList";
import CompanyDetails from "./pages/CompanyDetails";
import Settings from "./pages/Settings";
import { Discovery } from "./pages/Discovery";
import Deals from "./pages/Deals";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<CompaniesList />} />
          <Route path="companies/:id" element={<CompanyDetails />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="deals" element={<Deals />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
