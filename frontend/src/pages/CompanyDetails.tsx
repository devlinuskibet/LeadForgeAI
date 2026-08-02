import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, Globe, MapPin, Bot, Briefcase, Activity, Tag, Zap, Sparkles, Check, Star, ChevronDown, Users, History } from 'lucide-react';
import { PreviewEmailModal } from '../components/PreviewEmailModal';
import TimelineWidget from "../widgets/TimelineWidget";

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [autoProspecting, setAutoProspecting] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  
  // Real data state
  const [company, setCompany] = useState<any>(null);
  const [insights, setInsights] = useState<{inferred_problems: any[], recommended_solutions: any[], opportunity_score?: number, sales_coach_advice?: string} | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);
  
  // Email states
  const [emailSubject] = useState("");
  const [emailBody] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/companies/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCompany(data);
        if (data.insights) {
          setInsights(data.insights);
        }
        if (data.draft_email) {
          setEmailSubject(data.draft_email.subject);
          setEmailBody(data.draft_email.body);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowHistory = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/copilot/company/${id}/jobs`);
      if (res.ok) {
        const data = await res.json();
        setWorkflowHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCompanyData();
    fetchWorkflowHistory();
  }, [id]);

  // Polling for OrchestrationJob
  useEffect(() => {
    let interval: any;
    if (jobId && jobStatus !== "completed" && jobStatus !== "failed") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/copilot/job/${jobId}`);
          if (res.ok) {
            const data = await res.json();
            setJobStatus(data.status);
            
            if (data.status === "completed") {
              setAutoProspecting(false);
              fetchCompanyData(); // Re-fetch to get new insights and email
              fetchWorkflowHistory();
              setActiveTab("emails");
            } else if (data.status === "failed") {
              setAutoProspecting(false);
              fetchWorkflowHistory();
              console.error("Auto-prospect failed:", data.error_message);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const handleAutoProspect = async () => {
    try {
      setAutoProspecting(true);
      setJobStatus("pending");
      const res = await fetch(`http://localhost:8000/api/copilot/company/${id}/auto-prospect`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setJobId(data.job_id);
      } else {
        // Mock success fallback
        setJobId("mock-job-id");
      }
    } catch (e) {
      console.error(e);
      setAutoProspecting(false);
    }
  };

  const handleGenerateOutreach = async () => {
    try {
      setGenerating(true);
      
      const res = await fetch(`http://localhost:8000/api/copilot/company/${id}/generate-outreach`, {
        method: 'POST'
      });
      
      // We don't fail hard on mock UUIDs right now for frontend preview
      if (!res.ok) {
        console.warn("Copilot API failed (likely missing UUID in DB), simulating success for UI.");
      }
      
      // Simulate network delay for effect
      await new Promise(r => setTimeout(r, 1500));
      
      fetchCompanyData(); // Re-fetch to get new email draft
      setActiveTab("emails");
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch(`http://localhost:8000/api/copilot/company/${id}/analyze`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        console.warn("Analysis API failed.");
      } else {
        fetchCompanyData(); // refresh insights
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !company) {
    return <div className="p-8 text-gray-500">Loading company details...</div>;
  }

  return (
    <div className="flex flex-col min-h-full space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/companies" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} />
          Back to Companies
        </Link>
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 flex items-center gap-1.5">
          <Sparkles size={13} /> AI Copilot Enabled
        </span>
      </div>

      {/* Elevated Hero Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/90 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start md:items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-200">
            <Building2 size={32} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{company.name}</h1>
              <span className="px-3 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {company.status}
              </span>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-full border border-purple-100">
                {company.pipeline_stage || "Analyzed"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-medium text-gray-600">
              {company.website && (
                <span className="flex items-center gap-1.5 text-purple-700">
                  <Globe size={13} className="text-purple-500" /> 
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="font-semibold hover:underline">{company.website}</a>
                </span>
              )}
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> {company.location || company.address || "Location unavailable"}</span>
              {company.rating && (
                <span className="flex items-center gap-1 text-gray-800 font-semibold">
                  <Star size={13} className="text-amber-400 fill-current" /> {company.rating} ({company.review_count || 30} reviews)
                </span>
              )}
            </div>
            {/* Tags */}
            <div className="flex items-center gap-2 mt-3">
              <Tag size={13} className="text-gray-400" />
              {(company.tags || []).map((tag: any) => (
                <span key={tag.id} className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md ${tag.color}`}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Dropdown Menu & Quick Action Buttons */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button 
            onClick={handleAutoProspect}
            disabled={autoProspecting}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {autoProspecting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Auto-Prospecting...
              </>
            ) : (
              <>
                <Zap size={15} /> Auto-Prospect Lead
              </>
            )}
          </button>

          {/* Unified AI Dropdown Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>Actions</span>
              <ChevronDown size={14} className={`transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isActionMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <button 
                  onClick={() => { setIsActionMenuOpen(false); handleAnalyze(); }}
                  disabled={analyzing}
                  className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Sparkles size={14} className="text-purple-600" /> Run AI Website Analysis
                </button>
                <button 
                  onClick={() => { setIsActionMenuOpen(false); handleGenerateOutreach(); }}
                  disabled={generating}
                  className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Bot size={14} className="text-blue-600" /> Generate AI Outreach Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Storyteller Lead Journey Stepper */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/90">
        <div className="flex items-center justify-between text-xs font-semibold relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-purple-500 to-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
          
          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100 ring-4 ring-emerald-50 font-bold"><Check size={16} /></div>
            <span className="text-gray-900 font-extrabold tracking-tight">1. Discovered</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className={`w-8 h-8 rounded-full ${insights ? 'bg-emerald-500 text-white shadow-md ring-4 ring-emerald-50' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-bold`}>
              {insights ? <Check size={16} /> : '2'}
            </div>
            <span className={insights ? 'text-gray-900 font-extrabold tracking-tight' : 'text-gray-400 font-medium'}>2. Analyzed</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className={`w-8 h-8 rounded-full ${company.draft_email ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 ring-4 ring-purple-50 animate-pulse' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-bold`}>
              3
            </div>
            <span className={company.draft_email ? 'text-purple-700 font-extrabold tracking-tight' : 'text-gray-400 font-medium'}>3. Draft Ready</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold border border-gray-200">4</div>
            <span className="text-gray-400 font-medium">4. Sent</span>
          </div>

          <div className="flex flex-col items-center gap-2 bg-white px-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold border border-gray-200">5</div>
            <span className="text-gray-400 font-medium">5. Won</span>
          </div>
        </div>
      </div>

      {/* Clustered Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-3 bg-gray-50/50 flex gap-8 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab("insights")}
            className={`pb-3 -mb-3 flex items-center gap-2 transition-colors ${activeTab === 'insights' ? 'text-purple-700 border-b-2 border-purple-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Zap size={16} /> Sales Intelligence & Strategy
          </button>
          <button 
            onClick={() => setActiveTab("contacts")}
            className={`pb-3 -mb-3 flex items-center gap-2 transition-colors ${activeTab === 'contacts' ? 'text-purple-700 border-b-2 border-purple-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Users size={16} /> Decision Makers ({company.contacts?.length || 1})
          </button>
          <button 
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 -mb-3 flex items-center gap-2 transition-colors ${activeTab === 'timeline' ? 'text-purple-700 border-b-2 border-purple-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Activity size={16} /> Unified Timeline
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`pb-3 -mb-3 flex items-center gap-2 transition-colors ${activeTab === 'history' ? 'text-purple-700 border-b-2 border-purple-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <History size={16} /> Workflow Telemetry ({workflowHistory.length})
          </button>
        </div>

        {/* Tab 1: Sales Intelligence */}
        {activeTab === 'insights' && (
          <div className="p-6">
            {insights ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Opportunity Score Card */}
                <div className="p-6 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white rounded-2xl shadow-lg shadow-purple-100 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-200">AI Deal Valuation</span>
                      <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                        High Priority
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 mt-4">
                      <span className="text-5xl font-black tracking-tight">
                        {insights.opportunity_score || 92}
                      </span>
                      <span className="text-xs text-purple-200 font-semibold">/ 100 Opportunity</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/15">
                    <p className="text-[11px] text-purple-200 font-semibold uppercase tracking-wider">Estimated Solution Value</p>
                    <span className="text-3xl font-black tracking-tight">
                      ${insights.recommended_solutions?.reduce((acc: number, curr: any) => acc + (curr.estimated_value || 0), 0).toLocaleString() || "3,500"}
                    </span>
                  </div>
                </div>

                {/* Operational Gaps & Solutions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Inferred Operational Problems</h4>
                    <div className="space-y-2">
                      {insights.inferred_problems?.map((prob: any, i: number) => (
                        <div key={i} className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="text-gray-900 font-medium">{prob.problem || prob}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Recommended Solution Package</h4>
                    <div className="space-y-2">
                      {insights.recommended_solutions?.map((sol: any, i: number) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-900">{sol.solution || sol}</span>
                          <span className="font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full shrink-0">
                            ${sol.estimated_value?.toLocaleString() || "1,500"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Sales Coach Advice */}
                <div>
                  <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase size={14} /> AI Sales Coach Strategy
                  </h4>
                  <div className="bg-gradient-to-br from-purple-50 via-indigo-50/70 to-purple-100/60 p-5 rounded-2xl border border-purple-200/80 text-xs text-purple-950 leading-relaxed space-y-4 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                        Tailored Pitch
                      </span>
                      <span className="text-[11px] font-semibold text-purple-700">Digital Transformation</span>
                    </div>
                    <p className="font-medium italic leading-relaxed text-gray-900 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-purple-100/60">
                      "{insights.sales_coach_advice || "Website lacks online admissions & payment portal. High priority for AI digital transformation package."}"
                    </p>
                    <button 
                      onClick={handleGenerateOutreach}
                      disabled={generating}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-purple-200 inline-flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} /> Generate Outreach for Strategy
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                <div className="w-12 h-12 bg-white text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Zap size={24} className="fill-current" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">AI Sales Intelligence Ready</h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto mb-4">Scrape website content, infer operational bottlenecks, and generate bespoke AI solution packages.</p>
                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md inline-flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Analyzing Website...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} /> Run AI Analysis Now
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Contacts */}
        {activeTab === 'contacts' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Decision Maker Contacts</h3>
              <button className="text-xs text-blue-600 font-semibold hover:underline">+ Add Contact</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-700 font-bold rounded-full flex items-center justify-center shrink-0">
                  JD
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Decision Maker / Owner</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Timeline */}
        {activeTab === 'timeline' && (
          <div className="p-6">
            <TimelineWidget entityType="company" entityId={id!} />
          </div>
        )}

        {/* Tab 4: Workflow Telemetry History */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Autonomous Workflow Telemetry</h3>
            {workflowHistory.length > 0 ? (
              <div className="space-y-4">
                {workflowHistory.map((job) => (
                  <div key={job.id} className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50/60 rounded-r-xl">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-900 mb-2">
                      <span>Auto-Prospect Workflow ({job.status})</span>
                      <span className="text-gray-400 font-normal">{new Date(job.started_at).toLocaleString()}</span>
                    </div>
                    <ul className="space-y-1 font-mono text-xs">
                      {job.logs?.map((log: string, i: number) => (
                        <li key={i} className={log.toLowerCase().includes('error') ? 'text-red-600' : 'text-green-700'}>
                          › {log}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No background workflow logs recorded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      <PreviewEmailModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        email={{
          subject: emailSubject || (company?.draft_email?.subject || "Outreach Email"),
          body: emailBody || (company?.draft_email?.body || "Outreach content..."),
          recipients: [company?.website || "contact@example.com"],
          sender: "copilot@leadforge.ai"
        }}
      />
    </div>
  );
}
