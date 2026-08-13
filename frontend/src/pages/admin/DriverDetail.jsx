import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  Clock,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Eye,
  Menu,
  Edit
} from 'lucide-react';
import { adminService } from '../../api/admin';

function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriverDetails();
  }, [id]);

  const loadDriverDetails = async () => {
    try {
      const response = await adminService.getDriverDetails(id);
      const d = response.data;
      
      setDriver({
        id: d.id,
        name: d.user?.name || 'Unknown',
        email: d.user?.email || 'N/A',
        phone: d.user?.phone || 'N/A',
        gender: d.user?.gender || 'N/A',
        dateOfBirth: d.user?.date_of_birth || 'N/A',
        status: d.status || 'pending',
        clearanceLevel: d.clearanceLevel || (d.is_verified ? 'Verified' : 'Pending'),
        subscription: d.subscription || {
          plan: d.subscription_tier || 'None',
          status: 'inactive',
          expires_at: d.subscription_expires_at || null,
        },
        subscriptionTier: d.subscription_tier || d.subscription?.plan || 'None',
        isPro: !!d.is_pro,
        rating: d.rating || 0,
        location: d.location_label || `State ID: ${d.state_id || 'N/A'}, City ID: ${d.city_id || 'N/A'}`,
        joinedDate: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : 'N/A',
        completedContracts: d.total_jobs || 0,
        totalEarnings: '₦0',
        documents: d.documents || [],
        guarantors: (d.guarantors && d.guarantors.length > 0) ? d.guarantors.map(g => ({
           name: g.full_name || g.name || 'Guarantor',
           code: g.unique_code || g.verification_reference || 'N/A',
           status: g.is_verified ? 'verified' : (g.verification_status || g.status || 'pending'),
           phone: g.phone_number || g.phone || 'N/A'
        })) : [],
        preferredLocations: d.preferred_locations || d.preferredLocations || [],
        employmentTypes: d.employment_types || d.employmentTypes || [],
        recentContracts: d.recentContracts || [],
        performanceMetrics: d.performanceMetrics || {
          acceptanceRate: 0,
          cancellationRate: 0,
          onTimeArrival: 0
        }
      });
    } catch (err) {
      console.error('Failed to load driver details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !driver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-brandMint">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandMint mx-auto mb-4"></div>
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Loading Dossier...</p>
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
              <button onClick={() => navigate('/admin/drivers/list')} className="p-2 text-slate-400 hover:text-brandMint transition-colors rounded-lg hover:bg-slate-800 hidden sm:block">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-white hidden sm:block">Operative Dossier</h1>
            </div>
          </div>
          <button onClick={() => navigate(`/admin/drivers/${id}/edit`)} className="bg-brandMint text-corporateNavy px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-colors">
             <Edit size={16} /> Edit Driver
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Column: Profile & Stats */}
            <div className="w-full md:w-1/3 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brandMint/5 rounded-full blur-3xl"></div>
                
                <div className="w-24 h-24 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <User size={48} className="text-slate-500" />
                  <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                    driver.status === 'active' ? 'bg-brandMint text-corporateNavy' :
                    driver.status === 'pending' ? 'bg-amber-400 text-amber-950' :
                    'bg-red-500 text-white'
                  }`}>
                    {driver.status === 'active' && <CheckCircle size={14} />}
                    {driver.status === 'pending' && <Clock size={14} />}
                    {driver.status === 'blacklisted' && <XCircle size={14} />}
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-white relative z-10">{driver.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2 relative z-10 flex-wrap">
                   <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest ${
                      driver.clearanceLevel === 'Elite' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      driver.clearanceLevel === 'Premium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      driver.clearanceLevel === 'Revoked' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {driver.clearanceLevel} Clearance
                    </span>
                   <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest ${
                      driver.subscription?.status === 'active'
                        ? 'bg-brandMint/10 text-brandMint border border-brandMint/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {driver.subscriptionTier || driver.subscription?.plan || 'No Plan'}
                    </span>
                </div>

                <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-left relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Subscription</p>
                  <p className="text-sm font-bold text-white">{driver.subscriptionTier || 'None'}</p>
                  <p className={`text-xs font-mono mt-1 ${driver.subscription?.status === 'active' ? 'text-brandMint' : 'text-slate-500'}`}>
                    {(driver.subscription?.status || 'inactive').toUpperCase()}
                    {driver.subscription?.expires_at ? ` · Exp ${new Date(driver.subscription.expires_at).toLocaleDateString()}` : ''}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 text-left relative z-10">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{driver.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">{driver.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300 uppercase">Gender: {driver.gender}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">DOB: {driver.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">Joined: {driver.joinedDate}</span>
                  </div>
                </div>
              </div>
              
              {/* Employment Preferences */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div>
                     <span className="text-xs font-mono text-slate-500 uppercase block mb-2">Preferred Locations (City IDs)</span>
                     <div className="flex flex-wrap gap-2">
                        {driver.preferredLocations?.length > 0 ? driver.preferredLocations.map((loc, idx) => (
                           <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700">{loc}</span>
                        )) : <span className="text-xs text-slate-500">None Set</span>}
                     </div>
                  </div>
                  <div>
                     <span className="text-xs font-mono text-slate-500 uppercase block mb-2">Employment Types</span>
                     <div className="flex flex-wrap gap-2">
                        {driver.employmentTypes?.length > 0 ? driver.employmentTypes.map((type, idx) => (
                           <span key={idx} className="bg-brandMint/10 text-brandMint text-xs px-2 py-1 rounded border border-brandMint/20">{type}</span>
                        )) : <span className="text-xs text-slate-500">None Set</span>}
                     </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Performance Metrics</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <p className="text-2xl font-black text-brandMint">{driver.rating}</p>
                    <div className="flex justify-center mt-1"><Star size={12} className="fill-brandMint text-brandMint" /></div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">Avg Rating</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <p className="text-2xl font-black text-white">{driver.completedContracts}</p>
                    <div className="flex justify-center mt-1"><Briefcase size={12} className="text-slate-500" /></div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">Contracts</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold font-mono mb-1">
                      <span className="text-slate-400">Acceptance Rate</span>
                      <span className="text-brandMint">{driver.performanceMetrics.acceptanceRate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-brandMint h-1.5 rounded-full" style={{ width: `${driver.performanceMetrics.acceptanceRate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold font-mono mb-1">
                      <span className="text-slate-400">On-Time Arrival</span>
                      <span className="text-blue-400">{driver.performanceMetrics.onTimeArrival}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${driver.performanceMetrics.onTimeArrival}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold font-mono mb-1">
                      <span className="text-slate-400">Cancellation Rate</span>
                      <span className="text-red-400">{driver.performanceMetrics.cancellationRate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${driver.performanceMetrics.cancellationRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Clearance & History */}
            <div className="w-full md:w-2/3 space-y-6">
              
              {/* Document Scans */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Document Clearance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {driver.documents.length > 0 ? driver.documents.map((doc, index) => (
                    <div key={index} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-brandMint/10`}>
                          <FileText size={20} className="text-brandMint" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-300 uppercase">{doc.document_type.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">Uploaded</p>
                        </div>
                      </div>
                      <a href={`http://127.0.0.1:8000/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-brandMint transition-colors" title="View Document">
                        <Eye size={18} />
                      </a>
                    </div>
                  )) : (
                     <div className="text-slate-500 text-sm italic col-span-2">No documents uploaded.</div>
                  )}
                </div>
              </div>

              {/* Guarantors */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Verified Guarantors</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-brandMint bg-brandMint/10 px-2 py-1 rounded">
                    <ShieldCheck size={14} /> SMS Verification Passed
                  </div>
                </div>
                <div className="space-y-3">
                  {driver.guarantors.map((g, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-sm">{g.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 uppercase tracking-widest">{g.code}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest ${g.status === 'verified' ? 'bg-brandMint/10 text-brandMint border-brandMint/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'} border mb-2`}>
                          {g.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract History */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Recent Matchmaking Contracts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800">
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contract ID</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employer</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type / Duration</th>
                        <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {driver.recentContracts.map((contract, index) => (
                        <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 text-sm font-mono text-slate-400">{contract.id}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-300 text-sm block">{contract.employer}</span>
                            <span className="text-[10px] font-mono text-slate-500">{contract.date}</span>
                          </td>
                          <td className="p-3 text-sm text-slate-300">
                            {contract.type} <br/>
                            <span className="text-xs text-slate-500 font-mono">{contract.duration}</span>
                          </td>
                          <td className="p-3 text-right">
                             <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-brandMint/10 text-brandMint border border-brandMint/20">
                              {contract.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="w-full mt-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white hover:bg-slate-800 transition-colors">
                  View Full History
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DriverDetail;
