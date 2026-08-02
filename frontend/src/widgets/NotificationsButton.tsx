import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationsButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  const notifications = [
    { id: 1, text: "John Doe opened your email", time: "5m ago", unread: true },
    { id: 2, text: "New lead assigned to you: TechCorp", time: "1h ago", unread: true },
    { id: 3, text: "Acme Corp meeting in 30 minutes", time: "2h ago", unread: false }
  ];
  
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-purple-600 relative rounded-xl hover:bg-purple-50/60 transition-all group"
      >
        <Bell size={20} className="group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100/90 overflow-hidden z-50 animate-in fade-in duration-150">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs text-gray-900 tracking-tight">System Telemetry & Alerts</h3>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">{unreadCount} New</span>
            </div>
            <button className="text-[11px] text-purple-600 font-bold hover:underline">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.map(n => (
              <div key={n.id} className={`p-3.5 hover:bg-purple-50/30 transition-colors ${n.unread ? 'bg-purple-50/20' : ''}`}>
                <p className="text-xs font-semibold text-gray-900">{n.text}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
