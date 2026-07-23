import { useState } from "react";
import { Mail, Edit3, Briefcase, Phone, MessageSquare } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "email" | "note" | "deal" | "call" | "status";
  title: string;
  description?: string;
  date: string;
  user: string;
}

export default function TimelineWidget() {
  const [events] = useState<TimelineEvent[]>([
    {
      id: "1",
      type: "email",
      title: "Email Sent: Follow up on proposal",
      description: "Hi John, just following up on the proposal we sent yesterday.",
      date: "Today, 10:30 AM",
      user: "System Admin"
    },
    {
      id: "2",
      type: "note",
      title: "Note Added",
      description: "Client is very interested in the AI features. Wants a demo next week.",
      date: "Yesterday, 2:15 PM",
      user: "System Admin"
    },
    {
      id: "3",
      type: "status",
      title: "Stage Changed to Qualified",
      date: "Oct 12, 11:00 AM",
      user: "System Admin"
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail size={16} className="text-blue-500" />;
      case "note": return <Edit3 size={16} className="text-yellow-500" />;
      case "deal": return <Briefcase size={16} className="text-purple-500" />;
      case "call": return <Phone size={16} className="text-green-500" />;
      default: return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          
          {events.map((event) => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-50 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {getIcon(event.type)}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{event.title}</h3>
                  <span className="text-xs text-gray-500">{event.date}</span>
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 mt-2">{event.description}</p>
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
