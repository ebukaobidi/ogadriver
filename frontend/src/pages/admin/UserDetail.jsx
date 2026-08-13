import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Menu,
  Edit,
  Wallet,
  Activity,
  Calendar,
  Shield,
  FileText,
  Eye,
  Briefcase,
  Building2
} from 'lucide-react';
import { adminService } from '../../api/admin';

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetails();
  }, [id]);

  const loadUserDetails = async () => {
    try {
      const response = await adminService.getUserDetails(id);
      setUser(response.data);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-brandMint">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandMint mx-auto mb-4"></div>
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Loading Profile...</p>
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
              <button onClick={() => navigate('/admin/users')} className="p-2 text-slate-400 hover:text-brandMint transition-colors rounded-lg hover:bg-slate-800 hidden sm:block">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-white hidden sm:block">User Profile</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Column: Profile Card */}
            <div className="w-full md:w-1/3 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brandMint/5 rounded-full blur-3xl"></div>
                
                <div className="w-24 h-24 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-500" />
                  )}
                  <div className={"absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center " + (
                    user.status === 'active' ? 'bg-brandMint text-corporateNavy' : 'bg-red-500 text-white'
                  )}>
                    {user.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-white relative z-10">{user.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2 relative z-10">
                   <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-slate-800 text-slate-300 border border-slate-700">
                      Role: {user.role}
                    </span>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 text-left relative z-10">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300 uppercase">Gender: {user.gender}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">DOB: {user.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">Joined: {user.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Account & Activity */}
            <div className="w-full md:w-2/3 space-y-6">
              
              {/* Account Status */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Account Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Activity size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-300 uppercase">Last Login</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{user.lastLogin}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brandMint/10">
                        <Shield size={20} className="text-brandMint" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-300 uppercase">Account Status</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase tracking-widest text-brandMint">{user.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Information */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Wallet Balance</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-brandMint bg-brandMint/10 px-2 py-1 rounded">
                    <Wallet size={14} /> ₦{user.wallet_balance}
                  </div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <p className="text-xs font-mono text-slate-500 mb-2 uppercase">Available Funds</p>
                  <p className="text-4xl font-black text-white">₦{user.wallet_balance}</p>
                  <button className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors uppercase tracking-wider">
                    View Transactions
                  </button>
                </div>
              </div>

              {/* Driver Dossier (Conditional) */}
              {user.driver && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 border-t-4 border-t-brandMint">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                      <Briefcase size={16} className="text-brandMint" /> Operative Dossier
                    </h3>
                    <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded ${
                      user.driver.clearanceLevel === 'Verified' ? 'text-brandMint bg-brandMint/10' : 'text-amber-500 bg-amber-500/10'
                    }`}>
                      <ShieldCheck size={14} /> {user.driver.clearanceLevel} Clearance
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <p className="text-xs font-mono text-slate-500 mb-3 uppercase">Uploaded Documents</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.driver.documents && user.driver.documents.length > 0 ? user.driver.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg group">
                            <div className="flex items-center gap-2">
                              <FileText size={14} className="text-brandMint" />
                              <span className="text-xs font-bold text-slate-300 uppercase">{doc.document_type.replace(/_/g, ' ')}</span>
                            </div>
                            <a href={`http://127.0.0.1:8000/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-brandMint transition-colors">
                              <Eye size={14} />
                            </a>
                          </div>
                        )) : (
                          <div className="text-xs text-slate-500 italic col-span-2">No documents uploaded.</div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <p className="text-xs font-mono text-slate-500 mb-3 uppercase">Guarantors</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.driver.guarantors && user.driver.guarantors.length > 0 ? user.driver.guarantors.map((g, idx) => (
                          <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <p className="text-xs font-bold text-slate-300">{g.full_name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] font-mono text-slate-500 uppercase">{g.unique_code}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                g.verification_status === 'verified' ? 'bg-brandMint/10 text-brandMint' : 'bg-amber-500/10 text-amber-500'
                              }`}>
                                {g.verification_status}
                              </span>
                            </div>
                          </div>
                        )) : (
                          <div className="text-xs text-slate-500 italic col-span-2">No guarantors found.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Employer Context (Conditional) */}
              {user.hirer && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 border-t-4 border-t-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                      <Building2 size={16} className="text-blue-500" /> Employer Context
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold px-2 py-1 rounded text-blue-400 bg-blue-500/10">
                      Tier: {user.hirer.accessTier}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                      <p className="text-2xl font-black text-white">{user.hirer.totalJobs}</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Jobs Posted</p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                      <p className="text-2xl font-black text-blue-400">{user.hirer.activeContracts}</p>
                      <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">Active Contracts</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserDetail;
