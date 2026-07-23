import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, Phone, Mail, Globe, MapPin, Tag } from "lucide-react";
import TimelineWidget from "../widgets/TimelineWidget";

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");

  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoProspecting, setAutoProspecting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [insights, setInsights] = useState<{inferred_problems: any[], recommended_solutions: any[]} | null>(null);

  // Dummy data representing the Workspace view for Phase 1B
  const company = {
    id: id,
    name: "Acme Corp",
    website: "www.acme.com",
    status: "ACTIVE",
    pipeline_stage: "Qualified",
    industry: "Software",
    description: "Acme Corp provides leading software solutions for CRM.",
    tags: [
      { id: 1, name: "High Priority", color: "bg-red-100 text-red-700" },
      { id: 2, name: "AI Interested", color: "bg-purple-100 text-purple-700" }
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
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
              // Trigger a fetch to insights so UI updates
              handleAnalyze(); 
              // And switch tab to emails
              setActiveTab("emails");
            } else if (data.status === "failed") {
              setAutoProspecting(false);
              console.error("Auto-prospect failed:", data.error_message);
            }
          } else {
             // Mock polling success if db disconnected
             setAutoProspecting(false);
             setJobStatus("completed");
             handleAnalyze();
             setActiveTab("emails");
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
      const mockUuid = "00000000-0000-0000-0000-000000000000"; 
      const res = await fetch(`http://localhost:8000/api/copilot/company/${mockUuid}/auto-prospect`, {
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
      // We assume standard ID for mock purposes or we use the UUID if available.
      // Since `id` from URL might be "1" in dummy data, we just mock the request.
      // In a real app we'd use the real DB UUID.
      const mockUuid = "00000000-0000-0000-0000-000000000000"; 
      
      const res = await fetch(`http://localhost:8000/api/copilot/company/${mockUuid}/generate-outreach`, {
        method: 'POST'
      });
      
      // We don't fail hard on mock UUIDs right now for frontend preview
      if (!res.ok) {
        console.warn("Copilot API failed (likely missing UUID in DB), simulating success for UI.");
      }
      
      // Simulate network delay for effect
      await new Promise(r => setTimeout(r, 1500));
      
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
      const mockUuid = "00000000-0000-0000-0000-000000000000"; 
      const res = await fetch(`http://localhost:8000/api/copilot/company/${mockUuid}/analyze`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        console.warn("Analysis API failed (mocking response for UI).");
        // Mock fallback for UI if DB isn't seeded right
        await new Promise(r => setTimeout(r, 1500));
        setInsights({
          inferred_problems: [{ problem: "No mobile app", severity: "High" }],
          recommended_solutions: [{ solution: "Build React Native App", confidence: "High" }]
        });
      } else {
        const data = await res.json();
        setInsights({
          inferred_problems: data.inferred_problems,
          recommended_solutions: data.recommended_solutions
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
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
              {company.tags.map(tag => (
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
                  ⚡ Auto-Prospect
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
                  ✨ Generate Outreach
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: About & Contacts */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <p className="text-sm text-gray-600">{company.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Industry</span>
                <span className="font-medium text-gray-900">{company.industry}</span>
              </div>
            </div>
          </div>

          {insights && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 bg-gradient-to-b from-purple-50/50 to-white">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <span>✨</span> AI Insights
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">Inferred Problems</h4>
                  <ul className="space-y-2">
                    {insights.inferred_problems.map((p, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{p.problem} <span className="text-xs text-gray-400">({p.severity})</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-3 border-t border-purple-100">
                  <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">Recommended Solutions</h4>
                  <ul className="space-y-2">
                    {insights.recommended_solutions.map((s, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">→</span>
                        <span>{s.solution} <span className="text-xs text-gray-400">({s.confidence} match)</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

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
            {activeTab === "timeline" && <TimelineWidget />}
            {activeTab === "notes" && <div className="p-6 flex flex-col h-full"><textarea className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4" placeholder="Write a note..."></textarea><button className="self-end bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">Save Note</button></div>}
            {activeTab === "emails" && (
              <div className="p-6 h-full overflow-y-auto">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">[AI Draft] Opportunity with Acme</h4>
                      <p className="text-sm text-gray-500 mt-1">To: John Doe • From: copilot@leadforge.ai</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-md border border-yellow-200">
                      Draft
                    </span>
                  </div>
                  <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    Hi John,

I noticed that Acme Corp has been exploring CRM software upgrades. Our platform, LeadForgeAI, provides a highly customized solution tailored to software companies looking to streamline their sales pipelines with embedded AI.

Would you have 10 minutes next week to discuss how we could integrate our tools with your current setup?

Best regards,
LeadForgeAI Copilot
                  </div>
                  <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Discard</button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">Send Email</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
