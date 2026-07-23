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
        className="p-2 text-gray-500 hover:text-gray-700 relative rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button className="text-xs text-blue-600 font-medium">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-blue-50/30' : ''}`}>
                <p className="text-sm text-gray-800">{n.text}</p>
                <p className="text-xs text-gray-400 mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
