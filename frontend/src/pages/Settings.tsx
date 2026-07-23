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
        </div>
      </div>
    </div>
  );
}
