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
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Bulk Import Prospects
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={20} />
            Add Company
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search companies..."
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter size={18} />
            Filters
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
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/companies/${company.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{company.website || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{company.location || company.address || "Location unavailable"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium flex items-center gap-1">
                        {(company as any).opportunity_score >= 90 ? <Circle size={10} className="fill-current text-green-500" /> :
                         (company as any).opportunity_score >= 70 ? <Circle size={10} className="fill-current text-yellow-500" /> :
                         <Circle size={10} className="fill-current text-red-500" />}
                        {(company as any).opportunity_score}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${(company as any).estimated_value?.toLocaleString() || "0"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        company.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        company.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={20} />
                      </button>
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
