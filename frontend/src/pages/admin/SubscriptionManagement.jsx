import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Search,
  Filter,
  CreditCard,
  Menu,
  ShieldCheck,
  Briefcase,
  Calendar,
  Zap,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { adminService } from '../../api/admin';

function SubscriptionManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTiers, setActiveTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadActiveTiers();
  }, []);

  const loadActiveTiers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSubscriptions();
      if (response.status === 'success') {
        setActiveTiers(response.data.activeTiers);
      }
    } catch (err) {
      console.error('Failed to load active tiers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTiers = activeTiers.filter(t => {
    const matchesSearch = t.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });



  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Access Tiers Directory</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-brandMint" /> Employer Access Plans
              </h1>
              <p className="text-slate-400 mt-1">Track which employers hold active access to the Operative directory.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-brandMint/10 rounded-xl">
                <CheckCircle className="text-brandMint" size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{activeTiers.filter(t => t.status === 'Active').length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Passes</p>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Zap className="text-amber-500" size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{activeTiers.filter(t => t.status === 'Exhausted').length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Limit Exhausted</p>
              </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <XCircle className="text-red-500" size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{activeTiers.filter(t => t.status === 'Expired').length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Expired Passes</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by Access ID or Employer Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-brandMint"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="exhausted">Exhausted Limit</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Access ID</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employer</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tier Level</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usage / Limit</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valid Until</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredTiers.map((tier) => (
                    <tr key={tier.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-white block mb-1">{tier.id}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                          tier.status === 'Active' ? 'bg-brandMint/10 text-brandMint border border-brandMint/20' :
                          tier.status === 'Exhausted' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {tier.status}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <span className="font-bold text-slate-300 text-sm">{tier.employer}</span>
                        {tier.autoRenew && (
                          <span className="block mt-1 text-[10px] font-mono text-blue-400">Auto-Renew Enabled</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <CreditCard size={14} className={
                             tier.tierName.includes('Premium') ? 'text-purple-400' :
                             tier.tierName.includes('Enterprise') ? 'text-blue-400' : 'text-slate-400'
                           } />
                           <span className="font-bold text-white text-sm">{tier.tierName}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-mono font-bold text-slate-300">
                            {tier.driversHired} / {tier.driverLimit}
                          </span>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 max-w-[100px]">
                            <div className={`h-1.5 rounded-full ${
                              tier.status === 'Exhausted' ? 'bg-amber-500' : 'bg-brandMint'
                            }`} 
                            style={{ 
                              width: tier.driverLimit === 'Unlimited' ? '100%' : `${(tier.driversHired / tier.driverLimit) * 100}%` 
                            }}></div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400 font-mono">
                          <Calendar size={14} /> {tier.validUntil}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center justify-end">
                          <button className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTiers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500 font-mono">
                        No active plans found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default SubscriptionManagement;
