import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Menu,
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  UserPlus,
  Key,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { adminService } from '../../api/admin';

function AdminManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total_personnel: 0, super_admins: 0, two_factor_enforced: 0, audit_logs: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAdmins();
  }, [currentPage]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadAdmins();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        search: searchTerm
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/admins?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAdmins(data.data.data);
        setTotalPages(data.data.last_page);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-500">
        <Shield className="animate-pulse w-12 h-12 mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Authenticating Command Center...</p>
      </div>
    );
  }

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
              <Shield className="text-red-500" size={20} /> Admin Directory
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Command Personnel
              </h1>
              <p className="text-slate-400 mt-1">Manage system administrators, security officers, and moderators.</p>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-wider">
              <UserPlus size={16} /> Provision New Admin
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield size={64} className="text-red-500" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Personnel</p>
              <h2 className="text-2xl font-black text-white">{stats.total_personnel}</h2>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe size={64} className="text-blue-500" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Super Admins</p>
              <h2 className="text-2xl font-black text-blue-400">{stats.super_admins}</h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lock size={64} className="text-brandMint" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2FA Enforced</p>
              <h2 className="text-2xl font-black text-brandMint">{stats.two_factor_enforced}</h2>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database size={64} className="text-amber-500" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Logs</p>
              <h2 className="text-2xl font-black text-amber-500">{stats.audit_logs > 1000 ? Math.floor(stats.audit_logs/1000) + 'K+' : stats.audit_logs}</h2>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by Admin Name or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl hover:border-red-500 text-slate-300 transition-colors">
                <Filter size={20} />
                <span>Filters</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin ID</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Personnel Identity</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Clearance Level</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Security</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="py-4 font-mono text-sm text-slate-400">
                        {admin.id}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-white group-hover:text-red-400 transition-colors">{admin.name}</p>
                            <p className="text-xs text-slate-500">{admin.email} &bull; {admin.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                           admin.role === 'Super Admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                           admin.role === 'Admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                           'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          admin.twoFactor ? 'text-brandMint' : 'text-amber-500'
                        }`}>
                          <Key size={12} />
                          {admin.twoFactor ? '2FA Enabled' : '2FA Missing'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">Last Login: {admin.lastLogin}</div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          admin.status === 'Active' ? 'bg-brandMint/10 text-brandMint border-brandMint/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {admin.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-lg transition-colors">
                          Manage Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminManagement;
