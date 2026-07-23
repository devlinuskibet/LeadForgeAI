import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, ArrowRight, DollarSign, Briefcase, Mail, AlertCircle } from "lucide-react";

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
    <div className="grid gap-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Good Morning, Linus 👋</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pipeline Value</p>
            <p className="text-2xl font-bold text-gray-900">${briefing?.pipeline_value?.toLocaleString() || "0"}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Expected Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${briefing?.expected_revenue?.toLocaleString() || "0"}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Drafts Ready</p>
            <p className="text-2xl font-bold text-gray-900">{briefing?.drafts_ready || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Follow-ups Due</p>
            <p className="text-2xl font-bold text-gray-900">{briefing?.follow_ups_due || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Today's Priorities</h2>
          
          {briefing?.top_priorities?.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-gray-100 shadow-sm text-gray-500">
              Your priority queue is empty. Import some prospects!
            </div>
          ) : (
            briefing?.top_priorities?.map((priority: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{priority.company_name}</h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                        Score: {priority.priority_score}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-green-600">Estimated Value: ${priority.estimated_value?.toLocaleString() || "0"}</p>
                  </div>
                  <Link 
                    to={`/companies/${priority.company_id}`}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Review & Send <ArrowRight size={16} />
                  </Link>
                </div>
                
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                  <p className="text-sm font-semibold text-purple-900 mb-1">Why today?</p>
                  <p className="text-sm text-purple-800">
                    {priority.why_today || "High value opportunity identified by AI analysis."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Action Center</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg text-left transition-colors">
                <div className="flex items-center gap-3">
                  <CheckSquare size={18} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Review Drafts</span>
                </div>
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{briefing?.drafts_ready || 0}</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 hover:border-orange-500 hover:bg-orange-50 rounded-lg text-left transition-colors">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Send Follow-ups</span>
                </div>
                <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{briefing?.follow_ups_due || 0}</span>
              </button>
              <Link to="/companies" className="w-full flex items-center justify-between p-3 border border-gray-200 hover:border-purple-500 hover:bg-purple-50 rounded-lg text-left transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-gray-400" />
                  <span className="font-medium text-gray-700">Bulk Import Leads</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
