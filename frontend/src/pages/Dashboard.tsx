import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, ArrowRight, DollarSign, Briefcase, Mail, AlertCircle, Building2 } from "lucide-react";

export default function Dashboard() {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard/daily-briefing");
        if (res.ok) {
          const data = await res.json();
          setBriefing(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBriefing();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your Daily Briefing...</div>;
  }

  return (
    <div className="grid gap-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Good Morning, Linus</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">Here is your autonomous sales pipeline summary for today.</p>
        </div>
      </div>

      {/* Vibrant Gradient Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg shadow-indigo-100 text-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Pipeline Value</span>
            <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black mt-4 tracking-tight">${briefing?.pipeline_value?.toLocaleString() || "0"}</p>
          <span className="text-[11px] font-medium text-indigo-200 mt-2 block">Weighted deal opportunities</span>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-lg shadow-blue-100 text-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">Drafts Ready</span>
            <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Mail size={20} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black mt-4 tracking-tight">{briefing?.drafts_ready || 0}</p>
          <span className="text-[11px] font-medium text-blue-100 mt-2 block">AI generated outreach ready</span>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-2xl shadow-lg shadow-purple-100 text-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-100">Emails Sent</span>
            <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center">
              <ArrowRight size={20} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black mt-4 tracking-tight">{briefing?.emails_sent || 0}</p>
          <span className="text-[11px] font-medium text-purple-100 mt-2 block">Outreach messages delivered</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg shadow-emerald-100 text-white transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Open Rate</span>
            <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center">
              <CheckSquare size={20} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black mt-4 tracking-tight">
            {briefing?.emails_sent > 0 
              ? `${Math.round((briefing?.emails_opened / briefing?.emails_sent) * 100)}%` 
              : "0%"}
          </p>
          <span className="text-[11px] font-medium text-emerald-100 mt-2 block">Recipient engagement rate</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Today's Priority Accounts</h2>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Ranked by Deal Opportunity
            </span>
          </div>
          
          {briefing?.top_priorities?.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-2xl border border-gray-100 shadow-sm text-gray-500 space-y-3">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Briefcase size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-900">Your priority queue is clear</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">Run Prospect Discovery to find high-value local businesses looking for AI solutions.</p>
              <Link to="/discovery" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
                Launch Prospect Discovery
              </Link>
            </div>
          ) : (
            briefing?.top_priorities?.map((priority: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="text-lg font-bold text-gray-900">{priority.company_name}</h3>
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-bold rounded-full shadow-2xs">
                        Priority {priority.priority_score || 95}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block border border-emerald-100">
                      Estimated Deal: ${priority.estimated_value?.toLocaleString() || "3,500"}
                    </p>
                  </div>
                  <Link 
                    to={`/companies/${priority.company_id}`}
                    className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs shrink-0"
                  >
                    Review & Send <ArrowRight size={14} />
                  </Link>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/40 border-l-4 border-purple-600 p-4 rounded-r-xl">
                  <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">AI Recommendation Context</p>
                  <p className="text-xs text-purple-950 font-medium leading-relaxed">
                    {priority.sales_coach_advice || priority.why_today || "High deal potential identified. Automated booking and customer payment portal recommended."}
                  </p>
                </div>
              </div>
            ))
          )}
        {/* Action Center */}
        <div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Action Center</h2>
            <div className="space-y-2.5">
              <Link to="/companies" className="w-full flex items-center justify-between p-3.5 border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 rounded-xl text-left transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-gray-900 block">Outreach Drafts</span>
                    <span className="text-[11px] text-gray-500">Ready for review</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{briefing?.drafts_ready || 0}</span>
              </Link>

              <Link to="/discovery" className="w-full flex items-center justify-between p-3.5 border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 rounded-xl text-left transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-gray-900 block">Prospect Discovery</span>
                    <span className="text-[11px] text-gray-500">Search Google Places</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">New</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
