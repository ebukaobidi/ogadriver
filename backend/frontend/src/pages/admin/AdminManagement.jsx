import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Menu, Shield, Search, Filter, CheckCircle, XCircle, UserPlus,
  Key, Database, Lock, Globe, X, Edit, Trash2
} from 'lucide-react';
import api from '../../api/axios';

function AdminManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total_personnel: 0, super_admins: 0, two_factor_enforced: 0, audit_logs: 0 });
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    role_slug: 'admin',
    admin_department: 'none',
    admin_state_id: '',
    status: 'Active'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAdmins();
    loadStates();
  }, [currentPage]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else loadAdmins();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadStates = async () => {
    try {
      const response = await api.get('/states/1'); // Assuming Nigeria is 1
      if (response.data && response.data.data) {
        setStates(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load states', err);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/admins', {
        params: { page: currentPage, search: searchTerm }
      });
      
      const data = response.data;
      if (data.status === 'success') {
        setAdmins(data.data.data);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
      alert('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, admin = null) => {
    setModalMode(mode);
    if (mode === 'edit' && admin) {
      setFormData({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        password: '',
        role_slug: admin.role_slug,
        admin_department: admin.department,
        admin_state_id: admin.admin_state_id || '',
        status: admin.status
      });
    } else {
      setFormData({
        id: null, name: '', email: '', password: '', role_slug: 'admin', admin_department: 'none', admin_state_id: '', status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'add') {
        await api.post('/admin/admins', formData);
        alert('Admin provisioned successfully');
      } else {
        await api.put(`/admin/admins/${formData.id}`, formData);
        alert('Admin updated successfully');
      }
      setIsModalOpen(false);
      loadAdmins();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently revoke this admin access?')) return;
    try {
      await api.delete(`/admin/admins/${id}`);
      alert('Admin permanently revoked');
      loadAdmins();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading && admins.length === 0) {
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
              <h1 className="text-2xl font-black text-white flex items-center gap-2">Command Personnel</h1>
              <p className="text-slate-400 mt-1">Manage system administrators, security officers, and regional management.</p>
            </div>
            <button onClick={() => handleOpenModal('add')} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors text-xs font-bold uppercase tracking-wider">
              <UserPlus size={16} /> Provision New Admin
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={64} className="text-red-500" /></div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Personnel</p>
              <h2 className="text-2xl font-black text-white">{stats.total_personnel}</h2>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Globe size={64} className="text-blue-500" /></div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Super Admins</p>
              <h2 className="text-2xl font-black text-blue-400">{stats.super_admins}</h2>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Lock size={64} className="text-brandMint" /></div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2FA Enforced</p>
              <h2 className="text-2xl font-black text-brandMint">{stats.two_factor_enforced ? 'YES' : 'NO'}</h2>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Database size={64} className="text-amber-500" /></div>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin ID</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Personnel Identity</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignment</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="py-4 font-mono text-sm text-slate-400">{admin.admin_id_formatted}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-bold text-white group-hover:text-red-400 transition-colors">{admin.name}</p>
                            <p className="text-xs text-slate-500">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            admin.role === 'Super Admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>{admin.role}</span>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Dept: {admin.department}</span>
                            {admin.department === 'regional' && <span className="text-[10px] text-amber-500 uppercase">Region: {admin.state_name}</span>}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          admin.status === 'Active' ? 'bg-brandMint/10 text-brandMint border-brandMint/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {admin.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />} {admin.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal('edit', admin)} className="p-2 text-slate-400 hover:text-blue-400 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-lg transition-colors" title="Manage Access">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(admin.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-lg transition-colors" title="Revoke">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Provision/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Shield className="text-red-500" /> 
                {modalMode === 'add' ? 'Provision New Admin' : 'Manage Access'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personnel Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-red-500 focus:outline-none" disabled={modalMode === 'edit'} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secure Email</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-red-500 focus:outline-none" disabled={modalMode === 'edit'} />
                    </div>
                </div>

                {modalMode === 'add' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Password</label>
                        <input type="password" required={modalMode === 'add'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-red-500 focus:outline-none" />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clearance Level (Role)</label>
                        <select value={formData.role_slug} onChange={e => setFormData({...formData, role_slug: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-red-500 focus:outline-none">
                            <option value="admin">Administrator</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Assignment</label>
                        <select value={formData.admin_department} onChange={e => setFormData({...formData, admin_department: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-red-500 focus:outline-none">
                            <option value="none">No Department</option>
                            <option value="super">Command (Super)</option>
                            <option value="treasury">Treasury / Finance</option>
                            <option value="regional">Regional Operations</option>
                            <option value="support">Customer Support</option>
                        </select>
                    </div>
                </div>

                {formData.admin_department === 'regional' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned State/Region</label>
                        <select required value={formData.admin_state_id} onChange={e => setFormData({...formData, admin_state_id: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-red-500 focus:outline-none">
                            <option value="">-- Select State --</option>
                            {states.map(state => (
                                <option key={state.id} value={state.id}>{state.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {modalMode === 'edit' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Status</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-red-500 focus:outline-none">
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-slate-400 hover:text-white font-bold uppercase tracking-wider text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-50">
                  {saving ? 'Processing...' : (modalMode === 'add' ? 'Provision Admin' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
