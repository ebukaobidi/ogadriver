import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Search,
  Filter,
  AlertTriangle,
  Menu,
  MessageSquare,
  ShieldAlert,
  AlertOctagon,
  Clock,
  Ban,
  Undo2,
  CheckCircle2
} from 'lucide-react';
import { adminService } from '../../api/admin';

function JobDisputes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const adminRole = localStorage.getItem('admin_role') || 'admin';
  const canPerformDangerousActions = ['super_admin', 'security_admin'].includes(adminRole);

  useEffect(() => {
    loadDisputes();
  }, [currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else loadDisputes();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams({
        page: currentPage,
        search: searchTerm
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/jobs/disputes?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setDisputes(data.data.disputes.data);
        setTotalPages(data.data.disputes.last_page);
      }
    } catch (err) {
      console.error('Failed to load disputes:', err);
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
            <h1 className="text-xl font-bold text-white hidden sm:block">SOS & Dispute Resolution</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> Active Disputes & SOS
              </h1>
              <p className="text-slate-400 mt-1">Manage contract conflicts, breaches, and emergency triggers.</p>
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
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {disputes.map((dispute) => (
              <div key={dispute.id} className={`border-l-4 border-t border-b border-r rounded-r-2xl p-6 relative overflow-hidden ${
                dispute.severity === 'Critical' ? 'bg-red-500/5 border-l-red-500 border-slate-800' :
                dispute.severity === 'High' ? 'bg-amber-500/5 border-l-amber-500 border-slate-800' :
                'bg-slate-900 border-l-blue-500 border-slate-800'
              }`}>
                
                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                  
                  {/* Left Col: Metadata */}
                  <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-bold text-white text-lg">{dispute.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                        dispute.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        dispute.status === 'Investigating' ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {dispute.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Contract:</span>
                        <span className="text-sm text-slate-300 font-mono font-bold">{dispute.contractId}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Agreed Rate:</span>
                        <span className="text-sm text-brandMint font-mono font-bold">{dispute.agreedRate}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800/50">
                        <p className="text-sm font-bold text-slate-300 flex justify-between">
                          <span className="text-xs text-slate-500 font-normal mr-2">E:</span> {dispute.employer}
                        </p>
                        <p className="text-sm font-bold text-white flex justify-between">
                          <span className="text-xs text-slate-500 font-normal mr-2">O:</span> {dispute.operative}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Details & Actions */}
                  <div className="lg:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-bold uppercase tracking-wider text-sm flex items-center gap-2 ${
                          dispute.severity === 'Critical' ? 'text-red-500' : 
                          dispute.severity === 'High' ? 'text-amber-500' : 'text-blue-400'
                        }`}>
                          {dispute.severity === 'Critical' ? <AlertOctagon size={16} /> : <ShieldAlert size={16} />}
                          {dispute.type}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {dispute.dateReported}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                        {dispute.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-800/50">
                      {dispute.status !== 'Resolved' ? (
                        <>
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700 hover:border-brandMint text-slate-400 hover:text-brandMint rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider">
                            <MessageSquare size={14} /> Open Comms
                          </button>
                          {canPerformDangerousActions && (
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-red-500/30 hover:border-red-500/50 text-red-500 hover:text-red-400 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider">
                              <Ban size={14} /> Suspend Operative
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-slate-800 text-slate-400">
                          Dispute Resolved & Archived
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
            
            {disputes.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-mono border border-slate-800 border-dashed rounded-2xl">
                No active disputes or SOS alerts found.
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900/50 flex items-center justify-between">
                <p className="text-sm font-mono text-slate-500">
                  PAGE {currentPage} OF {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50"
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

export default JobDisputes;
