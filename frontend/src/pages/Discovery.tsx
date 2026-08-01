import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radar, Search, Activity, CheckCircle, AlertCircle, MapPin, Star, Globe, ArrowRight, Building2, Briefcase, Database } from 'lucide-react';

export function Discovery() {
  const [searchParams, setSearchParams] = useState({
    business_type: '',
    location: '',
    max_results: 10,
    min_rating: 4.0,
    has_website: true
  });
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [apiStats, setApiStats] = useState<any>(null);
  
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/discovery/stats');
      if (response.ok) {
        setApiStats(await response.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const startDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.business_type || !searchParams.location) return;
    
    setJobStatus('starting');
    setLogs([]);
    setSummary(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/discovery/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });
      const data = await response.json();
      setJobId(data.job_id);
      setJobStatus('in_progress');
    } catch (err) {
      console.error("Failed to start discovery", err);
      setJobStatus('failed');
      setLogs(prev => [...prev, "Failed to connect to discovery service"]);
    }
  };

  useEffect(() => {
    if (!jobId || jobStatus === 'failed') return;
    if (jobStatus === 'completed' && summary) return; // Stop polling if completed AND summary loaded
    
    const interval = setInterval(async () => {
      try {
        // Poll job status
        const response = await fetch(`http://localhost:8000/api/discovery/job/${jobId}`);
        const data = await response.json();
        
        setJobStatus(data.status);
        if (data.logs) {
          setLogs(data.logs);
        }
        
        // If completed, fetch summary
        if (data.status === 'completed' && !summary) {
          const sumResponse = await fetch(`http://localhost:8000/api/discovery/job/${jobId}/summary`);
          if (sumResponse.ok) {
            const sumData = await sumResponse.json();
            setSummary(sumData);
            fetchStats(); // Update stats after job completes
          }
        }
      } catch (err) {
        console.error("Failed to poll discovery job", err);
      }
    }, 1500); // 1.5s polling
    
    return () => clearInterval(interval);
  }, [jobId, jobStatus, summary]);

  const isRunning = jobStatus === 'in_progress' || jobStatus === 'starting';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radar className="w-6 h-6 text-purple-600" />
            Prospect Discovery Agent
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Deploy the AI agent to search Google Places, analyze websites, and inject qualified prospects directly into your CRM.
          </p>
        </div>
        {apiStats && (
          <div className="flex bg-white rounded-lg border border-gray-200 shadow-sm p-3 items-center gap-4 hidden md:flex">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
              <Database className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">API Requests</p>
                <p className="text-sm font-bold text-gray-900">{apiStats.requests_made}</p>
              </div>
            </div>
            <div className="pr-4 border-r border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cache Hits</p>
              <p className="text-sm font-bold text-green-600">{apiStats.cache_hits}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg Time</p>
              <p className="text-sm font-bold text-blue-600">{apiStats.average_time_seconds}s</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/90 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-purple-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 tracking-tight">
              <Search className="w-4 h-4 text-purple-600" />
              Structured Search Parameters
            </h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Presets:</span>
              <button 
                type="button"
                onClick={() => setSearchParams({ ...searchParams, business_type: 'Plumbers', location: 'Rongai' })}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
              >
                Plumbers in Rongai
              </button>
              <button 
                type="button"
                onClick={() => setSearchParams({ ...searchParams, business_type: 'Schools', location: 'Nairobi' })}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
              >
                Schools in Nairobi
              </button>
              <button 
                type="button"
                onClick={() => setSearchParams({ ...searchParams, business_type: 'Dentists', location: 'Westlands' })}
                className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
              >
                Dentists in Westlands
              </button>
            </div>
          </div>
          
          <form onSubmit={startDiscovery} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Business Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={searchParams.business_type}
                    onChange={(e) => setSearchParams({...searchParams, business_type: e.target.value})}
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs font-medium transition-all shadow-2xs"
                    placeholder="e.g., Schools, HVAC, Plumbers"
                    disabled={isRunning}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs font-medium transition-all shadow-2xs"
                    placeholder="e.g., Rongai, Nairobi, Chicago IL"
                    disabled={isRunning}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Results</label>
                <select
                  value={searchParams.max_results}
                  onChange={(e) => setSearchParams({...searchParams, max_results: parseInt(e.target.value)})}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  disabled={isRunning}
                >
                  <option value={10}>10 results</option>
                  <option value={25}>25 results</option>
                  <option value={50}>50 results</option>
                  <option value={100}>100 results</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Star className="h-4 w-4 text-yellow-400" />
                  </div>
                  <select
                    value={searchParams.min_rating}
                    onChange={(e) => setSearchParams({...searchParams, min_rating: parseFloat(e.target.value)})}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    disabled={isRunning}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3.0}>3.0+</option>
                    <option value={4.0}>4.0+</option>
                    <option value={4.5}>4.5+</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center mt-6">
                <input
                  id="has_website"
                  type="checkbox"
                  checked={searchParams.has_website}
                  onChange={(e) => setSearchParams({...searchParams, has_website: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={isRunning}
                />
                <label htmlFor="has_website" className="ml-2 block text-sm text-gray-900 flex items-center gap-1">
                  <Globe className="w-4 h-4 text-gray-500" /> Must have website
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isRunning || !searchParams.business_type || !searchParams.location}
                className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
              >
                {isRunning ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    Discovery Pipeline Running...
                  </>
                ) : (
                  <>
                    <Radar className="w-5 h-5 text-purple-400" />
                    Launch Discovery Pipeline
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {(logs.length > 0 || isRunning) && (
        <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 border-l border-slate-800 pl-3">telemetry_terminal.log</span>
            </div>
            {jobStatus === 'completed' && <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full shadow-2xs">PROCESS_COMPLETE</span>}
            {jobStatus === 'failed' && <span className="text-[11px] font-mono font-bold text-red-400 bg-red-950/60 border border-red-800/50 px-2.5 py-0.5 rounded-full shadow-2xs">PROCESS_FAILED</span>}
            {isRunning && <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2.5 py-0.5 rounded-full shadow-2xs animate-pulse">EXECUTING_PIPELINE...</span>}
          </div>
          <div className="p-6 font-mono text-xs h-80 overflow-y-auto space-y-2 bg-slate-950">
            {logs.map((log, i) => (
              <div key={i} className={`flex items-start ${
                log.toLowerCase().includes('error') || log.toLowerCase().includes('failed') ? 'text-red-400 font-semibold' :
                log.startsWith('---') || log.startsWith('──') ? 'text-slate-600' :
                'text-emerald-400/90'
              }`}>
                {log.startsWith('─') ? (
                  <div className="w-full tracking-widest text-slate-700">{log}</div>
                ) : (
                  <>
                    <span className="text-slate-600 mr-3 shrink-0">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                    <span className="break-all">{log}</span>
                  </>
                )}
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-purple-400 animate-pulse pt-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Executing live scraping & AI opportunity scoring...</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {summary && (
        <div className="bg-white border border-purple-100 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              Discovery Summary
            </h2>
            <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              Phase Complete
            </span>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-500 font-medium">Businesses Found</p>
                <p className="text-3xl font-bold text-gray-900">{summary.businesses_found}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Websites Analyzed</p>
                <p className="text-3xl font-bold text-blue-600">{summary.websites_found}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Potential Revenue</p>
                <p className="text-3xl font-bold text-green-600">${summary.potential_revenue?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Ready For Outreach</p>
                <p className="text-3xl font-bold text-purple-600">{summary.ready_for_outreach}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Opportunity Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">High Opportunity (80+)</span>
                    <span className="text-sm font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">{summary.high_opportunity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-700">Medium Opportunity (50-79)</span>
                    <span className="text-sm font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{summary.medium_opportunity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Low Opportunity (&lt;50)</span>
                    <span className="text-sm font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded">{summary.low_opportunity}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Averages & Estimates</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Average Opportunity Score</span>
                    <span className="text-sm font-bold text-gray-900">{summary.average_opportunity_score}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Average Deal Size</span>
                    <span className="text-sm font-bold text-gray-900">${summary.average_deal_size?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Estimated Outreach Time</span>
                    <span className="text-sm font-bold text-gray-900">~ {Math.ceil(summary.estimated_outreach_time_mins)} mins</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center border-t border-gray-100 pt-6">
              <Link 
                to="/companies" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                Review High Priority Companies <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {(logs.length > 0 || isRunning) && (
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-950">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs font-mono text-gray-400">telemetry_terminal</span>
            </div>
            {jobStatus === 'completed' && <span className="text-xs font-mono text-green-400">PROCESS_COMPLETE</span>}
            {jobStatus === 'failed' && <span className="text-xs font-mono text-red-400">PROCESS_FAILED</span>}
          </div>
          <div className="p-6 font-mono text-sm h-80 overflow-y-auto">
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className={`flex items-start ${
                  log.toLowerCase().includes('error') || log.toLowerCase().includes('failed') ? 'text-red-400' :
                  log.startsWith('---') || log.startsWith('──') ? 'text-gray-600' :
                  'text-gray-300'
                }`}>
                  {log.startsWith('─') ? (
                    <div className="w-full tracking-widest">{log}</div>
                  ) : (
                    <>
                      <span className="text-gray-600 mr-4 shrink-0">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                      <span className="break-all">{log}</span>
                    </>
                  )}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center text-purple-400 mt-4 animate-pulse">
                  <span className="text-gray-600 mr-4">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                  <span>Agent is working...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {summary && (
        <div className="bg-white border border-purple-100 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              Discovery Summary
            </h2>
            <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              Phase Complete
            </span>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-500 font-medium">Businesses Found</p>
                <p className="text-3xl font-bold text-gray-900">{summary.businesses_found}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Websites Analyzed</p>
                <p className="text-3xl font-bold text-blue-600">{summary.websites_found}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Potential Revenue</p>
                <p className="text-3xl font-bold text-green-600">${summary.potential_revenue?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Ready For Outreach</p>
                <p className="text-3xl font-bold text-purple-600">{summary.ready_for_outreach}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Opportunity Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">High Opportunity (80+)</span>
                    <span className="text-sm font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">{summary.high_opportunity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-700">Medium Opportunity (50-79)</span>
                    <span className="text-sm font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{summary.medium_opportunity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Low Opportunity (&lt;50)</span>
                    <span className="text-sm font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded">{summary.low_opportunity}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Averages & Estimates</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Average Opportunity Score</span>
                    <span className="text-sm font-bold text-gray-900">{summary.average_opportunity_score}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Average Deal Size</span>
                    <span className="text-sm font-bold text-gray-900">${summary.average_deal_size?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Estimated Outreach Time</span>
                    <span className="text-sm font-bold text-gray-900">~ {Math.ceil(summary.estimated_outreach_time_mins)} mins</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center border-t border-gray-100 pt-6">
              <Link 
                to="/companies" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                Review High Priority Companies <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
