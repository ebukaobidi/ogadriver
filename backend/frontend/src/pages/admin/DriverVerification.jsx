import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AIGuarantorVerifier from '../../components/admin/AIGuarantorVerifier';
import LocationCertification from '../../components/admin/LocationCertification';
import api from '../../api/axios';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Shield,
  User,
  MapPin,
  Phone,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Loader2,
  CreditCard,
  Briefcase,
  Zap,
  Calendar,
  AlertTriangle,
  Brain
} from 'lucide-react';
import { adminService } from '../../api/admin';

function DriverVerification() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ in_queue: 0, cleared_this_month: 0, blacklisted: 0 });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState(null);
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useState(true);
  const [expiryThreshold, setExpiryThreshold] = useState(90); // days
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showExpiryDashboard, setShowExpiryDashboard] = useState(false);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [showAIVerifier, setShowAIVerifier] = useState(false);
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  const [showLocationCert, setShowLocationCert] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingVerifications();
  }, [currentPage]);

  const loadPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/drivers-verifications', {
        params: { page: currentPage }
      });
      const data = response.data;
      if (data.status === 'success') {
        setPendingVerifications(data.data.pendingVerifications.data);
        setTotalPages(data.data.pendingVerifications.last_page);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    if (!window.confirm('Approve this driver and activate their account?')) return;
    try {
      setProcessingId(`approve-${driverId}`);
      await adminService.approveDriver(driverId);
      setPendingVerifications(prev => prev.filter(d => d.id !== driverId));
      if (selectedDriver?.id === driverId) { setShowDetails(false); setSelectedDriver(null); }
      setStats(s => ({ ...s, in_queue: Math.max(0, s.in_queue - 1), cleared_this_month: s.cleared_this_month + 1 }));
    } catch (err) {
      alert('Failed to approve driver');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (driverId) => {
    const reason = window.prompt('Reason for rejection (optional):');
    if (reason === null) return;
    try {
      setProcessingId(`reject-${driverId}`);
      await adminService.rejectDriver(driverId);
      setPendingVerifications(prev => prev.filter(d => d.id !== driverId));
      if (selectedDriver?.id === driverId) { setShowDetails(false); setSelectedDriver(null); }
      setStats(s => ({ ...s, in_queue: Math.max(0, s.in_queue - 1) }));
    } catch (err) {
      alert('Failed to reject driver');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemind = async (driverId) => {
    try {
      setProcessingId(`remind-${driverId}`);
      const res = await api.post(`/admin/drivers/${driverId}/remind`);
      alert(res.data.message || 'Reminder dispatched successfully');
    } catch (err) {
      alert('Failed to send reminder: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDoc = async (driverId, documentId) => {
    try {
      setProcessingId(`doc-approve-${documentId}`);
      await adminService.approveDocument(driverId, documentId);
      setSelectedDriver(prev => ({
        ...prev,
        documents: prev.documents.map(d => d.id === documentId ? { ...d, status: 'approved' } : d)
      }));
    } catch (err) {
      alert('Failed to approve document');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDoc = async (driverId, documentId) => {
    const reason = window.prompt('Reason for rejecting this document:') || 'Document unclear or invalid';
    try {
      setProcessingId(`doc-reject-${documentId}`);
      await adminService.rejectDocument(driverId, documentId, reason);
      setSelectedDriver(prev => ({
        ...prev,
        documents: prev.documents.map(d => d.id === documentId ? { ...d, status: 'rejected', rejection_reason: reason } : d)
      }));
    } catch (err) {
      alert('Failed to reject document');
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      approved: 'bg-brandMint/10 text-brandMint border-brandMint/30',
      pending:  'bg-amber-500/10 text-amber-400 border-amber-500/30',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
      verified: 'bg-brandMint/10 text-brandMint border-brandMint/30',
      failed:   'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return `text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${map[status] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`;
  };

  // Check if document is expiring soon
  const checkDocumentExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', days: daysUntilExpiry };
    if (daysUntilExpiry <= expiryThreshold) return { status: 'expiring_soon', days: daysUntilExpiry };
    return { status: 'valid', days: daysUntilExpiry };
  };

  // Auto-acceptance logic
  const runAutoAcceptance = async () => {
    if (!autoAcceptEnabled) return;
    
    const autoAccepted = [];
    const flaggedForReview = [];

    for (const driver of pendingVerifications) {
      let canAutoAccept = true;
      let rejectionReason = null;

      // Check all documents
      if (driver.documents) {
        for (const doc of driver.documents) {
          // Document must be approved
          if (doc.status !== 'approved') {
            canAutoAccept = false;
            break;
          }

          // Check expiry if document has expiry date
          if (doc.expiry_date) {
            const expiryCheck = checkDocumentExpiry(doc.expiry_date);
            if (expiryCheck.status === 'expired') {
              canAutoAccept = false;
              rejectionReason = `${doc.label} expired on ${doc.expiry_date}`;
              break;
            }
            if (expiryCheck.status === 'expiring_soon') {
              // Flag for review but don't auto-reject
              flaggedForReview.push({
                driver,
                reason: `${doc.label} expires in ${expiryCheck.days} days`,
                severity: 'warning'
              });
            }
          }
        }
      }

      // Check license expiry specifically
      if (driver.license_expiry_date) {
        const licenseExpiry = checkDocumentExpiry(driver.license_expiry_date);
        if (licenseExpiry.status === 'expired') {
          canAutoAccept = false;
          rejectionReason = `Driver's license expired on ${driver.license_expiry_date}`;
        } else if (licenseExpiry.status === 'expiring_soon') {
          flaggedForReview.push({
            driver,
            reason: `License expires in ${licenseExpiry.days} days`,
            severity: 'warning'
          });
        }
      }

      // Check ID expiry
      if (driver.id_expiry_date) {
        const idExpiry = checkDocumentExpiry(driver.id_expiry_date);
        if (idExpiry.status === 'expired') {
          canAutoAccept = false;
          rejectionReason = `ID expired on ${driver.id_expiry_date}`;
        } else if (idExpiry.status === 'expiring_soon') {
          flaggedForReview.push({
            driver,
            reason: `ID expires in ${idExpiry.days} days`,
            severity: 'warning'
          });
        }
      }

      // Auto-accept if all checks pass
      if (canAutoAccept && driver.documents?.length > 0) {
        try {
          await adminService.approveDriver(driver.id);
          autoAccepted.push(driver);
        } catch (err) {
          console.error(`Failed to auto-accept driver ${driver.id}:`, err);
        }
      } else if (rejectionReason) {
        flaggedForReview.push({
          driver,
          reason: rejectionReason,
          severity: 'error'
        });
      }
    }

    // Refresh the list
    await loadPendingVerifications();

    // Show results
    if (autoAccepted.length > 0) {
      alert(`Auto-accepted ${autoAccepted.length} drivers successfully.`);
    }
    if (flaggedForReview.length > 0) {
      console.log('Flagged for review:', flaggedForReview);
    }

    return { autoAccepted, flaggedForReview };
  };

  // Bulk approve selected drivers
  const handleBulkApprove = async () => {
    if (selectedDrivers.length === 0) return;
    if (!window.confirm(`Approve ${selectedDrivers.length} selected drivers?`)) return;
    
    try {
      setProcessingId('bulk');
      for (const driverId of selectedDrivers) {
        await adminService.approveDriver(driverId);
      }
      setPendingVerifications(prev => prev.filter(d => !selectedDrivers.includes(d.id)));
      setSelectedDrivers([]);
      setStats(s => ({ ...s, in_queue: Math.max(0, s.in_queue - selectedDrivers.length), cleared_this_month: s.cleared_this_month + selectedDrivers.length }));
      alert(`Successfully approved ${selectedDrivers.length} drivers`);
    } catch (err) {
      alert('Failed to bulk approve drivers');
    } finally {
      setProcessingId(null);
    }
  };

  // Bulk reject selected drivers
  const handleBulkReject = async () => {
    if (selectedDrivers.length === 0) return;
    const reason = window.prompt('Reason for rejection (optional):');
    if (reason === null) return;
    
    try {
      setProcessingId('bulk');
      for (const driverId of selectedDrivers) {
        await adminService.rejectDriver(driverId, reason);
      }
      setPendingVerifications(prev => prev.filter(d => !selectedDrivers.includes(d.id)));
      setSelectedDrivers([]);
      setStats(s => ({ ...s, in_queue: Math.max(0, s.in_queue - selectedDrivers.length) }));
      alert(`Successfully rejected ${selectedDrivers.length} drivers`);
    } catch (err) {
      alert('Failed to bulk reject drivers');
    } finally {
      setProcessingId(null);
    }
  };

  // Toggle driver selection
  const toggleDriverSelection = (driverId) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId) 
        ? prev.filter(id => id !== driverId) 
        : [...prev, driverId]
    );
  };

  // Filter verifications
  const filteredVerifications = pendingVerifications.filter(v => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'expiring') {
      const licenseExpiry = v.license_expiry_date ? checkDocumentExpiry(v.license_expiry_date) : null;
      const idExpiry = v.id_expiry_date ? checkDocumentExpiry(v.id_expiry_date) : null;
      return (licenseExpiry?.status === 'expiring_soon' || idExpiry?.status === 'expiring_soon');
    }
    if (filterStatus === 'expired') {
      const licenseExpiry = v.license_expiry_date ? checkDocumentExpiry(v.license_expiry_date) : null;
      const idExpiry = v.id_expiry_date ? checkDocumentExpiry(v.id_expiry_date) : null;
      return (licenseExpiry?.status === 'expired' || idExpiry?.status === 'expired');
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 p-4 z-10 shrink-0">
            <h1 className="text-xl font-bold text-white">Vetting &amp; Clearance Queue</h1>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-brandMint animate-spin mx-auto mb-4" />
              <p className="text-slate-400 font-mono text-sm">Loading verification queue...</p>
            </div>
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
            <h1 className="text-xl font-bold text-white hidden sm:block">Vetting &amp; Clearance Queue</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-black text-white">Pending Driver Verifications</h1>
              <button
                onClick={() => setShowExpiryDashboard(!showExpiryDashboard)}
                className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2"
              >
                <Calendar size={14} /> Expiry Dashboard
              </button>
            </div>
            <p className="text-slate-400">Review documents, cross-check guarantors, and approve clearances.</p>
          </div>

          {/* Expiry Dashboard */}
          {showExpiryDashboard && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="text-amber-400" size={20} />
                Document Expiry Monitor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <p className="text-xs font-mono text-slate-500 uppercase mb-2">Expiring Soon (≤90 days)</p>
                  <p className="text-2xl font-black text-amber-400">
                    {pendingVerifications.filter(v => {
                      const licenseExpiry = v.license_expiry_date ? checkDocumentExpiry(v.license_expiry_date) : null;
                      const idExpiry = v.id_expiry_date ? checkDocumentExpiry(v.id_expiry_date) : null;
                      return (licenseExpiry?.status === 'expiring_soon' || idExpiry?.status === 'expiring_soon');
                    }).length}
                  </p>
                </div>
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <p className="text-xs font-mono text-slate-500 uppercase mb-2">Already Expired</p>
                  <p className="text-2xl font-black text-red-400">
                    {pendingVerifications.filter(v => {
                      const licenseExpiry = v.license_expiry_date ? checkDocumentExpiry(v.license_expiry_date) : null;
                      const idExpiry = v.id_expiry_date ? checkDocumentExpiry(v.id_expiry_date) : null;
                      return (licenseExpiry?.status === 'expired' || idExpiry?.status === 'expired');
                    }).length}
                  </p>
                </div>
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <p className="text-xs font-mono text-slate-500 uppercase mb-2">Valid Documents</p>
                  <p className="text-2xl font-black text-brandMint">
                    {pendingVerifications.filter(v => {
                      const licenseExpiry = v.license_expiry_date ? checkDocumentExpiry(v.license_expiry_date) : null;
                      const idExpiry = v.id_expiry_date ? checkDocumentExpiry(v.id_expiry_date) : null;
                      return (licenseExpiry?.status === 'valid' || idExpiry?.status === 'valid') && 
                             !licenseExpiry?.status?.includes('expiring') && 
                             !idExpiry?.status?.includes('expiring');
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl"><Clock className="text-amber-400" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{stats.in_queue}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">In Queue</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brandMint/10 rounded-xl"><ShieldCheck className="text-brandMint" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{stats.cleared_this_month}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Cleared This Month</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl"><XCircle className="text-red-400" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{stats.blacklisted}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Blacklisted</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="text-brandMint" size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Auto-Accept</span>
                </div>
                <button
                  onClick={() => setAutoAcceptEnabled(!autoAcceptEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${autoAcceptEnabled ? 'bg-brandMint' : 'bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoAcceptEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Expiry Threshold</span>
                  <input
                    type="number"
                    value={expiryThreshold}
                    onChange={(e) => setExpiryThreshold(parseInt(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <button
                  onClick={runAutoAcceptance}
                  disabled={!autoAcceptEnabled || processingId}
                  className="w-full py-2 bg-brandMint/20 text-brandMint rounded-lg text-xs font-bold uppercase hover:bg-brandMint/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingId ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  Run Auto-Accept
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ─── Clearance Roster ──────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Clearance Roster</h3>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brandMint"
                    >
                      <option value="all">All Drivers</option>
                      <option value="expiring">Expiring Soon</option>
                      <option value="expired">Expired Documents</option>
                    </select>
                  </div>
                </div>
                
                {/* Bulk Actions Bar */}
                {selectedDrivers.length > 0 && (
                  <div className="p-3 bg-brandMint/10 border-b border-brandMint/30 flex items-center justify-between">
                    <span className="text-sm font-bold text-brandMint">{selectedDrivers.length} selected</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkApprove}
                        disabled={processingId === 'bulk'}
                        className="px-3 py-1.5 bg-brandMint text-corporateNavy text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {processingId === 'bulk' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approve All
                      </button>
                      <button
                        onClick={handleBulkReject}
                        disabled={processingId === 'bulk'}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-400 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {processingId === 'bulk' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                        Reject All
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="divide-y divide-slate-800/50">
                  {filteredVerifications.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => { setSelectedDriver(v); setShowDetails(true); }}
                      className={`p-4 cursor-pointer transition-all ${selectedDriver?.id === v.id ? 'bg-slate-800 border-l-2 border-brandMint' : 'hover:bg-slate-800/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shrink-0 overflow-hidden">
                          {v.avatar
                            ? <img src={v.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                            : <User size={20} className="text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedDrivers.includes(v.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleDriverSelection(v.id);
                                }}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-brandMint focus:ring-brandMint"
                              />
                              <p className="font-bold text-white truncate">{v.name}</p>
                            </div>
                            <span className="text-xs font-mono text-slate-500 shrink-0 ml-2">{v.submitted}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono text-slate-500">{v.license_number || 'No license'}</span>
                            <span className={statusBadge('pending')}>pending</span>
                            {v.has_vehicle ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">With Car</span>
                            ) : (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">Placement (No Car)</span>
                            )}
                            {(() => {
                              const licenseExpiry = v.license_expiry_date ? checkDocumentExpiry(v.license_expiry_date) : null;
                              const idExpiry = v.id_expiry_date ? checkDocumentExpiry(v.id_expiry_date) : null;
                              if (licenseExpiry?.status === 'expired' || idExpiry?.status === 'expired') {
                                return <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded">EXPIRED</span>;
                              }
                              if (licenseExpiry?.status === 'expiring_soon' || idExpiry?.status === 'expiring_soon') {
                                return <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">EXPIRING</span>;
                              }
                              return null;
                            })()}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{v.documents?.length || 0} docs submitted</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredVerifications.length === 0 && (
                    <div className="p-10 text-center">
                      <ShieldCheck className="w-12 h-12 text-brandMint mx-auto mb-3 opacity-20" />
                      <p className="text-slate-500 font-mono text-sm">
                        {filterStatus === 'all' ? 'No pending verifications' : 'No drivers match the filter'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <p className="text-xs font-mono text-slate-500">PAGE {currentPage} OF {totalPages}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-40">
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-40">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Driver Dossier ────────────────────────────── */}
            {showDetails && selectedDriver ? (
              <div className="lg:col-span-3 space-y-4 overflow-y-auto max-h-[calc(100vh-260px)]">

                {/* Identity */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-5">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Operative Dossier</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowLocationCert(true)}
                        className="text-xs font-bold uppercase tracking-wider text-brandMint hover:text-white transition-colors flex items-center gap-1"
                      >
                        <MapPin size={12} /> Location Cert
                      </button>
                      <button onClick={() => { setShowDetails(false); setSelectedDriver(null); }} className="text-slate-500 hover:text-white transition-colors">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shrink-0 overflow-hidden">
                      {selectedDriver.avatar
                        ? <img src={selectedDriver.avatar} alt="" className="w-full h-full object-cover" />
                        : <User size={32} className="text-slate-500" />}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white">{selectedDriver.name}</h4>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Mail size={11} />{selectedDriver.email}</span>
                        <span className="flex items-center gap-1"><Phone size={11} />{selectedDriver.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Operational Track', value: selectedDriver.has_vehicle ? 'Operates Own Vehicle (With Car)' : 'Seeking Vehicle Placement (No Car - Guarantors Required)' },
                      { label: 'NIN', value: selectedDriver.nin },
                      { label: 'BVN', value: selectedDriver.bvn },
                      { label: 'License No.', value: selectedDriver.license_number },
                      { label: 'License Class', value: selectedDriver.license_class },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-white font-mono">
                          {value || <span className="text-slate-600 font-normal italic">Not provided</span>}
                        </p>
                      </div>
                    ))}
                    
                    {/* ID Expiry Check */}
                    {selectedDriver.id_expiry_date && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                          <Calendar size={9} /> ID Expiry
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white font-mono">
                            {new Date(selectedDriver.id_expiry_date).toLocaleDateString()}
                          </p>
                          {(() => {
                            const expiryCheck = checkDocumentExpiry(selectedDriver.id_expiry_date);
                            if (expiryCheck.status === 'expired') {
                              return <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">EXPIRED</span>;
                            }
                            if (expiryCheck.status === 'expiring_soon') {
                              return <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle size={10} /> {expiryCheck.days}d
                              </span>;
                            }
                            return <span className="text-xs font-bold text-brandMint bg-brandMint/20 px-2 py-0.5 rounded">VALID</span>;
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* License Expiry Check */}
                    {selectedDriver.license_expiry_date && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                          <Calendar size={9} /> License Expiry
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white font-mono">
                            {new Date(selectedDriver.license_expiry_date).toLocaleDateString()}
                          </p>
                          {(() => {
                            const expiryCheck = checkDocumentExpiry(selectedDriver.license_expiry_date);
                            if (expiryCheck.status === 'expired') {
                              return <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded">EXPIRED</span>;
                            }
                            if (expiryCheck.status === 'expiring_soon') {
                              return <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle size={10} /> {expiryCheck.days}d
                              </span>;
                            }
                            return <span className="text-xs font-bold text-brandMint bg-brandMint/20 px-2 py-0.5 rounded">VALID</span>;
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {selectedDriver.residence_address && (
                      <div className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <p className="text-[10px] font-mono text-slate-500 uppercase mb-0.5 flex items-center gap-1">
                          <MapPin size={9} /> Residence Address
                        </p>
                        <p className="text-sm text-slate-300">{selectedDriver.residence_address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h5 className="font-bold text-white uppercase tracking-wider text-[10px] mb-4 font-mono flex items-center gap-2">
                    <FileText size={11} /> Submitted Documents
                  </h5>
                  {selectedDriver.documents?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDriver.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-200 text-sm">{doc.label}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={statusBadge(doc.status)}>{doc.status}</span>
                              {doc.uploaded_at && (
                                <span className="text-[10px] text-slate-600 font-mono">{doc.uploaded_at}</span>
                              )}
                            </div>
                            {doc.status === 'rejected' && doc.rejection_reason && (
                              <p className="text-[10px] text-red-400 mt-1 font-mono">↳ {doc.rejection_reason}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* View */}
                            {doc.url ? (
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                title="View document"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-brandMint/20 text-slate-400 hover:text-brandMint transition-colors"
                              >
                                <Eye size={14} />
                              </button>
                            ) : (
                              <span
                                title="No file uploaded"
                                className="p-2 rounded-lg bg-slate-900/50 text-slate-700 cursor-not-allowed"
                              >
                                <Eye size={14} />
                              </span>
                            )}

                            {/* Per-doc approve/reject — hidden once approved */}
                            {doc.status !== 'approved' && (
                              <>
                                <button
                                  onClick={() => handleApproveDoc(selectedDriver.id, doc.id)}
                                  disabled={!!processingId}
                                  title="Approve document"
                                  className="p-2 rounded-lg bg-brandMint/10 hover:bg-brandMint/30 text-brandMint transition-colors disabled:opacity-40"
                                >
                                  {processingId === `doc-approve-${doc.id}` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                </button>
                                <button
                                  onClick={() => handleRejectDoc(selectedDriver.id, doc.id)}
                                  disabled={!!processingId}
                                  title="Reject document"
                                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-40"
                                >
                                  {processingId === `doc-reject-${doc.id}` ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-sm font-mono text-center py-6">No documents submitted yet.</p>
                  )}
                </div>

                {/* Guarantors */}
                {selectedDriver.guarantors?.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h5 className="font-bold text-white uppercase tracking-wider text-[10px] mb-4 font-mono flex items-center gap-2">
                      <UserCheck size={11} /> Guarantor Information
                    </h5>
                    <div className="space-y-3">
                      {selectedDriver.guarantors.map((g, idx) => (
                        <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono font-bold text-brandMint uppercase">{g.label}</span>
                            <span className={statusBadge(g.status)}>{g.status}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div>
                              <span className="text-slate-500">Name </span>
                              <span className="text-white font-bold">{g.name || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Phone </span>
                              <span className="text-white font-mono">{g.phone || '—'}</span>
                            </div>
                            {g.occupation && (
                              <div>
                                <span className="text-slate-500">Occupation </span>
                                <span className="text-slate-300">{g.occupation}</span>
                              </div>
                            )}
                            {g.company && (
                              <div>
                                <span className="text-slate-500">Company </span>
                                <span className="text-slate-300">{g.company}</span>
                              </div>
                            )}
                            {g.address && (
                              <div className="col-span-2">
                                <span className="text-slate-500">Address </span>
                                <span className="text-slate-300">{g.address}</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedGuarantor(g);
                              setShowAIVerifier(true);
                            }}
                            className="w-full py-2 bg-brandMint/20 text-brandMint rounded-lg text-xs font-bold uppercase hover:bg-brandMint/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <Brain size={12} /> AI Verification Call
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pb-4">
                  <button
                    onClick={() => handleRemind(selectedDriver.id)}
                    disabled={!!processingId}
                    className="bg-slate-800 border border-slate-700 text-amber-400 font-bold py-3.5 px-4 rounded-xl uppercase tracking-wider hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-xs"
                  >
                    {processingId === `remind-${selectedDriver.id}`
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Mail size={16} />}
                    Remind Missing Docs
                  </button>
                  <button
                    onClick={() => handleApprove(selectedDriver.id)}
                    disabled={!!processingId}
                    className="flex-1 bg-brandMint text-corporateNavy font-black py-3.5 rounded-xl uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {processingId === `approve-${selectedDriver.id}`
                      ? <Loader2 size={18} className="animate-spin" />
                      : <CheckCircle size={18} />}
                    Approve &amp; Activate
                  </button>
                  <button
                    onClick={() => handleReject(selectedDriver.id)}
                    disabled={!!processingId}
                    className="flex-1 bg-slate-950 border border-slate-700 text-slate-400 font-bold py-3.5 rounded-xl uppercase tracking-wider hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {processingId === `reject-${selectedDriver.id}`
                      ? <Loader2 size={18} className="animate-spin" />
                      : <XCircle size={18} />}
                    Reject Driver
                  </button>
                </div>

              </div>
            ) : (
              <div className="lg:col-span-3 hidden lg:flex items-center justify-center bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed min-h-64">
                <div className="text-center">
                  <Shield size={40} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-600 font-mono text-sm">Select a driver to review their dossier</p>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* AI Verifier Modal */}
        {showAIVerifier && selectedGuarantor && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Brain className="text-brandMint" size={24} />
                  <h3 className="text-lg font-bold text-white">AI Guarantor Verification</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAIVerifier(false);
                    setSelectedGuarantor(null);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <AIGuarantorVerifier
                  guarantor={selectedGuarantor}
                  driver={selectedDriver}
                  onVerificationComplete={(result) => {
                    console.log('Verification complete:', result);
                    setShowAIVerifier(false);
                    setSelectedGuarantor(null);
                    loadPendingVerifications();
                    // Also update the selected driver in the dossier view
                    if (selectedDriver) {
                      const updatedDriver = { ...selectedDriver };
                      updatedDriver.guarantors = updatedDriver.guarantors.map(g => 
                        g.id === result.guarantor_id ? { ...g, status: result.verified ? 'verified' : 'failed' } : g
                      );
                      setSelectedDriver(updatedDriver);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Location Certification Modal */}
        {showLocationCert && selectedDriver && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <MapPin className="text-brandMint" size={24} />
                  <h3 className="text-lg font-bold text-white">Location-Based Certification</h3>
                </div>
                <button
                  onClick={() => {
                    setShowLocationCert(false);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <LocationCertification
                  driver={selectedDriver}
                  onCertificationUpdate={(data) => {
                    console.log('Certification updated:', data);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Document Lightbox Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                  <FileText size={18} className="text-brandMint" /> 
                  {previewDoc.label}
                </h3>
                <div className="flex items-center gap-4">
                  <a 
                    href={previewDoc.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-bold text-brandMint hover:text-white transition-colors uppercase"
                  >
                    Open in New Tab
                  </a>
                  <button onClick={() => setPreviewDoc(null)} className="text-slate-500 hover:text-white transition-colors">
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
              
              {/* Content View */}
              <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-auto">
                {previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={previewDoc.url} className="w-full h-full min-h-[500px] border-none" title="Document PDF"></iframe>
                ) : (
                  <img src={previewDoc.url} alt="Document Preview" className="max-w-full max-h-full object-contain rounded" />
                )}
              </div>
              
              {/* Footer Actions */}
              {previewDoc.status !== 'approved' && (
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      handleRejectDoc(selectedDriver.id, previewDoc.id);
                      setPreviewDoc(null);
                    }}
                    className="px-4 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all uppercase"
                  >
                    Reject Document
                  </button>
                  <button
                    onClick={() => {
                      handleApproveDoc(selectedDriver.id, previewDoc.id);
                      setPreviewDoc(null);
                    }}
                    className="px-4 py-2 bg-brandMint text-corporateNavy text-xs font-bold rounded-lg hover:bg-emerald-400 transition-all uppercase"
                  >
                    Approve Document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverVerification;
