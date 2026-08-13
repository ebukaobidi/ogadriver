import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { adminService } from '../../api/admin';
import { withCache, debounce } from '../../utils/performance';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  User,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Plus,
  Eye,
  Ban,
  Key,
  Menu,
  ShieldCheck,
  Star,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon
} from 'lucide-react';
import { DirectoryView, ViewToggle } from '../../components/DirectoryView';

function UsersManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, banned: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const navigate = useNavigate();
  const adminRole = localStorage.getItem('admin_role') || 'admin';
  const canPerformDangerousActions = ['super_admin', 'security_admin'].includes(adminRole);

  const usersPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, [currentPage, filterRole, filterStatus]); // Debounced search term can be added, but for now we'll trigger explicitly or wait
  
  // Quick debounce for search term
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        search: searchTerm,
        role: filterRole,
        status: filterStatus
      });

      // Use cached fetch for better performance
      const cachedFetch = withCache('admin_users', async () => {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/users?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        return data;
      }, 30000); // 30 second cache

      const data = await cachedFetch();
      
      if (data.status === 'success') {
        setUsers(data.data.data); // Laravel pagination wraps in .data
        setTotalPages(data.data.last_page);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      // Show error state instead of failing silently
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const toggleDropdown = (userId) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'driver': 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-max"><User size={12}/> Operative</span>;
      case 'hirer': 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 w-max"><Briefcase size={12}/> Employer</span>;
      case 'admin': 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-brandMint/10 text-brandMint border border-brandMint/20 flex items-center gap-1 w-max"><Shield size={12}/> Admin</span>;
      default: 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-slate-800 text-slate-300 border border-slate-700 w-max">User</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-brandMint/10 text-brandMint border border-brandMint/20">Active</span>;
      case 'pending': 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>;
      case 'suspended': 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/20">Suspended</span>;
      case 'blacklisted': 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">Blacklisted</span>;
      default: 
        return <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-slate-800 text-slate-400 border border-slate-700">Unknown</span>;
    }
  };

  const handleAction = async (action, user) => {
    try {
      if (action === 'suspend') {
        if (!confirm(`Are you sure you want to ${user.status === 'active' ? 'suspend' : 'activate'} this user?`)) return;
        await adminService.suspendUser(user.id);
      } else if (action === 'reset') {
        if (!confirm('Are you sure you want to reset this user\'s password?')) return;
        await adminService.resetUserPassword(user.id);
      } else if (action === 'ban') {
        if (!confirm('Are you sure you want to permaban this user?')) return;
        await adminService.permabanUser(user.id);
      }
      loadUsers(); // refresh data
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // Pagination handled by state now



  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Global User Directory</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-white">Platform Users</h1>
              <p className="text-slate-400">Manage all accounts across the ecosystem.</p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-brandMint text-corporateNavy hover:bg-emerald-400 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors">
              <Plus size={18} /> Add New User
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <User className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{stats.total}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brandMint/10 rounded-xl border border-brandMint/20">
                  <CheckCircle className="text-brandMint" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{stats.active}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Clock className="text-amber-400" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{stats.pending}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <XCircle className="text-red-400" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">{stats.banned}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Banned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search users by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-brandMint"
              >
                <option value="all">All Roles</option>
                <option value="driver">Operatives</option>
                <option value="hirer">Employers</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-brandMint"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
            <div className="flex justify-end">
              <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="bg-brandMint/10 border border-brandMint/20 rounded-2xl p-4 mb-6 flex justify-between items-center animate-in slide-in-from-top-2">
              <span className="text-brandMint font-bold">{selectedUsers.length} Users Selected</span>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-slate-900 border border-brandMint/30 text-brandMint rounded-lg hover:bg-brandMint/20 text-xs font-bold uppercase tracking-wider transition-colors">
                  Activate
                </button>
                {canPerformDangerousActions && (
                  <>
                    <button className="px-4 py-1.5 bg-slate-900 border border-amber-500/30 text-amber-500 rounded-lg hover:bg-amber-500/20 text-xs font-bold uppercase tracking-wider transition-colors">
                      Suspend
                    </button>
                    <button className="px-4 py-1.5 bg-slate-900 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider transition-colors">
                      Ban
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Data Directory View */}
          <DirectoryView
            items={users}
            viewMode={viewMode}
            emptyMessage="No users found matching criteria."
            columns={[
              { label: 'Account' },
              { label: 'Role' },
              { label: 'Status' },
              { label: 'Contracts' },
              { label: 'Rating' },
              { label: 'Last Login' },
              { label: 'Actions', className: 'text-right' }
            ]}
            renderCard={(user) => (
              <div 
                key={user.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/50 hover:shadow-[0_0_20px_rgba(32,184,131,0.1)] transition-all group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 z-10">
                  <button
                    onClick={() => toggleDropdown(user.id)}
                    className="p-1.5 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeDropdown === user.id && (
                    <div className="absolute right-0 top-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 w-48 overflow-hidden animate-in fade-in zoom-in duration-100">
                      <button onClick={() => navigate(`/admin/users/${user.id}`)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 text-sm text-slate-300 transition-colors">
                        <Eye size={16} className="text-slate-500" /> View Profile
                      </button>
                      <button onClick={() => handleAction('reset', user)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 text-sm text-slate-300 transition-colors border-b border-slate-800">
                        <Key size={16} className="text-slate-500" /> Reset Password
                      </button>
                      {user.role !== 'super_admin' && canPerformDangerousActions && (
                        <>
                          <button onClick={() => handleAction('suspend', user)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-500/10 text-sm text-amber-500 transition-colors">
                            <Ban size={16} /> {user.status === 'active' ? 'Suspend Access' : 'Restore Access'}
                          </button>
                          <button onClick={() => handleAction('ban', user)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/10 text-sm text-red-500 transition-colors">
                            <Trash2 size={16} /> Permaban
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User size={24} className="text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-brandMint transition-colors leading-tight">{user.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Contracts</span>
                    <span className="font-mono text-white text-sm">{user.completedContracts || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Last Login</span>
                    <span className="text-xs text-slate-400 font-mono truncate" title={user.lastLogin}>{user.lastLogin}</span>
                  </div>
                </div>
              </div>
            )}
            renderList={(user) => (
              <div 
                key={user.id} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 hover:bg-slate-800/50 hover:border-brandMint/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-slate-500" />
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left min-w-[200px]">
                  <h3 className="font-bold text-white text-base group-hover:text-brandMint transition-colors">{user.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                </div>
                
                <div className="flex items-center gap-4 min-w-[200px]">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>

                <div className="hidden lg:flex flex-col flex-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Last Login</span>
                  <span className="text-xs text-slate-300 font-mono mt-1">{user.lastLogin}</span>
                </div>
                
                <div className="shrink-0 relative">
                  <button
                    onClick={() => toggleDropdown(user.id)}
                    className="p-2 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeDropdown === user.id && (
                    <div className="absolute right-0 top-10 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 w-48 overflow-hidden animate-in fade-in zoom-in duration-100">
                      <button onClick={() => navigate(`/admin/users/${user.id}`)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 text-sm text-slate-300 transition-colors">
                        <Eye size={16} className="text-slate-500" /> View Profile
                      </button>
                      <button onClick={() => handleAction('reset', user)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 text-sm text-slate-300 transition-colors border-b border-slate-800">
                        <Key size={16} className="text-slate-500" /> Reset Password
                      </button>
                      {user.role !== 'super_admin' && canPerformDangerousActions && (
                        <>
                          <button onClick={() => handleAction('suspend', user)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-500/10 text-sm text-amber-500 transition-colors">
                            <Ban size={16} /> {user.status === 'active' ? 'Suspend Access' : 'Restore Access'}
                          </button>
                          <button onClick={() => handleAction('ban', user)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/10 text-sm text-red-500 transition-colors">
                            <Trash2 size={16} /> Permaban
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            renderTableRow={(user) => (
              <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {getRoleBadge(user.role)}
                </td>
                <td className="p-4">
                  {getStatusBadge(user.status)}
                </td>
                <td className="p-4 text-xs font-mono text-slate-300">
                  {user.completedContracts}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                     <span className="font-bold text-white text-sm">{user.rating > 0 ? user.rating.toFixed(1) : 'N/A'}</span>
                     <Star size={12} className={user.rating > 0 ? 'fill-brandMint text-brandMint' : 'text-slate-700'} />
                  </div>
                </td>
                <td className="p-4 text-xs font-mono text-slate-500">
                  {user.lastLogin}
                </td>
                <td className="p-4 relative text-right">
                  <button
                    onClick={() => toggleDropdown(user.id)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeDropdown === user.id && (
                    <div className="absolute right-8 top-8 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 w-40 overflow-hidden animate-in fade-in zoom-in duration-100">
                      <button onClick={() => navigate(`/admin/users/${user.id}`)} className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-800 text-xs text-slate-300 transition-colors">
                        <Eye size={14} className="text-slate-500" /> View Profile
                      </button>
                      {user.role !== 'super_admin' && canPerformDangerousActions && (
                        <button onClick={() => handleAction('suspend', user)} className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-amber-500/10 text-xs text-amber-500 transition-colors">
                          <Ban size={14} /> {user.status === 'active' ? 'Suspend' : 'Restore'}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
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

          {/* Export */}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-brandMint text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
              <Download size={16} /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-brandMint text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
              <Upload size={16} /> Import Data
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}

export default UsersManagement;
