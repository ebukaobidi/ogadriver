import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Search,
  Filter,
  CreditCard,
  Menu,
  Download,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { adminService } from '../../api/admin';
import api from '../../api/axios';

function SubscriptionPayments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPayments();
  }, [currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else loadPayments();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/subscriptions/payments', {
        params: {
          page: currentPage,
          search: searchTerm
        }
      });
      const data = response.data;
      if (data.status === 'success') {
        setPayments(data.data.data);
        setTotalPages(data.data.last_page);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
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
            <h1 className="text-xl font-bold text-white hidden sm:block">Access Fee Logs</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <CreditCard className="text-brandMint" /> Access Payments Log
              </h1>
              <p className="text-slate-400 mt-1">Audit incoming payments for Employer Directory Access Tiers.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-brandMint text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
              <Download size={16} /> Export Logs
            </button>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by Transaction ID, Employer, or Reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employer</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan & Amount</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Gateway</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-white block mb-1">{payment.id}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                          payment.status === 'Successful' ? 'bg-brandMint/10 text-brandMint border border-brandMint/20' :
                          payment.status === 'Failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-slate-500" />
                          <span className="font-bold text-slate-300 text-sm">{payment.employer}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-bold text-brandMint text-sm">{payment.amount}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-slate-500" /> {payment.plan}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                         <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-300 text-xs uppercase tracking-wider">{payment.method}</span>
                          <span className="text-[10px] font-mono text-slate-500">Ref: {payment.reference}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400 font-mono">
                          <Calendar size={14} /> {payment.date}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center justify-end">
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-700 hover:border-brandMint text-slate-400 hover:text-brandMint rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider">
                            Receipt <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500 font-mono">
                        No payment logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
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

export default SubscriptionPayments;
