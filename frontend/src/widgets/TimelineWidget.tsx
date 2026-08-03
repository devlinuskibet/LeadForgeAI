import { useState, useEffect } from "react";
import { Mail, Edit3, Briefcase, Phone, MessageSquare, Eye, Reply, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "../config/api";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  user: string;
}

interface TimelineWidgetProps {
  entityType?: string;
  entityId?: string;
  refreshTrigger?: number;
}

export default function TimelineWidget({ 
  entityType = "company", 
  entityId, 
  refreshTrigger 
}: TimelineWidgetProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!entityId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/activities/entity/${entityType}/${entityId}`);
        if (res.ok) {
          const data = await res.json();
          // Map DB Activity to TimelineEvent
          const mapped = data.map((act: any) => ({
            id: act.id,
            type: act.type.toLowerCase(), // e.g., 'email', 'note'
            title: act.title,
            description: act.description,
            // Format to something like "Oct 12, 11:00 AM" (mocked for now, will use created_at when we have it in response)
            date: "Recently", 
            user: "System Admin"
          }));
          setEvents(mapped);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (entityId) {
      fetchActivities();
    }
  }, [entityId, refreshTrigger]);

  const getIcon = (type: string, title: string) => {
    if (type === "email") {
      if (title.includes("Opened")) return <Eye size={16} className="text-blue-500" />;
      if (title.includes("Replied")) return <Reply size={16} className="text-blue-400" />;
      if (title.includes("Delivered")) return <CheckCircle2 size={16} className="text-green-500" />;
      return <Mail size={16} className="text-blue-500" />;
    }
    switch (type) {
      case "note": return <Edit3 size={16} className="text-yellow-500" />;
      case "deal": return <Briefcase size={16} className="text-blue-400" />;
      case "call": return <Phone size={16} className="text-green-500" />;
      default: return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          
          {events.length === 0 && (
            <div className="text-center text-gray-500 py-8 relative z-10 bg-white">
              No activity recorded yet.
            </div>
          )}

          {events.map((event) => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-50 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {getIcon(event.type, event.title)}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{event.title}</h3>
                  <span className="text-xs text-gray-500">{event.date}</span>
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{event.description}</p>
                )}
                <div className="mt-3 text-xs text-gray-400 font-medium">
                  By {event.user}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
