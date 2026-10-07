import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Search,
  AlertOctagon,
  ShieldAlert,
  UserX,
  FileX,
  Menu,
  Clock,
  Unlock
} from 'lucide-react';
import api from '../../api/axios';

function DriverBlacklist() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blacklistedDrivers, setBlacklistedDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', nin: '', reason: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadBlacklist();
  }, [currentPage]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else loadBlacklist();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadBlacklist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/security/blacklist', {
        params: {
          page: currentPage,
          search: searchTerm
        }
      });
      
      const data = response.data;
      
      if (data.status === 'success') {
        setBlacklistedDrivers(data.data.data);
        setTotalPages(data.data.last_page);
      }
    } catch (err) {
      console.error('Failed to load blacklist:', err);
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
            <h1 className="text-xl font-bold text-white hidden sm:block">Clearance Revocation Log</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <ShieldAlert className="text-red-500 w-8 h-8" /> Blacklisted Operatives
              </h1>
              <p className="text-slate-400 mt-1">Permanent ban log. These operatives are blocked from the directory.</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search blacklist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {blacklistedDrivers.map((driver) => (
              <div key={driver.id} className="bg-slate-900 border-l-4 border-l-red-500 border-t border-b border-r border-slate-800 rounded-r-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                  
                  {/* Operative Info */}
                  <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                        <UserX size={24} className="text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{driver.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">
                          Clearance Revoked
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-slate-300 font-mono">{driver.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span className="text-slate-300 font-mono">{driver.phone}</span>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800/50">
                        <span className="text-slate-500 flex items-center gap-1"><Clock size={14}/> Date Banned:</span>
                        <span className="text-slate-300 font-mono text-xs">{driver.dateBlacklisted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Incident Details */}
                  <div className="lg:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                          <AlertOctagon size={16} className="text-red-400" /> 
                          {driver.reasonType}
                        </h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                          driver.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-500'
                        }`}>
                          {driver.severity} Severity
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                        {driver.reasonDetails}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <FileX size={14} /> Logged by: <span className="text-slate-300">{driver.adminName}</span>
                      </div>
                      
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-700 hover:border-brandMint text-slate-400 hover:text-brandMint rounded-lg transition-colors text-xs font-bold uppercase tracking-wider">
                        <Unlock size={14} /> Review Ban
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
            
            {blacklistedDrivers.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-mono border border-slate-800 border-dashed rounded-2xl">
                No blacklisted operatives match your search.
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

export default DriverBlacklist;
