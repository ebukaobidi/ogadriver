import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { DirectoryView, ViewToggle } from '../../components/DirectoryView';
import { adminService } from '../../api/admin';
import api from '../../api/axios';
import { withCache } from '../../utils/performance';
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ShieldCheck,
  User,
  Star,
  MapPin,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function DriverList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading Directory...');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  
  const loadingMessages = [
    'Loading Directory...',
    'Fetching Driver Records...',
    'Applying Filters...',
    'Preparing View...'
  ];

  const handleAction = async (action, driver) => {
    try {
      if (action === 'revoke') {
        if (!confirm(`Are you sure you want to revoke clearance for ${driver.name}?`)) return;
        await adminService.rejectDriver(driver.id);
        loadDrivers();
      }
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [currentPage, filterStatus]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadDrivers();
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

  const loadDrivers = async () => {
    try {
      setLoading(true);
      
      // Check cache first for initial load
      if (currentPage === 1 && filterStatus === 'all' && !searchTerm) {
        const cacheKey = 'admin_drivers_list_v2';
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime)) < 60000; // 1 minute cache
        
        if (cachedData && isCacheValid) {
          const parsedData = JSON.parse(cachedData);
          setDrivers(parsedData.drivers);
          setTotalPages(parsedData.totalPages);
          setLoading(false);
          return;
        }
      }
      
      const response = await api.get('/admin/drivers', {
        params: {
          page: currentPage,
          search: searchTerm,
          status: filterStatus
        }
      });
      
      const data = response.data;
      
      if (data.status === 'success') {
        setDrivers(data.data.data);
        setTotalPages(data.data.last_page);
      }
    } catch (err) {
      console.error('Failed to load drivers:', err);
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
            <h1 className="text-xl font-bold text-white hidden sm:block">Operative Directory</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white">Driver Management</h1>
              <p className="text-slate-400">Manage all operatives in the matchmaking directory.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search operatives by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-slate-500" size={20} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-brandMint"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active (Cleared)</option>
                  <option value="pending">Pending Vetting</option>
                  <option value="inactive">Inactive</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>
              <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          </div>

          {/* Data Table / List / Card */}
          <DirectoryView
            items={drivers}
            viewMode={viewMode}
            emptyMessage="No operatives found matching criteria."
            columns={[
              { label: 'Operative' },
              { label: 'Subscription' },
              { label: 'Clearance' },
              { label: 'Guarantors' },
              { label: 'Contracts' },
              { label: 'Status' },
              { label: 'Actions', className: 'text-right' }
            ]}
            renderCard={(driver) => (
              <div 
                key={driver.id} 
                onClick={() => navigate(`/admin/drivers/${driver.id}`)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/50 hover:shadow-[0_0_20px_rgba(32,184,131,0.1)] transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brandMint to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                  {driver.avatar ? (
                    <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-500" />
                  )}
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-brandMint transition-colors">{driver.name}</h3>
                <p className="text-xs text-slate-500 font-mono mb-4">{driver.email}</p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest ${
                    driver.status === 'active' ? 'bg-brandMint/10 text-brandMint border border-brandMint/20' :
                    driver.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    driver.status === 'blacklisted' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {driver.status}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest ${
                    driver.subscription?.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {driver.subscription?.plan || driver.subscription_tier || 'No Plan'}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest ${
                    driver.clearanceLevel === 'Elite' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    driver.clearanceLevel === 'Premium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    driver.clearanceLevel === 'Revoked' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {driver.clearanceLevel}
                  </span>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-800">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase">Rating</span>
                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                      <Star size={14} className="fill-amber-400" /> {driver.rating > 0 ? driver.rating : 'N/A'}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase">Jobs</span>
                    <span className="font-bold text-white text-sm">{driver.completedContracts || 0}</span>
                  </div>
                </div>
              </div>
            )}
            renderList={(driver) => (
              <div 
                key={driver.id} 
                onClick={() => navigate(`/admin/drivers/${driver.id}`)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 hover:bg-slate-800/50 hover:border-brandMint/30 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                  {driver.avatar ? (
                    <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-slate-500" />
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-white text-lg group-hover:text-brandMint transition-colors">{driver.name}</h3>
                  <p className="text-sm text-slate-400">{driver.email}</p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 flex-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</span>
                    <span className={`text-xs font-mono font-bold mt-1 ${
                      driver.status === 'active' ? 'text-brandMint' :
                      driver.status === 'pending' ? 'text-amber-500' :
                      driver.status === 'blacklisted' ? 'text-red-500' :
                      'text-slate-400'
                    }`}>
                      {driver.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Subscription</span>
                    <span className={`text-xs font-mono font-bold mt-1 ${
                      driver.subscription?.status === 'active' ? 'text-blue-400' : 'text-slate-400'
                    }`}>
                      {(driver.subscription?.plan || driver.subscription_tier || 'None').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clearance</span>
                    <span className={`text-xs font-mono font-bold mt-1 ${
                      driver.clearanceLevel === 'Elite' ? 'text-purple-400' :
                      driver.clearanceLevel === 'Premium' ? 'text-blue-400' :
                      driver.clearanceLevel === 'Revoked' ? 'text-red-500' :
                      'text-slate-300'
                    }`}>
                      {driver.clearanceLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rating</span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mt-1">
                      <Star size={12} className="fill-amber-400" /> {driver.rating > 0 ? driver.rating : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center justify-end gap-2 text-slate-500 group-hover:text-white transition-colors">
                  <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">View Profile</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            )}
            renderTableRow={(driver) => (
              <tr key={driver.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                      {driver.avatar ? (
                        <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white cursor-pointer hover:text-brandMint transition-colors" onClick={() => navigate(`/admin/drivers/${driver.id}`)}>{driver.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{driver.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest w-fit ${
                      driver.subscription?.status === 'active'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {driver.subscription?.plan || driver.subscription_tier || 'None'}
                    </span>
                    {driver.subscription?.expires_at && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Exp {new Date(driver.subscription.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest ${
                    driver.clearanceLevel === 'Elite' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    driver.clearanceLevel === 'Premium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    driver.clearanceLevel === 'Revoked' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {driver.clearanceLevel}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                     <ShieldCheck size={14} className={driver.guarantorStatus === 'Verified' ? 'text-brandMint' : driver.guarantorStatus === 'Fraudulent' ? 'text-red-500' : 'text-amber-500'} />
                     <span className="text-sm font-mono text-slate-400">{driver.guarantorStatus}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                     <span className="font-bold text-white">{driver.completedContracts}</span>
                     <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                       <Star size={12} className="fill-amber-400" /> {driver.rating > 0 ? driver.rating : 'N/A'}
                     </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest ${
                    driver.status === 'active' ? 'bg-brandMint/10 text-brandMint border border-brandMint/20' :
                    driver.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    driver.status === 'blacklisted' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {driver.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/drivers/${driver.id}`)}
                      className="p-2 text-slate-400 hover:text-brandMint hover:bg-brandMint/10 rounded-lg transition-colors"
                      title="View Dossier"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/drivers/${driver.id}/edit`)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit Record"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleAction('revoke', driver)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Revoke Clearance"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
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

export default DriverList;
