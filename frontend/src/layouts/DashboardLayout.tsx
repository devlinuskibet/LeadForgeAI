import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut, Radar, DollarSign, Sparkles } from "lucide-react";
import NotificationsButton from "../widgets/NotificationsButton";

export default function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Companies & Leads", path: "/companies", icon: Users },
    { label: "Prospect Discovery", path: "/discovery", icon: Radar },
    { label: "Deals & Revenue", path: "/deals", icon: DollarSign },
    { label: "AI Management", path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50/60 text-gray-900 font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-xs z-20">
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100/80">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-purple-200">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-base font-black text-gray-900 tracking-tight block leading-none">LeadForge<span className="text-purple-600">AI</span></span>
              <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase block mt-0.5">Autonomous Sales</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-100"
                    : "text-gray-600 hover:bg-purple-50/70 hover:text-purple-700"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-gray-400 group-hover:text-purple-600 transition-colors"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/40">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              L
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-900 truncate">Linus Kibet</p>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">Admin</span>
            </div>
          </div>
          <button className="flex items-center gap-2.5 w-full px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Glassmorphic Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
              {location.pathname === "/" ? "Pipeline Overview" :
               location.pathname.startsWith("/companies") ? "Accounts & Lead Management" :
               location.pathname.startsWith("/discovery") ? "Autonomous Prospect Discovery" :
               location.pathname.startsWith("/deals") ? "Deals & Revenue Intelligence" :
               "AI System Settings"}
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <NotificationsButton />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs cursor-pointer hover:opacity-90 transition-opacity">
                LK
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
