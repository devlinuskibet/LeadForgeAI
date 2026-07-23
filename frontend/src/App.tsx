import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<div className="p-4">Companies Page Placeholder</div>} />
          <Route path="settings" element={<div className="p-4">Settings Placeholder</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
