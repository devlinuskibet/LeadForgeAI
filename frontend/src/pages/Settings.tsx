import { useState } from "react";
import { Building2, Users, Puzzle, ToggleLeft } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("organization");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-gray-100 bg-gray-50/50 p-4">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab("organization")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'organization' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Building2 size={18} /> Organization
            </button>
            <button 
              onClick={() => setActiveTab("roles")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'roles' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Users size={18} /> Users & Roles
            </button>
            <button 
              onClick={() => setActiveTab("integrations")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'integrations' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Puzzle size={18} /> Integrations
            </button>
            <button 
              onClick={() => setActiveTab("features")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'features' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ToggleLeft size={18} /> Feature Flags
            </button>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI Platform</p>
              <button 
                onClick={() => setActiveTab("ai_settings")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'ai_settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                AI Settings
              </button>
              <button 
                onClick={() => setActiveTab("ai_playground")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'ai_playground' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                AI Playground
              </button>
              <button 
                onClick={() => setActiveTab("ai_usage")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'ai_usage' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                AI Usage & Cost
              </button>
            </div>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === "organization" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Organization Details</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input type="text" defaultValue="Acme Corp" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
                  <input type="email" defaultValue="admin@acme.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Users & Roles</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">System Admin</td>
                      <td className="px-6 py-4 text-sm text-gray-500"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md font-medium text-xs">Admin</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Integrations</h2>
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Google Workspace (SMTP/IMAP)</h3>
                  <p className="text-sm text-gray-500 mt-1">Connect your email to send/receive directly in LeadForgeAI.</p>
                </div>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">Connect</button>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Feature Flags</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">AI Outreach Generator</h3>
                    <p className="text-sm text-gray-500">Enable AI-powered email writing.</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300" />
                    <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai_settings" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Settings</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="mock">Mock Provider (Testing)</option>
                    <option value="mimo">MiMo API</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Model</label>
                  <input type="text" defaultValue="mock-model-v1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Global Max Retries</label>
                  <input type="number" defaultValue={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Save AI Configuration</button>
              </div>
            </div>
          )}

          {activeTab === "ai_playground" && (
            <div className="h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 shrink-0">AI Playground</h2>
              <div className="flex-1 flex gap-6 min-h-0">
                {/* Left: Input */}
                <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Prompt</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
                      <option>Email Outreach (v1)</option>
                      <option>Website Analysis (v1)</option>
                    </select>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Preview</label>
                    <textarea readOnly className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-600 mb-4" value={"Write an email to {{company_name}} about {{context}}"} />
                    
                    <h3 className="font-medium text-sm text-gray-900 mb-2">Variables</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">company_name</label>
                        <input type="text" placeholder="Acme Corp" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">context</label>
                        <input type="text" placeholder="CRM software upgrade" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 mt-auto">Generate Response</button>
                </div>
                {/* Right: Output */}
                <div className="w-1/2 flex flex-col gap-4">
                  <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-y-auto flex flex-col">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Response</h3>
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-800 font-mono overflow-y-auto">
                      {"This is a mock response from mock-model-v1. Your prompt was 9 words long."}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-3 gap-4 text-center shrink-0">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Latency</p>
                      <p className="font-semibold text-gray-900">45ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Tokens</p>
                      <p className="font-semibold text-gray-900">19 (9 in, 10 out)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Est. Cost</p>
                      <p className="font-semibold text-green-600">$0.00003</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai_usage" && (
            <div className="max-w-4xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Usage & Cost Tracking</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Total API Cost (MTD)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">$1.45</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Total Tokens</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">14,500</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">124</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium text-gray-900">Recent AI Requests</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider / Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">mock-provider <span className="text-gray-500 text-xs ml-1">(mock-model-v1)</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium text-xs">SUCCESS</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">19</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">$0.00003</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
