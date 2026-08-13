import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Menu,
  Edit,
  Activity,
  Calendar,
  CreditCard
} from 'lucide-react';
import { adminService } from '../../api/admin';

function HirerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hirer, setHirer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHirerDetails();
  }, [id]);

  const loadHirerDetails = async () => {
    try {
      const response = await adminService.getHirerDetails(id);
      setHirer(response.data);
    } catch (err) {
      console.error('Failed to load employer details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !hirer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-brandMint">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandMint mx-auto mb-4"></div>
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Loading Employer Profile...</p>
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
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/hirers')} className="p-2 text-slate-400 hover:text-brandMint transition-colors rounded-lg hover:bg-slate-800 hidden sm:block">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-white hidden sm:block">Employer Profile</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Column: Profile Card */}
            <div className="w-full md:w-1/3 space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                
                <div className="w-24 h-24 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 overflow-hidden">
                  {hirer.avatar ? (
                    <img src={hirer.avatar} alt={hirer.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={48} className="text-slate-500" />
                  )}
                  <div className={"absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center " + (
                    hirer.status === 'Active' ? 'bg-brandMint text-corporateNavy' : 'bg-red-500 text-white'
                  )}>
                    {hirer.status === 'Active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-white relative z-10">{hirer.name}</h2>
                <div className="flex flex-col items-center justify-center gap-2 mt-2 relative z-10">
                   <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-slate-800 text-slate-300 border border-slate-700 mb-1">
                      {hirer.type} Employer
                   </span>
                   <span className={"text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest " + (
                      hirer.accessTier === 'Enterprise' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      hirer.accessTier === 'Premium' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                      'bg-slate-800 text-slate-400 border border-slate-700'
                   )}>
                      Tier: {hirer.accessTier}
                   </span>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 text-left relative z-10">
                  <div className="flex items-center gap-3">
                    <Building2 size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{hirer.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{hirer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{hirer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{hirer.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">Joined: {hirer.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hiring Activity */}
            <div className="w-full md:w-2/3 space-y-6">
              
              {/* Stats */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Hiring Activity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Briefcase size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-300 uppercase">Total Jobs Posted</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">Lifetime</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-white">{hirer.totalJobs}</span>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brandMint/10">
                        <Activity size={20} className="text-brandMint" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-300 uppercase">Active Contracts</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase tracking-widest text-brandMint">In Progress</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-brandMint">{hirer.activeContracts}</span>
                  </div>
                </div>
              </div>

              {/* Billing / subscription details */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Billing Details</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    <CreditCard size={14} /> Active Subscription
                  </div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <p className="text-xs font-mono text-slate-500 mb-2 uppercase">Current Plan</p>
                  <p className="text-xl font-bold text-white">{hirer.accessTier} Employer Plan</p>
                  <button className="mt-4 w-full py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors uppercase tracking-wider">
                    Manage Billing
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HirerDetail;
