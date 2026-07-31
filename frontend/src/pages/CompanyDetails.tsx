import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, Globe, MapPin, Search, Bot, Briefcase, Activity, PlayCircle, Target, BrainCircuit, ExternalLink, CalendarDays, CheckCircle2, ChevronRight, XCircle, Tag, Zap, Sparkles, Check, Star } from 'lucide-react';
import { PreviewEmailModal } from '../components/PreviewEmailModal';
import TimelineWidget from "../widgets/TimelineWidget";

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [autoProspecting, setAutoProspecting] = useState(false);
  
  // Real data state
  const [company, setCompany] = useState<any>(null);
  const [insights, setInsights] = useState<{inferred_problems: any[], recommended_solutions: any[], opportunity_score?: number, sales_coach_advice?: string} | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);
  
  // Email states
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

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

  const handleSaveDraft = async () => {
    if (!company?.draft_email) return;
    setIsSavingDraft(true);
    try {
      const res = await fetch(`http://localhost:8000/api/emails/${company.draft_email.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, body: emailBody })
      });
      if (!res.ok) throw new Error("Failed to save draft");
      fetchCompanyData(); // refresh to get updated data
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSendEmail = async () => {
    if (!company?.draft_email) return;
    setIsSending(true);
    try {
      // First save any pending edits
      await fetch(`http://localhost:8000/api/emails/${company.draft_email.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, body: emailBody })
      });

      const res = await fetch(`http://localhost:8000/api/emails/${company.draft_email.id}/send`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to send email");
      
      setIsPreviewOpen(false);
      fetchCompanyData(); // refresh
      fetchWorkflowHistory(); // refresh timeline
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  if (loading || !company) {
    return <div className="p-8 text-gray-500">Loading company details...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Breadcrumb / Back */}
      <div>
        <Link to="/companies" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} />
          Back to Companies
        </Link>
      </div>

      {/* Header Profile */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1 group">
                <Globe size={14} /> 
                <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">{company.website}</a>
                <button 
                  onClick={handleAnalyze} 
                  disabled={analyzing}
                  className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Website'}
                </button>
              </span>
              <span className="flex items-center gap-1"><MapPin size={14} /> San Francisco, CA</span>
            </div>
            {/* Tags */}
            <div className="flex items-center gap-2 mt-3">
              <Tag size={14} className="text-gray-400" />
              {(company.tags || []).map((tag: any) => (
                <span key={tag.id} className={`px-2 py-0.5 text-xs font-medium rounded-md ${tag.color}`}>
                  {tag.name}
                </span>
              ))}
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add Tag</button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
              {company.pipeline_stage}
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
              {company.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAutoProspect}
              disabled={autoProspecting}
              className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {autoProspecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Auto-Prospecting...
                </>
              ) : (
                <>
                  <Zap size={16} /> Auto-Prospect
                </>
              )}
            </button>
            <button 
              onClick={handleGenerateOutreach}
              disabled={generating || autoProspecting}
              className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Outreach
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Opportunity Timeline */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between text-sm font-medium relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
            
            <div className="flex flex-col items-center gap-2 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm"><Check size={16} /></div>
              <span className="text-gray-900">Discovered</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm"><Check size={16} /></div>
              <span className="text-gray-900">Analyzed</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg ring-4 ring-purple-50">3</div>
              <span className="text-gray-900 font-bold">Draft Ready</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">4</div>
              <span className="text-gray-400">Sent</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">5</div>
              <span className="text-gray-400">Won</span>
            </div>
          </div>
        </div>

      {/* Sales Intelligence Full Width Banner */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
          <Zap size={20} className="text-purple-600 fill-current" /> Sales Intelligence & AI Insights
        </h3>

        {insights ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opportunity Score Card */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Opportunity Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {insights.opportunity_score || 92}
                  </span>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">High Priority</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-100">
                <p className="text-xs text-gray-500 font-medium">Estimated Deal Value</p>
                <span className="text-2xl font-bold text-gray-900">
                  ${insights.recommended_solutions?.reduce((acc: number, curr: any) => acc + (curr.estimated_value || 0), 0).toLocaleString() || "3,200"}
                </span>
              </div>
            </div>

            {/* Identified Problems & Solutions */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Identified Operational Gaps</h4>
                <ul className="space-y-2">
                  {insights.inferred_problems?.map((prob: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-red-500 font-bold">•</span>
                      <div>
                        <span className="text-gray-900 font-medium">{prob.problem || prob}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Recommended Solutions</h4>
                <div className="space-y-2">
                  {insights.recommended_solutions?.map((sol: any, i: number) => (
                    <div key={i} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex justify-between items-center text-xs">
                      <span className="font-medium text-gray-900">{sol.solution || sol}</span>
                      <span className="font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shrink-0">
                        ${sol.estimated_value?.toLocaleString() || "1,500"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Sales Coach */}
            <div>
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase size={14} /> AI Sales Coach Strategy
              </h4>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 h-full max-h-[220px] overflow-y-auto">
                <p className="text-xs text-purple-900 leading-relaxed italic">
                  "{insights.sales_coach_advice || "Their website lacks online admissions. Admissions season starts next month. Parents currently must call the school. Recommend offering an Admissions Portal, AI Chatbot, and Online Payments."}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100/80">
            <div className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Zap size={20} className="fill-current" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">AI Website Analysis Ready</h4>
            <p className="text-xs text-gray-600 max-w-md mx-auto mb-3">Run automated website scraping to infer operational problems, calculate deal opportunity score, and generate AI solution packages.</p>
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing Website...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Run AI Analysis Now
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: About & Contacts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <p className="text-sm text-gray-600">{company.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Industry</span>
                <span className="font-medium text-gray-900">{company.industry}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discovery Source</span>
                <span className="font-medium text-gray-900">{company.discovery_source || "Manual Entry"}</span>
              </div>
              {company.rating && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Google Rating</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    {company.rating} <Star size={14} className="text-yellow-400 fill-current" /> ({company.review_count} reviews)
                  </span>
                </div>
              )}
              {company.business_status && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Business Status</span>
                  <span className="font-medium text-gray-900">{company.business_status}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Contacts</h3>
              <button className="text-sm text-blue-600 font-medium">Add</button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium shrink-0">
                JD
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">Decision Maker</p>
              </div>
            </div>
          </div>

          {workflowHistory.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Workflow History</h3>
              <div className="space-y-4">
                {workflowHistory.map((job) => (
                  <div key={job.id} className="border-l-2 border-purple-200 pl-4 py-1">
                    <p className="text-sm font-medium text-gray-900 flex items-center justify-between mb-2">
                      Auto-Prospect Workflow
                      <span className="text-xs font-normal text-gray-500">
                        {new Date(job.started_at).toLocaleDateString()}
                      </span>
                    </p>
                    <ul className="space-y-1">
                      {job.logs?.map((log: string, i: number) => (
                        <li key={i} className={`text-xs ${log.toLowerCase().includes('error') ? 'text-red-600' : 'text-green-600'}`}>
                          {log}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Unified Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px] lg:h-auto">
          <div className="border-b border-gray-100 px-6 py-4 flex gap-6 text-sm font-medium">
            <button 
              onClick={() => setActiveTab("timeline")}
              className={`pb-4 -mb-4 ${activeTab === 'timeline' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Timeline
            </button>
            <button 
              onClick={() => setActiveTab("notes")}
              className={`pb-4 -mb-4 ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Notes
            </button>
            <button 
              onClick={() => setActiveTab("emails")}
              className={`pb-4 -mb-4 ${activeTab === 'emails' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Emails
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden bg-gray-50/30">
            {activeTab === "timeline" && <TimelineWidget companyId={id as string} refreshTrigger={workflowHistory.length} />}
            {activeTab === "notes" && <div className="p-6 flex flex-col h-full"><textarea className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4" placeholder="Write a note..."></textarea><button className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">Save Note</button></div>}
            {activeTab === "emails" && (
              <div className="p-6 h-full overflow-y-auto">
                {company.draft_email ? (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                      <div>
                        {company.draft_email.status !== 'DRAFT' ? (
                          <>
                            <h4 className="font-semibold text-gray-900">{company.draft_email.subject}</h4>
                            <p className="text-sm text-gray-500 mt-1">From: copilot@leadforge.ai</p>
                          </>
                        ) : (
                          <>
                            <input 
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              className="font-semibold text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full outline-none"
                              placeholder="Subject"
                            />
                            <p className="text-sm text-gray-500 mt-1">From: copilot@leadforge.ai</p>
                          </>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-md border ${company.draft_email.status !== 'DRAFT' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                        {company.draft_email.status !== 'DRAFT' && company.draft_email.sent_at ? `Sent on ${new Date(company.draft_email.sent_at).toLocaleDateString()}` : company.draft_email.status}
                      </span>
                    </div>
                    <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {company.draft_email.status !== 'DRAFT' ? (
                        company.draft_email.body
                      ) : (
                        <textarea
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="w-full h-64 bg-transparent border-none p-0 focus:ring-0 resize-y outline-none"
                        />
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
                      {company.draft_email.status === 'DRAFT' && (
                        <>
                          <button 
                            onClick={handleSaveDraft}
                            disabled={isSavingDraft}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                          >
                            {isSavingDraft ? 'Saving...' : 'Save Draft'}
                          </button>
                          <button 
                            onClick={() => setIsPreviewOpen(true)}
                            className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg shadow-sm hover:bg-purple-100"
                          >
                            Preview Email
                          </button>
                          <button 
                            onClick={handleSendEmail}
                            disabled={isSending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                          >
                            {isSending ? 'Sending...' : 'Send Email'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No emails generated yet.
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
      
      <PreviewEmailModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        email={company?.draft_email ? {
          subject: emailSubject,
          body: emailBody,
          recipients: ["john.doe@example.com"], // Hardcoded for preview visual since it's mock
          sender: "copilot@leadforge.ai"
        } : null} 
      />
    </div>
  );
}
