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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            Structured Search Parameters
          </h2>
          
          <form onSubmit={startDiscovery} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={searchParams.business_type}
                    onChange={(e) => setSearchParams({...searchParams, business_type: e.target.value})}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g., Schools, HVAC, Plumbers"
                    disabled={isRunning}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="e.g., Nairobi, Chicago IL"
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
                    <span className="text-sm font-bold text-gray-900">≈ {Math.ceil(summary.estimated_outreach_time_mins)} mins</span>
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
                    <span className="text-sm font-bold text-gray-900">≈ {Math.ceil(summary.estimated_outreach_time_mins)} mins</span>
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
