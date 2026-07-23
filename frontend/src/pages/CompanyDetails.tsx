import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, Phone, Mail, Globe, MapPin } from "lucide-react";

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  // Dummy data representing the Workspace view for Phase 1A
  const company = {
    id: id,
    name: "Acme Corp",
    website: "www.acme.com",
    status: "ACTIVE",
    pipeline_stage: "Qualified",
    industry: "Software",
    description: "Acme Corp provides leading software solutions for CRM.",
  };

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [id]);

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
              <span className="flex items-center gap-1"><Globe size={14} /> {company.website}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> San Francisco, CA</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
            {company.pipeline_stage}
          </span>
          <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
            {company.status}
          </span>
        </div>
      </div>

      {/* Workspace Grid (HubSpot Style) */}
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
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Contacts</h3>
              <button className="text-sm text-blue-600 font-medium">Add</button>
            </div>
            {/* Dummy Contact */}
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="border-b border-gray-100 px-6 py-4 flex gap-6 text-sm font-medium">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-4 -mb-4">Timeline</button>
            <button className="text-gray-500 hover:text-gray-900 pb-4 -mb-4">Notes</button>
            <button className="text-gray-500 hover:text-gray-900 pb-4 -mb-4">Emails</button>
            <button className="text-gray-500 hover:text-gray-900 pb-4 -mb-4">Deals</button>
          </div>
          <div className="p-6 flex-1 bg-gray-50/50 flex items-center justify-center text-gray-400">
            <p>Unified Activity Timeline goes here (Phase 1B)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
