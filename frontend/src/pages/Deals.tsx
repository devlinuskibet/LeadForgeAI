import { useState, useEffect } from "react";
import { DollarSign, Trophy, XCircle, TrendingUp, Sparkles, Plus, FileText, CheckCircle2, ChevronRight } from "lucide-react";

interface Deal {
  id: string;
  name: string;
  amount: number;
  status: "OPEN" | "WON" | "LOST";
  company_id: string;
  company_name: string;
  company_website?: string;
}

interface DealMetrics {
  total_open_value: number;
  total_won_value: number;
  total_lost_value: number;
  total_deals_count: number;
  win_rate_percentage: number;
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [metrics, setMetrics] = useState<DealMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Proposal Modal State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [loadingProposal, setLoadingProposal] = useState(false);

  const fetchDeals = async () => {
    try {
      const [resDeals, resMetrics] = await Promise.all([
        fetch("http://localhost:8000/api/deals/"),
        fetch("http://localhost:8000/api/deals/metrics")
      ]);
      if (resDeals.ok) setDeals(await resDeals.json());
      if (resMetrics.ok) setMetrics(await resMetrics.json());
    } catch (e) {
      console.error("Failed to fetch deals", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleUpdateStatus = async (dealId: string, newStatus: "OPEN" | "WON" | "LOST") => {
    try {
      const res = await fetch(`http://localhost:8000/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchDeals();
    } catch (e) {
      console.error("Failed to update deal status", e);
    }
  };

  const handleGenerateProposal = async (companyId: string) => {
    setSelectedCompanyId(companyId);
    setLoadingProposal(true);
    try {
      const res = await fetch(`http://localhost:8000/api/deals/company/${companyId}/generate-proposal`, {
        method: "POST"
      });
      if (res.ok) setProposal(await res.json());
    } catch (e) {
      console.error("Failed to generate proposal", e);
    } finally {
      setLoadingProposal(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals & Revenue Pipeline</h1>
          <p className="text-sm text-gray-500">Track deal conversions, active opportunities, and AI-generated proposal packages.</p>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pipeline Open Value</p>
            <p className="text-2xl font-extrabold text-gray-900">${metrics?.total_open_value?.toLocaleString() || "0"}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Won Revenue</p>
            <p className="text-2xl font-extrabold text-gray-900">${metrics?.total_won_value?.toLocaleString() || "0"}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Win Conversion Rate</p>
            <p className="text-2xl font-extrabold text-gray-900">{metrics?.win_rate_percentage || 0}%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Opportunities</p>
            <p className="text-2xl font-extrabold text-gray-900">{metrics?.total_deals_count || 0}</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* OPEN DEALS */}
        <div className="bg-gray-100/70 p-4 rounded-xl flex flex-col h-full border border-gray-200/60">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Active Opportunities ({deals.filter(d => d.status === "OPEN").length})
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1">
            {deals.filter(d => d.status === "OPEN").map(deal => (
              <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-sm">{deal.name}</h4>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${deal.amount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">{deal.company_name}</p>
                <div className="flex gap-2 pt-2 border-t border-gray-100 justify-between items-center">
                  <button 
                    onClick={() => handleGenerateProposal(deal.company_id)}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                  >
                    <Sparkles size={12} /> AI Proposal
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdateStatus(deal.id, "WON")} className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold rounded">Mark Won</button>
                    <button onClick={() => handleUpdateStatus(deal.id, "LOST")} className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded">Lost</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WON DEALS */}
        <div className="bg-green-50/60 p-4 rounded-xl flex flex-col h-full border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-green-800 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Closed Won ({deals.filter(d => d.status === "WON").length})
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1">
            {deals.filter(d => d.status === "WON").map(deal => (
              <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-green-100 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-sm">{deal.name}</h4>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">${deal.amount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">{deal.company_name}</p>
                <div className="text-xs text-green-600 font-semibold flex items-center gap-1 pt-1">
                  <CheckCircle2 size={12} /> Deal Converted
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOST DEALS */}
        <div className="bg-red-50/50 p-4 rounded-xl flex flex-col h-full border border-red-100">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-red-800 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Closed Lost ({deals.filter(d => d.status === "LOST").length})
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1">
            {deals.filter(d => d.status === "LOST").map(deal => (
              <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-sm">{deal.name}</h4>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">${deal.amount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">{deal.company_name}</p>
                <button onClick={() => handleUpdateStatus(deal.id, "OPEN")} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Reopen Deal</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Proposal Modal */}
      {selectedCompanyId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-xl overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-600" size={20} />
                <h3 className="text-lg font-bold text-gray-900">AI-Generated Solution Proposal</h3>
              </div>
              <button onClick={() => { setSelectedCompanyId(null); setProposal(null); }} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>

            {loadingProposal ? (
              <div className="py-12 text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                Analyzing website data and generating proposal package...
              </div>
            ) : proposal ? (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{proposal.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{proposal.executive_summary}</p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Scope Modules & Pricing</h5>
                  <div className="space-y-2">
                    {proposal.scope_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.module}</p>
                          <span className="text-xs text-purple-600 font-medium">Confidence: {item.confidence}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">${item.estimated_price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-sm font-bold text-purple-900">Total Project Package Value</span>
                  <span className="text-2xl font-extrabold text-purple-900">${proposal.total_estimated_value?.toLocaleString()} USD</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">Failed to load proposal outline.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
