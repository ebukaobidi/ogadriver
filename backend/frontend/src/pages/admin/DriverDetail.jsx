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
  Brain,
  FileText,
  Calendar,
  Eye,
  Menu,
  Edit,
  Send
} from 'lucide-react';
import { adminService } from '../../api/admin';

function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    loadDriverDetails();
  }, [id]);

  const storageUrl = (path) => {
    if (!path) return null;
    if (typeof path !== 'string') return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/storage/')) {
      return path;
    }
    return `/storage/${path.replace(/^\//, '')}`;
  };

  const loadDriverDetails = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await adminService.getDriverDetails(id);
      const d = response.data;
      if (!d) {
        setDriver(null);
        setLoadError('Driver not found');
        return;
      }
      
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
        totalEarnings: d.totalEarnings || '₦0',
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
      setDriver(null);
      setLoadError(err.response?.data?.message || err.message || 'Failed to load driver details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (docId) => {
    try {
      await adminService.approveDocument(id, docId);
      alert('Document approved successfully');
      setPreviewDoc(null);
      loadDriverDetails();
    } catch (err) {
      alert('Failed to approve document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectDocument = async (docId) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;
    
    try {
      await adminService.rejectDocument(id, docId, reason);
      alert('Document rejected successfully');
      setPreviewDoc(null);
      loadDriverDetails();
    } catch (err) {
      alert('Failed to reject document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemindMissingDocs = async () => {
    try {
      const res = await adminService.remindMissingDocuments(id);
      alert(res.message || 'Missing documents reminder sent via SMS and Email.');
    } catch (err) {
      alert('Failed to send reminder: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-brandMint">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandMint mx-auto mb-4"></div>
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Loading Dossier...</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 px-6">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest text-amber-400 mb-2">Dossier Unavailable</p>
        <p className="text-sm text-slate-400 text-center max-w-md mb-6">{loadError || 'Driver could not be loaded.'}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/drivers/list')}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-bold"
          >
            Back to List
          </button>
          <button
            onClick={loadDriverDetails}
            className="px-4 py-2 rounded-lg bg-brandMint text-corporateNavy text-sm font-bold hover:bg-emerald-400"
          >
            Retry
          </button>
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
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/drivers/list')} className="p-2 text-slate-400 hover:text-brandMint transition-colors rounded-lg hover:bg-slate-800 hidden sm:block">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-white hidden sm:block">Operative Dossier</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRemindMissingDocs} className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors">
              <Send size={14} /> Send Doc Reminder (SMS)
            </button>
            <button onClick={() => navigate(`/admin/drivers/${id}/edit`)} className="bg-brandMint text-corporateNavy px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-colors">
               <Edit size={16} /> Edit Driver
            </button>
          </div>
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
                    <div key={doc.id || index} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-brandMint/10`}>
                          <FileText size={20} className="text-brandMint" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-300 uppercase">{(doc.document_type || 'document').replace(/_/g, ' ')}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">{doc.status || 'Uploaded'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        disabled={!doc.file_path}
                        className="text-slate-600 hover:text-brandMint transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={doc.file_path ? 'View Document' : 'No file path'}
                      >
                        <Eye size={18} />
                      </button>
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
      
      {/* Document Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                <FileText size={18} className="text-brandMint" /> 
                {(previewDoc.document_type || 'document').replace(/_/g, ' ')}
              </h3>
              <div className="flex items-center gap-4">
                {storageUrl(previewDoc.file_path) && (
                  <a 
                    href={storageUrl(previewDoc.file_path)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-bold text-brandMint hover:text-white transition-colors uppercase"
                  >
                    Open in New Tab
                  </a>
                )}
                <button onClick={() => setPreviewDoc(null)} className="text-slate-500 hover:text-white transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            {/* Split View */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Image side */}
              <div className="w-full md:w-2/3 bg-black flex items-center justify-center p-4 overflow-auto border-r border-slate-800">
                {!storageUrl(previewDoc.file_path) ? (
                  <p className="text-slate-500 text-sm">No file available for preview.</p>
                ) : String(previewDoc.file_path).toLowerCase().endsWith('.pdf') ? (
                  <iframe src={storageUrl(previewDoc.file_path)} className="w-full h-full min-h-[500px] border-none" title="Document PDF"></iframe>
                ) : (
                  <img src={storageUrl(previewDoc.file_path)} alt="Document Preview" className="max-w-full max-h-full object-contain rounded" />
                )}
              </div>
              
              {/* Data side */}
              <div className="w-full md:w-1/3 p-6 bg-slate-900 flex flex-col shrink-0 overflow-y-auto">
                <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Extracted Details</h4>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      previewDoc.status === 'approved' ? 'bg-brandMint/10 text-brandMint' : 
                      previewDoc.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {previewDoc.status}
                    </span>
                  </div>

                  {previewDoc.document_number && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Document Number</label>
                      <p className="text-sm font-mono text-white">{previewDoc.document_number}</p>
                    </div>
                  )}

                  {previewDoc.expiry_date && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                      <p className="text-sm font-mono text-white">{new Date(previewDoc.expiry_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  {/* AI Extracted Data with Validation */}
                  {previewDoc.ocr_data && (
                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Brain size={12} /> AI Extracted Data
                      </label>
                      
                      <div className="space-y-3 bg-slate-950 p-3 rounded border border-slate-800">
                        {previewDoc.ocr_data.document_number && (
                          <div className="flex justify-between items-center">
                            <div>
                              <label className="block text-[8px] text-slate-500 uppercase font-bold">OCR Number</label>
                              <p className="text-xs font-mono text-blue-400">{previewDoc.ocr_data.document_number}</p>
                            </div>
                            {previewDoc.document_number && previewDoc.document_number === previewDoc.ocr_data.document_number && (
                              <CheckCircle size={12} className="text-brandMint" />
                            )}
                          </div>
                        )}
                        {previewDoc.ocr_data.expiry_date && (
                          <div>
                            <label className="block text-[8px] text-slate-500 uppercase font-bold">OCR Expiry</label>
                            <p className="text-xs font-mono text-blue-400">{previewDoc.ocr_data.expiry_date}</p>
                          </div>
                        )}
                        {previewDoc.ocr_data.name && (
                          <div>
                            <label className="block text-[8px] text-slate-500 uppercase font-bold">OCR Name</label>
                            <p className="text-xs font-mono text-blue-400">{previewDoc.ocr_data.name}</p>
                          </div>
                        )}

                        {previewDoc.ocr_data.validation && previewDoc.ocr_data.validation.warnings && previewDoc.ocr_data.validation.warnings.length > 0 && (
                          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                            <div className="flex items-center gap-1 text-amber-500 text-[9px] font-bold mb-1 uppercase">
                              <AlertTriangle size={10} /> Discrepancies
                            </div>
                            {previewDoc.ocr_data.validation.warnings.map((w, idx) => (
                              <p key={idx} className="text-[9px] text-amber-200/70 leading-tight mb-1 last:mb-0">
                                • {w.message}
                              </p>
                            ))}
                          </div>
                        )}

                        {previewDoc.ocr_data.validation && previewDoc.ocr_data.validation.errors && previewDoc.ocr_data.validation.errors.length > 0 && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                            <div className="flex items-center gap-1 text-red-500 text-[9px] font-bold mb-1 uppercase">
                              <AlertTriangle size={10} /> OCR Error
                            </div>
                            {previewDoc.ocr_data.validation.errors.map((e, idx) => (
                              <p key={idx} className="text-[9px] text-red-200/70 leading-tight mb-1 last:mb-0">
                                • {e.message}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                <div className="pt-6 mt-6 border-t border-slate-800">
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Verification Action</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleRejectDocument(previewDoc.id)}
                      className="py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApproveDocument(previewDoc.id)}
                      className="py-2 bg-brandMint/10 text-brandMint hover:bg-brandMint hover:text-corporateNavy rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDetail;
