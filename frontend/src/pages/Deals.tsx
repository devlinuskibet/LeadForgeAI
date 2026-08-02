import { useState, useEffect } from "react";
import { DollarSign, Trophy, XCircle, TrendingUp, Sparkles, FileText, CheckCircle2 } from "lucide-react";

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[85vh] border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">AI Solution Proposal Package</h3>
                  <span className="text-[11px] font-semibold text-purple-600">Generated from scraped website intelligence</span>
                </div>
              </div>
              <button onClick={() => { setSelectedCompanyId(null); setProposal(null); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            {loadingProposal ? (
              <div className="py-16 text-center text-gray-500 space-y-3">
                <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-xs font-bold text-gray-900">Synthesizing Proposal Package...</p>
                <p className="text-xs text-gray-500">Analyzing operational gaps, ROI metrics, and module scopes.</p>
              </div>
            ) : proposal ? (
              <div className="space-y-5">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 p-4 rounded-xl border border-purple-100/80">
                  <h4 className="text-lg font-black text-gray-900">{proposal.title}</h4>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed mt-2">{proposal.executive_summary}</p>
                </div>

                <div>
                  <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Scope Modules & Investment</h5>
                  <div className="space-y-2">
                    {proposal.scope_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 bg-gray-50/70 rounded-xl border border-gray-100">
                        <div>
                          <p className="text-xs font-bold text-gray-900">{item.module}</p>
                          <span className="text-[11px] text-purple-600 font-semibold">AI Confidence: {item.confidence}</span>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          ${item.estimated_price?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-100">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-200">Total Solution Value</span>
                  <span className="text-2xl font-black tracking-tight">${proposal.total_estimated_value?.toLocaleString()} USD</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 text-xs font-semibold">Failed to load proposal outline.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
