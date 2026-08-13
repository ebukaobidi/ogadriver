import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Search,
  Filter,
  Eye,
  Menu,
  ShieldCheck,
  Radio,
  MapPin,
  Clock,
  Briefcase
} from 'lucide-react';
import { adminService } from '../../api/admin';

function ActiveJobs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveContracts();
  }, [currentPage, filterStatus]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else loadActiveContracts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadActiveContracts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams({
        page: currentPage,
        search: searchTerm,
        status: filterStatus
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/jobs/active?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setContracts(data.data.contracts.data);
        setTotalPages(data.data.contracts.last_page);
      }
    } catch (err) {
      console.error('Failed to load active contracts:', err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Active Matchmaking</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Briefcase className="text-brandMint" /> Live Contracts
              </h1>
              <p className="text-slate-400 mt-1">Monitor currently active deployments and contract status.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by Contract ID, Employer, or Operative..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-brandMint"
              >
                <option value="all">All Stages</option>
                <option value="agreed">Terms Agreed (Awaiting Handover)</option>
                <option value="en_route">Operative En Route</option>
                <option value="live">Active Duty</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contract ID</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parties</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agreed Rate</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Deployment</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Telemetry</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-white block mb-1">{contract.id}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                          contract.status === 'live' ? 'bg-brandMint/10 text-brandMint border border-brandMint/20' :
                          contract.status === 'en_route' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {contract.status.replace('_', ' ')}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-300 flex justify-between">
                            <span className="text-slate-500 font-normal mr-2">E:</span> {contract.employer}
                          </p>
                          <p className="text-sm font-bold text-white flex justify-between">
                            <span className="text-slate-500 font-normal mr-2">O:</span> {contract.operative}
                          </p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <ShieldCheck size={16} className="text-brandMint" />
                           <span className="font-mono font-bold text-brandMint">{contract.agreedRate}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <Clock size={12} /> {contract.duration} ({contract.startDate} - {contract.endDate})
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <MapPin size={12} /> {contract.location}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Radio size={16} className={
                            contract.telemetryStatus === 'Active' ? 'text-blue-400 animate-pulse' : 
                            contract.telemetryStatus === 'Waiting' ? 'text-amber-500' : 'text-red-500'
                          } />
                          <div className="flex flex-col">
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                              contract.telemetryStatus === 'Active' ? 'text-blue-400' : 
                              contract.telemetryStatus === 'Waiting' ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {contract.telemetryStatus}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">Last Ping: {contract.lastPing}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="px-3 py-1.5 bg-slate-950 border border-slate-700 hover:border-brandMint text-slate-400 hover:text-brandMint rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                          >
                            <Eye size={14} /> Monitor
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500 font-mono">
                        No active contracts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <p className="text-sm font-mono text-slate-500">
                  PAGE {currentPage} OF {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default ActiveJobs;
