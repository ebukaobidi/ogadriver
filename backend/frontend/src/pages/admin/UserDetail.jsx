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
  Building2,
  Key,
  Brain,
  AlertTriangle,
  Send,
  RefreshCw,
  ShieldOff,
  Copy
} from 'lucide-react';
import { adminService } from '../../api/admin';

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  // Password Reset Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassType, setResetPassType] = useState('generate');
  const [customPass, setCustomPass] = useState('');
  const [resetSendEmail, setResetSendEmail] = useState(false);
  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ state_id: '', city_id: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [dbStates, setDbStates] = useState([]);
  const [dbCities, setDbCities] = useState([]);

  useEffect(() => {
    loadUserDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      if (user.avatar) {
        setActivePhoto(user.avatar);
      } else if (user.avatar_secondary) {
        setActivePhoto(user.avatar_secondary);
      } else if (user.avatar_tertiary) {
        setActivePhoto(user.avatar_tertiary);
      } else {
        setActivePhoto(null);
      }
      setEditData({ state_id: user.state_id || '', city_id: user.city_id || '' });
    }
  }, [user]);

  useEffect(() => {
    import('../../api/axios').then(({ default: api }) => {
      // Use standard location API, assuming default country is Nigeria (1)
      api.get('/states/1').then(res => setDbStates(res.data)).catch(console.error);
    });
  }, []);

  useEffect(() => {
    if (editData.state_id) {
      import('../../api/axios').then(({ default: api }) => {
        api.get(`/cities/${editData.state_id}`).then(res => setDbCities(res.data)).catch(console.error);
      });
    } else {
      setDbCities([]);
    }
  }, [editData.state_id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await adminService.updateUser(id, editData);
      alert('Profile updated successfully');
      setShowEditModal(false);
      loadUserDetails();
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  const storageUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/storage/')) {
      return path;
    }
    return `/storage/${path.replace(/^\//, '')}`;
  };

  const loadUserDetails = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await adminService.getUserDetails(id);
      setUser(response.data || null);
      if (!response.data) setLoadError('User not found');
    } catch (err) {
      console.error('Failed to load user details:', err);
      setUser(null);
      setLoadError(err.response?.data?.message || err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditWallet = async () => {
    const amountStr = window.prompt("Enter amount to credit to this user's wallet:");
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    try {
      await adminService.creditUserWallet(id, amount);
      alert(`Successfully credited ₦${amount}`);
      loadUserDetails();
    } catch (err) {
      alert('Failed to credit wallet: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRoleChange = async (roleId) => {
    if (!window.confirm("Are you sure you want to change this user's role?")) return;
    try {
      await adminService.updateUserRole(id, roleId);
      alert("Role updated successfully.");
      loadUserDetails();
    } catch (err) {
      alert('Failed to update role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSuspend = async () => {
    const action = user.status === 'active' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) return;
    try {
      await adminService.suspendUser(id);
      loadUserDetails();
    } catch (err) {
      alert(`Failed to ${action} account: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenResetModal = () => {
    setResetPassType('generate');
    setCustomPass('');
    setResetSendEmail(false);
    setResetResult(null);
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (resetPassType === 'custom' && customPass.length < 6) {
      return alert("Custom password must be at least 6 characters long.");
    }

    setResetPassLoading(true);
    setResetResult(null);
    try {
      const res = await adminService.resetUserPassword(id, {
        password: resetPassType === 'custom' ? customPass : null,
        send_email: resetSendEmail
      });
      setResetResult(res);
    } catch (err) {
      alert('Failed to reset password: ' + (err.response?.data?.message || err.message));
    } finally {
      setResetPassLoading(false);
    }
  };

  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgChannels, setMsgChannels] = useState(['email', 'in-app']);
  const [msgLoading, setMsgLoading] = useState(false);
  
  const [previewDoc, setPreviewDoc] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return alert("Message cannot be empty");
    if (msgChannels.length === 0) return alert("Select at least one delivery channel");

    setMsgLoading(true);
    try {
      await adminService.sendUserMessage(id, {
        subject: msgSubject,
        message: msgText,
        channels: msgChannels
      });
      alert("Message sent successfully!");
      setShowMsgModal(false);
      setMsgSubject('');
      setMsgText('');
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setMsgLoading(false);
    }
  };

  const handleApproveDocument = async () => {
    if (!previewDoc) return;
    try {
      await adminService.approveDocument(user.driver.id, previewDoc.id);
      alert('Document approved successfully');
      setPreviewDoc(null);
      loadUserDetails();
    } catch (err) {
      alert('Failed to approve document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectDocument = async () => {
    if (!previewDoc) return;
    const reason = window.prompt("Enter rejection reason:");
    if (reason === null) return;

    try {
      await adminService.rejectDocument(user.driver.id, previewDoc.id, reason);
      alert('Document rejected');
      setPreviewDoc(null);
      loadUserDetails();
    } catch (err) {
      alert('Failed to reject document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleManualVerify = async () => {
    if (!window.confirm(
      `Manually approve ${user.name}'s registration?\n\nThis will mark their phone as verified and activate the account. Only do this if the user contacted support and you have confirmed their identity.`
    )) return;
    try {
      const res = await adminService.manualVerifyUser(id);
      alert(res.message);
      loadUserDetails();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const [resendResult, setResendResult] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  const handleResendCode = async (channels) => {
    setResendLoading(true);
    setResendResult(null);
    try {
      const res = await adminService.resendVerificationCode(id, channels);
      setResendResult(res);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-brandMint">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandMint mx-auto mb-4"></div>
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 px-6">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest text-amber-400 mb-2">User Unavailable</p>
        <p className="text-sm text-slate-400 text-center max-w-md mb-6">{loadError || 'User could not be loaded.'}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-bold"
          >
            Back to List
          </button>
          <button
            onClick={loadUserDetails}
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
                
                  <div className="flex flex-col gap-3 items-center mb-4 relative z-10">
                  {/* Main Avatar */}
                  <div className="w-28 h-28 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg">
                    {activePhoto ? (
                      <img src={activePhoto} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={52} className="text-slate-500" />
                    )}
                    <div className={"absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center " + (
                      user.status === 'active' ? 'bg-brandMint text-corporateNavy' : 'bg-red-500 text-white'
                    )}>
                      {user.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </div>
                  </div>

                  {/* Photo Strip — always render if any photo exists */}
                  {(user.avatar || user.avatar_secondary || user.avatar_tertiary) && (
                    <div className="flex gap-2 justify-center">
                      {[
                        { src: user.avatar, label: 'Primary' },
                        { src: user.avatar_secondary, label: 'Secondary' },
                        { src: user.avatar_tertiary, label: 'Tertiary' },
                      ].map(({ src, label }) =>
                        src ? (
                          <button
                            key={label}
                            onClick={() => setActivePhoto(src)}
                            title={label}
                            className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shadow-md hover:scale-105 ${
                              activePhoto === src
                                ? 'border-brandMint ring-2 ring-brandMint ring-offset-2 ring-offset-slate-900'
                                : 'border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            <img src={src} alt={label} className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <div
                            key={label}
                            title={`${label} — not uploaded`}
                            className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center opacity-40"
                          >
                            <User size={16} className="text-slate-600" />
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-black text-white relative z-10">{user.name}</h2>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2 relative z-10">
                   <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-slate-800 text-slate-300 border border-slate-700">
                      Role: {user.role}
                    </span>
                   {/* Message User */}
                   <button 
                      onClick={() => setShowMsgModal(true)}
                      className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-colors"
                   >
                     Message
                   </button>
                   {/* Quick Send Email */}
                   <button
                      onClick={() => { setMsgChannels(['email']); setShowMsgModal(true); }}
                      className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-colors"
                   >
                     Email
                   </button>
                   {/* Edit Profile */}
                   <button
                      onClick={() => setShowEditModal(true)}
                      className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-colors flex items-center gap-1"
                   >
                     <Edit size={12} /> Edit
                   </button>
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
                    <Edit size={16} className="text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">Location: {user.state_id ? dbStates.find(s => s.id == user.state_id)?.name || user.state_id : 'N/A'} {user.city_id ? ` / ${dbCities.find(c => c.id == user.city_id)?.name || user.city_id}` : ''}</span>
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
                  <div className="flex justify-center gap-3 mt-4">
                    <button className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors uppercase tracking-wider">
                      View Transactions
                    </button>
                    <button 
                      onClick={() => handleCreditWallet()}
                      className="px-4 py-2 bg-brandMint/10 text-brandMint text-xs font-bold rounded-lg hover:bg-brandMint hover:text-corporateNavy transition-colors uppercase tracking-wider flex items-center gap-2"
                    >
                      <Wallet size={14} /> Credit Wallet
                    </button>
                  </div>
                </div>
              </div>

              {/* Super Admin Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 border-t-4 border-t-red-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                    <ShieldCheck size={16} className="text-red-500" /> Super Admin Controls
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <p className="text-xs font-mono text-slate-500 mb-2 uppercase">Account Role</p>
                    <select 
                      value={user.role === 'hirer' ? 1 : user.role === 'driver' ? 2 : user.role === 'super_admin' ? 3 : user.role === 'admin' ? 4 : ''}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
                    >
                      <option value="" disabled>Select Role...</option>
                      <option value="4">Admin</option>
                      <option value="3">Super Admin</option>
                      <option value="2">Driver</option>
                      <option value="1">Hirer</option>
                    </select>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <p className="text-xs font-mono text-slate-500 mb-2 uppercase">Danger Zone</p>
                    <button 
                      onClick={() => handleSuspend()}
                      className="w-full px-4 py-2 bg-slate-900 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 hover:border-red-500 hover:text-red-400 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {user.status === 'active' ? <XCircle size={14} /> : <CheckCircle size={14} />} 
                      {user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                    </button>
                    <button 
                      onClick={() => handleOpenResetModal()}
                      className="w-full px-4 py-2 bg-slate-900 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 hover:border-amber-500 hover:text-amber-400 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Key size={14} /> Reset Password
                    </button>
                  </div>
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
                              <span className="text-xs font-bold text-slate-300 uppercase">{(doc.document_type || 'document').replace(/_/g, ' ')}</span>
                            </div>
                            <button 
                              onClick={() => setPreviewDoc(doc)}
                              disabled={!doc.file_path}
                              className="text-slate-500 hover:text-brandMint transition-colors disabled:opacity-40"
                            >
                              <Eye size={14} />
                            </button>
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

              {/* Registration Verification Panel */}
              {!user.phone_verified && (
                <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 border-t-4 border-t-amber-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                      <ShieldOff size={16} className="text-amber-500" /> Registration Verification
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400 uppercase">Unverified</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-5">
                    This user has not verified their phone number. If they contacted support due to OTP delivery failure, you can manually approve or regenerate their code below.
                  </p>

                  {/* Current code display */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl mb-4">
                    <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Current OTP Code on Record</p>
                    {user.verification_code ? (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black font-mono text-amber-400 tracking-[0.3em]">
                          {user.verification_code}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(user.verification_code);
                              alert('Code copied to clipboard');
                            }}
                            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                          >
                            <Copy size={12} /> Copy
                          </button>
                          <span className={`text-[10px] font-bold ${user.verification_code_expired ? 'text-red-400' : 'text-brandMint'}`}>
                            {user.verification_code_expired ? '⚠ Expired' : '✓ Valid'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No code on record — user may not have started registration.</p>
                    )}
                    {user.verification_expires_at && (
                      <p className="text-[10px] font-mono text-slate-500 mt-2">
                        Expires: {new Date(user.verification_expires_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Resend result display */}
                  {resendResult && (
                    <div className="p-4 bg-brandMint/5 border border-brandMint/20 rounded-xl mb-4">
                      <p className="text-xs text-brandMint font-bold mb-1">New Code Generated</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black font-mono text-white tracking-[0.3em]">{resendResult.code}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(resendResult.code);
                            alert('Code copied!');
                          }}
                          className="flex items-center gap-1 text-xs text-brandMint hover:text-white transition-colors"
                        >
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{resendResult.message}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Expires: {new Date(resendResult.expires_at).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleResendCode(['sms', 'email'])}
                        disabled={resendLoading}
                        className="py-2.5 flex items-center justify-center gap-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={13} className={resendLoading ? 'animate-spin' : ''} />
                        {resendLoading ? 'Generating...' : 'Regen & Send Code'}
                      </button>
                      <button
                        onClick={() => handleResendCode(['email'])}
                        disabled={resendLoading}
                        className="py-2.5 flex items-center justify-center gap-2 bg-slate-800 text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        <Send size={13} /> Email Only
                      </button>
                    </div>
                    <button
                      onClick={handleManualVerify}
                      className="py-3 flex items-center justify-center gap-2 bg-brandMint/10 text-brandMint hover:bg-brandMint hover:text-corporateNavy rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <CheckCircle size={14} /> Manually Approve Account
                    </button>
                    <p className="text-[10px] text-slate-600 text-center">
                      Manual approval bypasses OTP — only use after confirming user identity via phone or ID.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Key size={18} className="text-amber-500" /> Reset User Password
              </h3>
              <button onClick={() => { setShowResetModal(false); setResetResult(null); }} className="text-slate-500 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            {!resetResult ? (
              <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
                <p className="text-xs text-slate-400">
                  Reset the password for <strong>{user.name}</strong>. Choose between auto-generating a secure random password or entering a custom one.
                </p>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password Option</label>
                  
                  <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="passType"
                      checked={resetPassType === 'generate'}
                      onChange={() => setResetPassType('generate')}
                      className="text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-800"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">Generate Secure Random Password</p>
                      <p className="text-[10px] text-slate-500">Auto-generates a temporary random password.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="passType"
                      checked={resetPassType === 'custom'}
                      onChange={() => setResetPassType('custom')}
                      className="text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-800"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">Use Custom Password</p>
                      <p className="text-[10px] text-slate-500">Set a specific password manually.</p>
                    </div>
                  </label>
                </div>

                {resetPassType === 'custom' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Password</label>
                    <input
                      type="text"
                      value={customPass}
                      onChange={(e) => setCustomPass(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                      placeholder="Enter new custom password..."
                    />
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetSendEmail}
                      onChange={(e) => setResetSendEmail(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Try sending new password to user's email ({user.email})</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowResetModal(false); setResetResult(null); }}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetPassLoading}
                    className="px-6 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 transition-colors disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
                  >
                    {resetPassLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-brandMint/5 border border-brandMint/20 rounded-xl text-center">
                  <p className="text-xs text-brandMint font-mono uppercase tracking-widest mb-2 font-bold">Password Reset Successful</p>
                  <div className="flex items-center justify-center gap-3 mb-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-xl font-mono font-black text-white select-all">
                      {resetResult.password}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(resetResult.password);
                        alert('Password copied to clipboard!');
                      }}
                      className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    You can copy the temporary password above and send it manually to the user.
                  </p>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p>• <strong>Method:</strong> {resetPassType === 'custom' ? 'Custom password set' : 'Generated temporary password'}</p>
                  <p>• <strong>Email Status:</strong> {resetResult.email_sent ? 'Sent successfully to user email' : 'Not sent (disabled or mail server failed)'}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      setShowResetModal(false);
                      setResetResult(null);
                    }}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors uppercase tracking-wider"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showMsgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Mail size={18} className="text-blue-500" /> Send Message
              </h3>
              <button onClick={() => setShowMsgModal(false)} className="text-slate-500 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject (Optional)</label>
                <input 
                  type="text" 
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Account Update"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message <span className="text-red-500">*</span></label>
                <textarea 
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  required
                  rows="4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Delivery Channels</label>
                <div className="flex gap-4">
                  {['email', 'sms', 'in-app'].map(channel => (
                    <label key={channel} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={msgChannels.includes(channel)}
                        onChange={(e) => {
                          if (e.target.checked) setMsgChannels([...msgChannels, channel]);
                          else setMsgChannels(msgChannels.filter(c => c !== channel));
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-950"
                      />
                      <span className="capitalize">{channel.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowMsgModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={msgLoading}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {msgLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      onClick={handleRejectDocument}
                      className="py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={handleApproveDocument}
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
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Edit size={16} className="text-brandMint" /> Edit Profile
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">State</label>
                  <select 
                    value={editData.state_id}
                    onChange={(e) => setEditData({...editData, state_id: e.target.value, city_id: ''})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brandMint outline-none block"
                  >
                    <option value="">Select State</option>
                    {dbStates.map(state => (
                      <option key={state.id} value={state.id}>{state.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 mb-1 uppercase">LGA / City</label>
                  <select 
                    value={editData.city_id}
                    onChange={(e) => setEditData({...editData, city_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brandMint outline-none block"
                    disabled={!editData.state_id}
                  >
                    <option value="">Select LGA</option>
                    {dbCities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={editLoading}
                    className="px-6 py-2 bg-brandMint text-corporateNavy rounded-lg text-sm font-bold hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {editLoading ? <RefreshCw size={16} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserDetail;
