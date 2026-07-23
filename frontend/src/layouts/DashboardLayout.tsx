import { Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">LeadForgeAI</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/companies" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
            <Users size={20} /> Companies
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 font-medium">
            <Settings size={20} /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 font-medium transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Overview</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
