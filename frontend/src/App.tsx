import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import CompaniesList from "./pages/CompaniesList";
import CompanyDetails from "./pages/CompanyDetails";
import Settings from "./pages/Settings";
import { Discovery } from "./pages/Discovery";
import Deals from "./pages/Deals";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing & Auth Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected / App Dashboard Routes */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<CompaniesList />} />
          <Route path="companies/:id" element={<CompanyDetails />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="deals" element={<Deals />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect unknown routes back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
