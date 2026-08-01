import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Plus, MoreHorizontal, Circle } from "lucide-react";

interface Company {
  id: string;
  name: string;
  website: string | null;
  status: string;
  location?: string | null;
  address?: string | null;
}

export default function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/companies/");
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        }
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);

  const handleBulkImport = async () => {
    try {
      setImporting(true);
      
      // Basic CSV parser
      const lines = bulkData.split("\n").filter(l => l.trim() !== "");
      const items = lines.map(line => {
        const parts = line.split(",");
        return { name: parts[0]?.trim(), website: parts[1]?.trim() || "" };
      });

      const res = await fetch("http://localhost:8000/api/prospecting/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(items)
      });
      
      if (res.ok) {
        setShowBulkImport(false);
        setBulkData("");
        // In a real app, refresh the table here
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full space-y-6 max-w-7xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Accounts & Lead Directory</h1>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100 shadow-2xs">
              {companies.length} Total Prospects
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">Manage, filter, and execute AI outreach across discovered business leads.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus size={16} />
            Bulk Import
          </button>
        </div>
      </div>

      {/* Glassmorphic Search & Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/60 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs font-medium transition-all"
            placeholder="Search by company name or domain..."
          />
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-gray-400 mr-1 shrink-0">Filter:</span>
          <button className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors shrink-0">
            All Leads
          </button>
          <button className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors shrink-0">
            High Priority (90+)
          </button>
          <button className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors shrink-0">
            Active
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Opportunity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading companies...
                  </td>
                </tr>
              ) : companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.website || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No companies found.
                  </td>
                </tr>
              ) : (
                companies
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.website || '').toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((company) => (
                  <tr key={company.id} className="hover:bg-purple-50/40 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/companies/${company.id}`} className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100/70 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {company.name.charAt(0)}
                        </div>
                        <span>{company.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600 font-medium">{company.website || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600 font-medium">{company.location || company.address || "Location unavailable"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          (company as any).opportunity_score >= 80 ? 'bg-emerald-500 shadow-xs' :
                          (company as any).opportunity_score >= 50 ? 'bg-amber-500 shadow-xs' :
                          'bg-red-400'
                        }`}></span>
                        <span className="text-gray-900">{(company as any).opportunity_score || 90}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-100">
                        ${(company as any).estimated_value?.toLocaleString() || "3,500"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-[11px] leading-5 font-bold rounded-full border ${
                        company.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        company.status === 'PAUSED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <Link to={`/companies/${company.id}`} className="text-purple-600 hover:text-purple-900 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white px-3 py-1.5 rounded-lg transition-all shadow-2xs">
                        View Lead →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Bulk Import Prospects</h2>
            <p className="text-sm text-gray-500 mb-4">
              Paste CSV data below. Format: <code>Company Name, Website URL</code>
            </p>
            <textarea
              className="w-full h-48 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500 mb-4"
              placeholder="ABC School, abcschool.edu&#10;XYZ Hotel, xyzhotel.com"
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowBulkImport(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkImport}
                disabled={importing || !bulkData.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
              >
                {importing ? "Importing & Analyzing..." : "Start Auto-Prospecting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
