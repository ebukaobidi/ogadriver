import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  User,
  Car,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MoreVertical,
  RefreshCw,
  Menu
} from 'lucide-react';
import { adminService } from '../../api/admin';
import api from '../../api/axios';

function Transactions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTransactions();
  }, [currentPage, filterType, filterStatus]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else loadTransactions();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/financials/transactions', {
        params: {
          page: currentPage,
          search: searchTerm,
          type: filterType !== 'all' ? filterType : '',
          status: filterStatus !== 'all' ? filterStatus : ''
        }
      });
      const data = response.data;
      if (data.status === 'success') {
        setTransactions(data.data.data);
        setTotalPages(data.data.last_page);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transactionId) => {
    navigate(`/admin/financials/transactions/${transactionId}`);
    setActiveDropdown(null);
  };

  const handleRefundTransaction = (transactionId) => {
    if (confirm('Process refund for this transaction?')) {
      setTransactions(prev => prev.map(t =>
        t.id === transactionId ? { ...t, status: 'refunded' } : t
      ));
      setActiveDropdown(null);
    }
  };

  const handleRetryTransaction = (transactionId) => {
    if (confirm('Retry this failed transaction?')) {
      setTransactions(prev => prev.map(t =>
        t.id === transactionId ? { ...t, status: 'completed' } : t
      ));
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (transactionId) => {
    setActiveDropdown(activeDropdown === transactionId ? null : transactionId);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'revenue': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'payout': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'fee': return 'text-brandMint bg-brandMint/10 border-brandMint/20';
      case 'refund': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-brandMint bg-brandMint/10 border-brandMint/20';
      case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
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
              <DollarSign className="text-brandMint" size={20} /> Gateway Logs
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Transactions Ledger
              </h1>
              <p className="text-slate-400 mt-1">Audit log of all platform financial movements.</p>
            </div>
            <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by description, reference, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint text-sm uppercase tracking-wider font-bold"
                >
                  <option value="all">All Types</option>
                  <option value="revenue">Access Fees</option>
                  <option value="payout">Payouts</option>
                  <option value="fee">Platform Fee</option>
                  <option value="refund">Refund</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint text-sm uppercase tracking-wider font-bold"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Parties</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4">
                        <span className="text-sm font-mono text-slate-400">{transaction.reference}</span>
                      </td>
                      <td className="py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(transaction.type)}`}>
                          {transaction.type === 'revenue' ? <CreditCard size={12} /> :
                           transaction.type === 'payout' ? <ArrowDownRight size={12} /> :
                           transaction.type === 'refund' ? <ArrowDownRight size={12} /> :
                           <DollarSign size={12} />}
                          <span>{transaction.type}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-300">{transaction.description}</td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <User size={12} className="text-slate-500" />
                            <span>{transaction.user}</span>
                          </div>
                          {transaction.driver && (
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <Car size={12} className="text-slate-500" />
                              <span>{transaction.driver}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-sm font-mono text-white">₦{transaction.amount.toLocaleString()}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                          <Calendar size={12} />
                          <span>{transaction.date}</span>
                          <span className="text-slate-600">{transaction.time}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'completed' ? <CheckCircle size={12} /> :
                           transaction.status === 'pending' ? <Clock size={12} /> :
                           <XCircle size={12} />}
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => toggleDropdown(transaction.id)}
                            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeDropdown === transaction.id && (
                            <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 w-48 overflow-hidden">
                              <button
                                onClick={() => handleViewTransaction(transaction.id)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-800 text-sm text-slate-300 transition-colors"
                              >
                                <Eye size={16} className="text-brandMint" />
                                View Details
                              </button>
                              {transaction.status === 'completed' && (
                                <button
                                  onClick={() => handleRefundTransaction(transaction.id)}
                                  className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-800 text-sm text-red-500 transition-colors border-t border-slate-800"
                                >
                                  <RefreshCw size={16} />
                                  Issue Refund
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-mono">
                  Showing page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16} />
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

export default Transactions;
