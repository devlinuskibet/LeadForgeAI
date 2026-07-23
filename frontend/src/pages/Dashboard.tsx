import MetricCard from "../widgets/MetricCard";
import RecentActivityWidget from "../widgets/RecentActivityWidget";
import { Building2, Mail, Calendar } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Companies" 
          value="124" 
          icon={<Building2 size={24} />} 
          trend="+12% this month"
          trendUp={true}
        />
        <MetricCard 
          title="Emails Sent" 
          value="45" 
          icon={<Mail size={24} />} 
          trend="+5% this week"
          trendUp={true}
        />
        <MetricCard 
          title="Meetings Booked" 
          value="3" 
          icon={<Calendar size={24} />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-gray-400">
           <p>Pipeline Chart Placeholder</p>
        </div>
        <div>
          <RecentActivityWidget />
        </div>
      </div>
    </div>
  );
}
