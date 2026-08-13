import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Menu,
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Building2,
  ShieldCheck,
  CreditCard,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminService } from '../../api/admin';
import { DirectoryView, ViewToggle } from '../../components/DirectoryView';

function HirerManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hirers, setHirers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading Employers...');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total_employers: 0, active_access_tiers: 0, active_contracts: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('card');
  const navigate = useNavigate();
  const adminRole = localStorage.getItem('admin_role') || 'admin';
  const canPerformDangerousActions = ['super_admin', 'security_admin'].includes(adminRole);
  
  const loadingMessages = [
    'Loading Employers...',
    'Fetching Company Records...',
    'Analyzing Contracts...',
    'Preparing Directory...'
  ];

  const handleAction = async (action, hirer) => {
    try {
      if (action === 'suspend') {
        if (!confirm(`Are you sure you want to ${hirer.status === 'Active' ? 'suspend' : 'activate'} this employer?`)) return;
        await adminService.suspendHirer(hirer.id);
        loadHirers();
      }
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    loadHirers();
  }, [currentPage]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadHirers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Cycle through loading messages
  useEffect(() => {
    if (loading) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 1500);
      
      return () => clearInterval(interval);
    }
  }, [loading]);

  const loadHirers = async () => {
    try {
      setLoading(true);
      
      // Check cache first for initial load
      if (currentPage === 1 && !searchTerm) {
        const cacheKey = 'admin_hirers_list';
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime)) < 60000; // 1 minute cache
        
        if (cachedData && isCacheValid) {
          const parsedData = JSON.parse(cachedData);
          setHirers(parsedData.hirers);
          setTotalPages(parsedData.totalPages);
          setStats(parsedData.stats);
          setLoading(false);
          return;
        }
      }
      
      const token = localStorage.getItem('auth_token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        search: searchTerm
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/hirers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setHirers(data.data.data);
        setTotalPages(data.data.last_page);
        if (data.stats) {
          setStats(data.stats);
        }
        
        // Cache only initial load without search
        if (currentPage === 1 && !searchTerm) {
          const cacheKey = 'admin_hirers_list';
          localStorage.setItem(cacheKey, JSON.stringify({
            hirers: data.data.data,
            totalPages: data.data.last_page,
            stats: data.stats
          }));
          localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        }
      }
    } catch (err) {
      console.error('Failed to load hirers:', err);
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
            <h1 className="text-xl font-bold text-white hidden sm:block flex items-center gap-2">
              <Briefcase className="text-brandMint" size={20} /> Employers Directory
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Employer Management
              </h1>
              <p className="text-slate-400 mt-1">Manage individuals and corporate entities hiring Operatives.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Building2 size={64} />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Employers</p>
              <h2 className="text-3xl font-black text-white">{stats.total_employers}</h2>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard size={64} className="text-brandMint" />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Active Access Tiers</p>
              <h2 className="text-3xl font-black text-brandMint">{stats.active_access_tiers}</h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={64} className="text-blue-500" />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Active Contracts</p>
              <h2 className="text-3xl font-black text-blue-400">{stats.active_contracts}</h2>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by Employer Name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                />
              </div>
              </div>
              <div className="flex justify-end">
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
              </div>
            </div>

            <DirectoryView
              items={hirers}
              viewMode={viewMode}
              emptyMessage="No employers found matching criteria."
              columns={[
                { label: 'Employer' },
                { label: 'Contact' },
                { label: 'Access Tier' },
                { label: 'Active Contracts', className: 'text-center' },
                { label: 'Status' },
                { label: 'Actions', className: 'text-right' }
              ]}
              renderCard={(hirer) => (
                <div 
                  key={hirer.id} 
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/50 hover:shadow-[0_0_20px_rgba(32,184,131,0.1)] transition-all group flex flex-col items-center text-center relative overflow-hidden cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform ${
                    hirer.type === 'Corporate' ? 'bg-blue-600' : 'bg-slate-700'
                  }`}>
                    {hirer.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-white text-lg group-hover:text-brandMint transition-colors leading-tight">{hirer.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1 mb-4">{hirer.id} &bull; {hirer.type}</p>
                  
                  <div className="flex flex-col gap-1 w-full text-left bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4">
                    <p className="text-xs text-slate-400 truncate"><Mail size={12} className="inline mr-1"/> {hirer.email}</p>
                    <p className="text-xs text-slate-400"><Briefcase size={12} className="inline mr-1"/> {hirer.phone}</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                       hirer.accessTier === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                       hirer.accessTier === 'Premium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                       'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {hirer.accessTier}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      hirer.status === 'Active' ? 'bg-brandMint/10 text-brandMint border-brandMint/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {hirer.status}
                    </span>
                  </div>

                  <div className="w-full mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contracts</span>
                      <span className="font-bold text-white">{hirer.activeContracts}</span>
                    </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/hirers/${hirer.id}`)} className="p-1.5 text-slate-400 hover:text-brandMint bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors" title="View Profile">
                          <Eye size={16} />
                        </button>
                        {canPerformDangerousActions && (
                          <button onClick={() => handleAction('suspend', hirer)} className={`p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors ${hirer.status === 'Active' ? 'text-amber-500 hover:text-amber-400' : 'text-brandMint hover:text-brandMint'}`} title={hirer.status === 'Active' ? 'Suspend' : 'Restore'}>
                            {hirer.status === 'Active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                        )}
                      </div>
                  </div>
                </div>
              )}
              renderList={(hirer) => (
                <div 
                  key={hirer.id} 
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 hover:bg-slate-800/50 hover:border-brandMint/30 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-md ${
                    hirer.type === 'Corporate' ? 'bg-blue-600' : 'bg-slate-700'
                  }`}>
                    {hirer.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left min-w-[200px]">
                    <h3 className="font-bold text-white text-base group-hover:text-brandMint transition-colors">{hirer.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{hirer.email} &bull; {hirer.phone}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                       hirer.accessTier === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                       hirer.accessTier === 'Premium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                       'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {hirer.accessTier}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      hirer.status === 'Active' ? 'bg-brandMint/10 text-brandMint border-brandMint/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {hirer.status}
                    </span>
                  </div>

                  <div className="hidden lg:flex flex-col flex-1 text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contracts</span>
                    <span className="font-bold text-white text-sm mt-1">{hirer.activeContracts}</span>
                  </div>
                  
                  <div className="shrink-0 flex gap-2">
                    <button onClick={() => navigate(`/admin/hirers/${hirer.id}`)} className="p-2 text-slate-400 hover:text-brandMint bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors" title="View Profile">
                      <Eye size={16} />
                    </button>
                    {canPerformDangerousActions && (
                      <button onClick={() => handleAction('suspend', hirer)} className={`p-2 bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors ${hirer.status === 'Active' ? 'text-amber-500 hover:text-amber-400' : 'text-brandMint hover:text-brandMint'}`} title={hirer.status === 'Active' ? 'Suspend' : 'Restore'}>
                        {hirer.status === 'Active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              )}
              renderTableRow={(hirer) => (
                <tr key={hirer.id} className="hover:bg-slate-800/50 transition-colors group cursor-pointer">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                        hirer.type === 'Corporate' ? 'bg-blue-600' : 'bg-slate-700'
                      }`}>
                        {hirer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-brandMint transition-colors text-sm">{hirer.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{hirer.id} &bull; {hirer.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="text-xs text-slate-300">{hirer.email}</p>
                    <p className="text-[10px] text-slate-500">{hirer.phone}</p>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                       hirer.accessTier === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                       hirer.accessTier === 'Premium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                       'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {hirer.accessTier}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="font-mono text-white text-sm bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {hirer.activeContracts}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      hirer.status === 'Active' ? 'bg-brandMint/10 text-brandMint border-brandMint/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {hirer.status === 'Active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {hirer.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/admin/hirers/${hirer.id}`)} className="p-1.5 text-slate-400 hover:text-brandMint hover:bg-slate-800 rounded-lg transition-colors" title="View Profile">
                          <Eye size={14} />
                        </button>
                        {canPerformDangerousActions && (
                          <button onClick={() => handleAction('suspend', hirer)} className={`p-1.5 hover:bg-slate-800 rounded-lg transition-colors ${hirer.status === 'Active' ? 'text-amber-500 hover:text-amber-400' : 'text-brandMint hover:text-brandMint'}`} title={hirer.status === 'Active' ? 'Suspend' : 'Restore'}>
                            {hirer.status === 'Active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                          </button>
                        )}
                      </div>
                  </td>
                </tr>
              )}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 px-4 py-3 border border-slate-800 rounded-xl bg-slate-900/50 flex items-center justify-between">
                <p className="text-sm font-mono text-slate-500">
                  PAGE {currentPage} OF {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

        </main>
      </div>
    </div>
  );
}

export default HirerManagement;
