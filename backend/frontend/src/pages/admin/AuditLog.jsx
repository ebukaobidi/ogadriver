import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Shield,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Unlock,
  Settings,
  UserCheck,
  Trash2,
  Edit
} from 'lucide-react';
import api from '../../api/axios';

function AuditLog() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage, actionFilter, userFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/audit-logs', {
        params: {
          page: currentPage,
          action: actionFilter !== 'all' ? actionFilter : undefined,
          user_id: userFilter !== 'all' ? userFilter : undefined,
          search: searchQuery || undefined,
          start_date: dateRange.start || undefined,
          end_date: dateRange.end || undefined
        }
      });

      if (response.data.success) {
        setAuditLogs(response.data.logs.data);
        setTotalPages(response.data.logs.last_page);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const actionIcon = (action) => {
    const icons = {
      create: <CheckCircle className="text-brandMint" size={16} />,
      update: <Edit className="text-blue-400" size={16} />,
      delete: <Trash2 className="text-red-400" size={16} />,
      login: <UserCheck className="text-brandMint" size={16} />,
      logout: <XCircle className="text-slate-400" size={16} />,
      approve: <CheckCircle className="text-brandMint" size={16} />,
      reject: <XCircle className="text-red-400" size={16} />,
      export: <Download className="text-purple-400" size={16} />,
      settings: <Settings className="text-amber-400" size={16} />,
      security: <Shield className="text-red-400" size={16} />
    };
    return icons[action] || <Activity className="text-slate-400" size={16} />;
  };

  const actionBadge = (action) => {
    const map = {
      create: 'bg-brandMint/10 text-brandMint border-brandMint/30',
      update: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      delete: 'bg-red-500/10 text-red-400 border-red-500/30',
      login: 'bg-brandMint/10 text-brandMint border-brandMint/30',
      logout: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      approve: 'bg-brandMint/10 text-brandMint border-brandMint/30',
      reject: 'bg-red-500/10 text-red-400 border-red-500/30',
      export: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      settings: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      security: 'bg-red-500/10 text-red-400 border-red-500/30'
    };
    return `text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${map[action] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`;
  };

  const exportLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs/export', {
        params: {
          action: actionFilter !== 'all' ? actionFilter : undefined,
          start_date: dateRange.start || undefined,
          end_date: dateRange.end || undefined
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export logs');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 p-4 z-10 shrink-0">
            <h1 className="text-xl font-bold text-white">Audit Log & Compliance</h1>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brandMint animate-spin mx-auto mb-4" />
          </main>
        </div>
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
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Audit Log & Compliance</h1>
          </div>
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-brandMint text-corporateNavy text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">System Activity Log</h1>
            <p className="text-slate-400">Track all admin actions, security events, and compliance activities.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brandMint/10 rounded-xl"><Activity className="text-brandMint" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{auditLogs.length}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Events</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl"><User className="text-blue-400" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{new Set(auditLogs.map(l => l.user_id)).size}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Users</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl"><Shield className="text-red-400" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{auditLogs.filter(l => l.action === 'security').length}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Security Events</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl"><AlertTriangle className="text-amber-400" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{auditLogs.filter(l => l.action === 'delete').length}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Deletions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-brandMint outline-none"
                  />
                </div>
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 focus:border-brandMint outline-none"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="security">Security</option>
              </select>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 focus:border-brandMint outline-none"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 focus:border-brandMint outline-none"
              />
              <button
                onClick={loadAuditLogs}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Filter size={16} /> Apply Filters
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => { setSelectedLog(log); setShowDetails(true); }}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="text-slate-500" size={14} />
                          <span className="text-sm text-slate-300">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="text-brandMint" size={14} />
                          <span className="text-sm font-bold text-white">{log.user_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {actionIcon(log.action)}
                          <span className={actionBadge(log.action)}>{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-300">{log.resource_type}</span>
                        {log.resource_id && (
                          <span className="text-xs text-slate-500 ml-1">#{log.resource_id}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-slate-500">{log.ip_address}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400 truncate max-w-xs block">{log.description}</span>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 font-mono text-sm">No audit logs found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
                <p className="text-xs font-mono text-slate-500">PAGE {currentPage} OF {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Compliance Summary */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="text-brandMint" size={20} /> Compliance Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-500 uppercase">Data Retention</span>
                  <CheckCircle className="text-brandMint" size={16} />
                </div>
                <p className="text-sm text-slate-300">All logs retained for 7 years per regulatory requirements</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-500 uppercase">Access Control</span>
                  <Lock className="text-brandMint" size={16} />
                </div>
                <p className="text-sm text-slate-300">Role-based access with audit trail for all modifications</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-500 uppercase">Encryption</span>
                  <Lock className="text-brandMint" size={16} />
                </div>
                <p className="text-sm text-slate-300">All sensitive data encrypted at rest and in transit</p>
              </div>
            </div>
          </div>
        </main>

        {/* Log Details Modal */}
        {showDetails && selectedLog && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-white">Log Entry Details</h3>
                <button onClick={() => { setShowDetails(false); setSelectedLog(null); }} className="text-slate-400 hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-xl p-4">
                    <p className="text-xs font-mono text-slate-500 uppercase mb-1">Timestamp</p>
                    <p className="text-white">{new Date(selectedLog.created_at).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-4">
                    <p className="text-xs font-mono text-slate-500 uppercase mb-1">User</p>
                    <p className="text-white">{selectedLog.user_name}</p>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-4">
                    <p className="text-xs font-mono text-slate-500 uppercase mb-1">Action</p>
                    <div className="flex items-center gap-2">
                      {actionIcon(selectedLog.action)}
                      <span className="text-white">{selectedLog.action}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-4">
                    <p className="text-xs font-mono text-slate-500 uppercase mb-1">IP Address</p>
                    <p className="text-white font-mono">{selectedLog.ip_address}</p>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-xs font-mono text-slate-500 uppercase mb-1">Description</p>
                  <p className="text-white">{selectedLog.description}</p>
                </div>
                {selectedLog.changes && (
                  <div className="bg-slate-900 rounded-xl p-4">
                    <p className="text-xs font-mono text-slate-500 uppercase mb-1">Changes Made</p>
                    <pre className="text-xs text-slate-300 overflow-x-auto">{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                  </div>
                )}
                {selectedLog.metadata && (
                  <div className="bg-slate-900 rounded-xl p-4">
                    <p className="text-xs font-mono text-slate-500 uppercase mb-1">Additional Metadata</p>
                    <pre className="text-xs text-slate-300 overflow-x-auto">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLog;
