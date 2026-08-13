import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/auth';
import { directoryService } from '../api/directory';
import api from '../api/axios';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  LogOut,
  Briefcase,
  AlertTriangle,
  Loader2,
  Users,
  Activity,
  CreditCard,
  CheckCircle2,
  Menu,
  X,
  Calendar
} from 'lucide-react';
import AvailabilityCalendar from '../components/Calendar/AvailabilityCalendar';
import DriverDossierModal from '../components/Directory/DriverDossierModal';

function HirerPortal() {
  const [userProfile, setUserProfile] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Search States
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchParams, setSearchParams] = useState({
    country_id: '',
    state_id: '',
    city_id: '',
    employment_type: '',
    license_class: '',
    preferred_route_type: ''
  });
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('directory'); // directory, monitoring, billing, assessments
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHires, setActiveHires] = useState([]);
  
  // Helper for countdown timer display
  const [now, setNow] = useState(Date.now());

  // Modal States
  const [availabilityModalDriver, setAvailabilityModalDriver] = useState(null);
  const [dossierDriverId, setDossierDriverId] = useState(null);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (expiresAtStr) => {
    const diff = new Date(expiresAtStr).getTime() - now;
    if (diff <= 0) return '00:00:00';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Hire Modal State
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [hireForm, setHireForm] = useState({
    contract_type: 'one_time',
    start_date: '',
    end_date: '',
    route_description: '',
    proposed_salary: ''
  });

  // Subscription State
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // KYC State
  const [kycForm, setKycForm] = useState({
    identity_type: 'NIN',
    identity_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    state_id: '',
    city_id: ''
  });
  const [isSavingKyc, setIsSavingKyc] = useState(false);
  const [kycStates, setKycStates] = useState([]);
  const [kycCities, setKycCities] = useState([]);

  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/user');
      setUserProfile(res.data);
      if (res.data.hirer) {
        setKycForm({
          identity_type: res.data.hirer.identity_type || 'NIN',
          identity_number: res.data.hirer.identity_number || '',
          emergency_contact_name: res.data.hirer.emergency_contact_name || '',
          emergency_contact_phone: res.data.hirer.emergency_contact_phone || '',
          state_id: res.data.hirer.state_id || '',
          city_id: res.data.hirer.city_id || ''
        });
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchUserProfile();
    fetchSubscriptionPlans();
    api.get('/countries').then(res => setCountries(res.data)).catch(console.error);

    // Load KYC States
    api.get('/states/1').then(res => setKycStates(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (kycForm.state_id) {
      api.get(`/cities/${kycForm.state_id}`).then(res => setKycCities(res.data)).catch(console.error);
    } else {
      setKycCities([]);
    }
  }, [kycForm.state_id]);

  const fetchSubscriptionPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get('/subscription/plans');
      if (res.data.success) {
        setSubscriptionPlans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (searchParams.country_id) {
      api.get(`/states/${searchParams.country_id}`).then(res => setStates(res.data)).catch(console.error);
      setSearchParams(prev => ({ ...prev, state_id: '', city_id: '' }));
    } else {
      setStates([]);
      setCities([]);
    }
  }, [searchParams.country_id]);

  useEffect(() => {
    if (searchParams.state_id) {
      api.get(`/cities/${searchParams.state_id}`).then(res => setCities(res.data)).catch(console.error);
      setSearchParams(prev => ({ ...prev, city_id: '' }));
    } else {
      setCities([]);
    }
  }, [searchParams.state_id]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const cleanParams = Object.fromEntries(Object.entries(searchParams).filter(([_, v]) => v !== ''));
      const res = await api.get('/search/drivers', { params: cleanParams });
      if (res.data && res.data.data) {
        setDrivers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to search drivers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setIsSubscribing(true);
    try {
      const res = await api.post('/subscription/subscribe', { plan_id: planId });
      if (res.data.payment_required && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
        return;
      }
      if (res.data.success) {
        alert('Subscription successful!');
        fetchUserProfile();
      }
    } catch (err) {
      console.error('Subscription failed', err);
      alert('Subscription failed. Please try again later.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setIsSavingKyc(true);
    try {
      const res = await api.post('/hirer/kyc', kycForm);
      if (res.data.success) {
        alert('Safety details submitted for verification.');
        fetchUserProfile();
      }
    } catch (err) {
      console.error('KYC submission failed', err);
      alert('Failed to submit details.');
    } finally {
      setIsSavingKyc(false);
    }
  };

  const openHireModal = (driver) => {
    // Check Verification
    if (userProfile?.hirer?.verification_status !== 'verified') {
      alert('You must be VERIFIED in the "Account & Safety" tab before you can hire operatives.');
      setActiveTab('safety');
      return;
    }

    // Check Subscription
    const expiresAt = userProfile?.hirer?.subscription_expires_at;
    if (!expiresAt || new Date(expiresAt) < new Date()) {
      alert('You need an active subscription to hire operatives. Please subscribe in the "Subscriptions" tab.');
      setActiveTab('subscriptions');
      return;
    }

    setSelectedDriver(driver);
    setShowHireModal(true);
  };

  const submitHireProposal = async (e) => {
    e.preventDefault();
    
    try {
      // Submit the actual hire request directly
      await directoryService.initiateHire(selectedDriver.id, hireForm);
      alert('Employment Proposal Sent Successfully!');
      setShowHireModal(false);
      setSelectedDriver(null);
      setHireForm({ contract_type: 'one_time', start_date: '', end_date: '', route_description: '', proposed_salary: '', payment_cycle: '24-48 hours' });
    } catch (err) {
      console.error('Hire request failed:', err);
      alert('Request failed to send. Please try again.');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-white font-sans flex overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
          <img src="/logo.svg" alt="OgaDriver" className="h-10 w-auto" />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="pt-3 pb-3 px-6 border-b border-slate-800 flex flex-col items-center justify-center gap-0">
          <img src="/logo.svg" alt="OgaDriver" className="h-14 w-auto -mt-3 -mb-1" />
          <p className="text-[10px] font-mono text-brandMint tracking-widest uppercase">Employer Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('directory'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'directory' ? 'bg-brandMint text-corporateNavy' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" /> Directory & Hiring
          </button>
          
          <button 
            onClick={() => { setActiveTab('monitoring'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'monitoring' ? 'bg-brandMint text-corporateNavy' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Activity className="w-5 h-5" /> Live Telemetry & Tracking
          </button>

          <button 
            onClick={() => { setActiveTab('assessments'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'assessments' ? 'bg-brandMint text-corporateNavy' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <CheckCircle2 className="w-5 h-5" /> Pending Assessments
            {activeHires.filter(h => h.status === 'assessment_pending').length > 0 && (
               <span className="ml-auto bg-amber-500 text-corporateNavy text-xs px-2 py-0.5 rounded-full">{activeHires.filter(h => h.status === 'assessment_pending').length}</span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('subscriptions'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'subscriptions' ? 'bg-brandMint text-corporateNavy' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Star className="w-5 h-5" /> Subscriptions
          </button>

          <button 
            onClick={() => { setActiveTab('safety'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'safety' ? 'bg-brandMint text-corporateNavy' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <ShieldCheck className="w-5 h-5" /> Account & Safety
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" /> Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 w-full h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 lg:p-6 flex justify-end lg:justify-between items-center">
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold">
              {activeTab === 'directory' && 'Verified Driver Directory'}
              {activeTab === 'monitoring' && 'Live Fleet Monitoring'}
              {activeTab === 'assessments' && 'Contract Assessments'}
              {activeTab === 'subscriptions' && 'Employer Tier Subscriptions'}
              {activeTab === 'safety' && 'Account & Safety Verification'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Active Hires: 0
            </span>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {activeTab === 'directory' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Directory Filters */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Text Search */}
                  <div className="relative col-span-1 md:col-span-2 lg:col-span-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search via Name or License ID..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); fetchDrivers(); }}
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors"
                    />
                  </div>

                  {/* Geolocation Selectors */}
                  <select
                    value={searchParams.country_id}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, country_id: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint appearance-none"
                  >
                    <option value="">Any Country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>

                  <select
                    value={searchParams.state_id}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, state_id: e.target.value }))}
                    disabled={!searchParams.country_id}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint appearance-none disabled:opacity-50"
                  >
                    <option value="">Any State</option>
                    {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>

                  <select
                    value={searchParams.city_id}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, city_id: e.target.value }))}
                    disabled={!searchParams.state_id}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint appearance-none disabled:opacity-50"
                  >
                    <option value="">Any City/LGA</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>

                  <select
                    value={searchParams.employment_type}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, employment_type: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint appearance-none"
                  >
                    <option value="">Any Employment Type</option>
                    <option value="full_time">Full-Time</option>
                    <option value="part_time">Part-Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="fleet">Fleet Partner</option>
                  </select>

                  <select
                    value={searchParams.license_class}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, license_class: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint appearance-none"
                  >
                    <option value="">Any License Class</option>
                    <option value="A">Class A (Motorcycle)</option>
                    <option value="B">Class B (Car/Minibus)</option>
                    <option value="C">Class C (Commercial Van)</option>
                    <option value="D">Class D (Bus)</option>
                    <option value="E">Class E (Executive/VIP)</option>
                    <option value="G">Class G (Heavy Duty)</option>
                    <option value="V">Class V (Convoy/Security)</option>
                  </select>

                  <button
                    onClick={fetchDrivers}
                    className="w-full md:col-span-2 lg:col-span-3 py-3 bg-brandMint text-corporateNavy rounded-xl font-black uppercase text-sm tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Filter className="w-5 h-5" /> Apply Advanced Filters
                  </button>
                </div>
              </div>

              {/* Directory Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brandMint">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Syncing Directory Grid...</p>
                </div>
              ) : drivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
                  <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">No Operatives Found</h3>
                  <p className="text-sm">We couldn't find any verified drivers matching those parameters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {drivers.map(driver => (
                    <div key={driver.id} className="bg-corporateNavy border border-slate-800 rounded-2xl overflow-hidden hover:border-brandMint/50 transition-all hover:shadow-[0_0_20px_rgba(28,209,136,0.1)] group flex flex-col">
                      <div className={`h-1 w-full ${driver.is_verified ? 'bg-brandMint' : 'bg-amber-500'}`}></div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                            {driver.user?.avatar ? (
                              <img src={driver.user.avatar} alt="Driver" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl font-black text-slate-500">
                                {(driver.user?.nickname || driver.user?.name)?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          {driver.is_verified ? (
                            <div className="flex items-center gap-1 bg-brandMint/10 text-brandMint px-2 py-1 rounded text-[10px] font-bold font-mono">
                              <ShieldCheck className="w-3 h-3" /> SECURED
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-bold font-mono">
                              <AlertTriangle className="w-3 h-3" /> PENDING
                            </div>
                          )}
                        </div>

                        {/* Recommendation Badges */}
                        <div className="flex gap-2 mb-3">
                           {driver.is_pro && (
                              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-corporateNavy px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shadow-lg shadow-amber-500/20">
                                 <Star className="w-3 h-3 fill-current" /> PRO RECOMMENDED
                              </span>
                           )}
                           {driver.is_hybrid && (
                              <span className="bg-slate-800 text-brandMint border border-slate-700 px-2 py-1 rounded text-[10px] font-bold font-mono tracking-widest uppercase flex items-center gap-1">
                                 HYBRID OPERATOR
                              </span>
                           )}
                        </div>

                        <div className="space-y-1 mb-6 flex-1">
                          <h3 className="text-lg font-black tracking-tight text-white group-hover:text-brandMint transition-colors line-clamp-1">
                            {driver.user?.nickname || driver.user?.name || 'Unknown Operator'}
                          </h3>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-mono text-slate-400 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> 
                                {driver.license_class ? `Class ${driver.license_class}` : 'Unclassified'}
                              </p>
                              {driver.license_class === 'E' && (
                                <span className="bg-amber-500/20 text-amber-400 text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border border-amber-500/30">Top Tier</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-brandMint" />
                              {driver.city ? `${driver.city.name}, ` : ''}{driver.state ? driver.state.name : 'Unknown Location'}
                            </p>
                            <p className="text-xs text-slate-400 capitalize">
                              <span className="font-bold text-slate-300">Types: </span>
                              {driver.employment_types && driver.employment_types.length > 0 
                                ? driver.employment_types.map(t => t.replace('_', ' ')).join(', ') 
                                : 'Flexible'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          <button 
                            onClick={() => setAvailabilityModalDriver(driver)}
                            className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Calendar
                          </button>
                          <button 
                            onClick={() => setDossierDriverId(driver.id)}
                            className="flex-1 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-brandMint hover:bg-brandMint hover:text-corporateNavy hover:border-brandMint transition-all"
                          >
                            View Dossier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="flex flex-col items-center justify-center py-32 text-center max-w-2xl mx-auto space-y-6">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800 shadow-[0_0_30px_rgba(28,209,136,0.05)]">
                <Activity className="w-10 h-10 text-brandMint animate-pulse" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Telemetry Offline</h2>
              <p className="text-slate-400 text-lg">
                You do not have any active deployments. Hire an operative from the Directory to access real-time GPS tracking, G-Force monitoring, and the Extortion Shield SOS features.
              </p>
              <button 
                onClick={() => setActiveTab('directory')}
                className="px-8 py-4 bg-brandMint text-corporateNavy rounded-xl font-black uppercase text-sm hover:bg-emerald-400 transition-all"
              >
                Browse Directory
              </button>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="mb-6">
                  <h3 className="text-2xl font-black text-white uppercase">Physical Assessments Queue</h3>
                  <p className="text-slate-400">Conduct your physical "Quality Control" check before authorizing telemetry and active deployment.</p>
               </div>

               {activeHires.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
                    <CheckCircle2 className="w-12 h-12 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">No Pending Assessments</h3>
                  </div>
               ) : (
                  <div className="space-y-6">
                    {activeHires.map(hire => (
                       <div key={hire.id} className="bg-corporateNavy border border-slate-800 rounded-2xl overflow-hidden">
                          <div className={`h-1 w-full ${hire.status === 'active' ? 'bg-brandMint' : 'bg-amber-500'}`}></div>
                          <div className="p-6">
                             <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-4">
                                   <div className="w-14 h-14 bg-slate-800 rounded-xl border-2 border-slate-700 flex items-center justify-center text-xl font-black text-slate-500">
                                      {hire.driver_name.charAt(0)}
                                   </div>
                                   <div>
                                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Contract: {hire.id}</span>
                                      <h3 className="text-xl font-black text-white">{hire.driver_name}</h3>
                                   </div>
                                </div>
                                {hire.status === 'assessment_pending' && (
                                  <div className="bg-slate-950 border border-amber-500/30 rounded-xl px-4 py-2 text-right">
                                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block">Contract Expires In</span>
                                    {hire.appointment_scheduled ? (
                                      <span className="font-mono font-bold text-brandMint">APPOINTMENT SECURED</span>
                                    ) : (
                                      <span className="font-mono font-black text-amber-400 text-lg">{formatCountdown(hire.expires_at)}</span>
                                    )}
                                  </div>
                                )}
                             </div>

                             {hire.status === 'assessment_pending' && (
                                <div className="space-y-4">
                                   <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                                      <h4 className="font-bold text-white flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-amber-500"/> Employer Quality Control Action Required</h4>
                                      <p className="text-sm text-slate-300">
                                        The driver has 30 hours to make contact. Once they do, click "Appointment Scheduled" to freeze the timer. When you meet physically, ensure they are professional, sober, and well-dressed.
                                      </p>
                                   </div>

                                   <div className="flex flex-col md:flex-row gap-3 mt-4">
                                      {!hire.appointment_scheduled ? (
                                        <button 
                                          onClick={() => setActiveHires(prev => prev.map(h => h.id === hire.id ? {...h, appointment_scheduled: true} : h))}
                                          className="flex-1 py-3 bg-slate-900 border border-amber-500 text-amber-500 rounded-xl text-sm font-bold hover:bg-amber-500 hover:text-corporateNavy transition-all"
                                        >
                                          Appointment Scheduled
                                        </button>
                                      ) : (
                                        <button 
                                          disabled
                                          className="flex-1 py-3 bg-slate-900 border border-brandMint/30 text-brandMint/50 rounded-xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                          <CheckCircle2 size={16} /> Appointment Logged
                                        </button>
                                      )}

                                      <button 
                                        onClick={() => setActiveHires(prev => prev.map(h => h.id === hire.id ? {...h, status: 'active'} : h))}
                                        className="flex-1 py-3 bg-brandMint border border-brandMint text-corporateNavy rounded-xl text-sm font-black uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                                      >
                                        <ShieldCheck size={18} /> Approve Operative
                                      </button>

                                      <button 
                                        onClick={() => setActiveHires(prev => prev.filter(h => h.id !== hire.id))}
                                        className="flex-1 py-3 bg-slate-950 border border-red-500/50 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                      >
                                        <AlertTriangle size={16} /> Dispute & Reject
                                      </button>
                                   </div>
                                </div>
                             )}

                             {hire.status === 'active' && (
                                <div className="bg-brandMint/10 border border-brandMint/30 rounded-xl p-4 flex items-center gap-4">
                                  <ShieldCheck className="w-8 h-8 text-brandMint shrink-0" />
                                  <div>
                                     <h4 className="font-bold text-brandMint">Deployment Authorized</h4>
                                     <p className="text-sm text-slate-300">The operative has passed physical inspection. Telemetry link is active.</p>
                                  </div>
                                </div>
                             )}
                          </div>
                       </div>
                    ))}
                  </div>
               )}
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <h3 className="text-2xl font-black text-white uppercase mb-4">Employer Subscription Plans</h3>
              {userProfile?.hirer?.subscription_tier && (
                 <div className="bg-brandMint/10 border border-brandMint/30 p-4 rounded-xl mb-6">
                   <p className="text-brandMint font-bold">Current Tier: {userProfile.hirer.subscription_tier}</p>
                   <p className="text-sm text-brandMint/70">Expires: {new Date(userProfile.hirer.subscription_expires_at).toLocaleDateString()}</p>
                 </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingPlans ? (
                  <div className="col-span-3 py-12 flex justify-center text-brandMint"><Loader2 className="animate-spin w-8 h-8" /></div>
                ) : (
                  subscriptionPlans.map(plan => (
                    <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col">
                      {plan.isPopular && <div className="absolute top-0 right-0 bg-brandMint text-corporateNavy text-[10px] font-black px-3 py-1 rounded-bl-lg">POPULAR</div>}
                      <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                      <div className="text-3xl font-black text-brandMint mb-4">{plan.price}</div>
                      <ul className="space-y-2 mb-6 flex-1 text-slate-400 text-sm">
                        {plan.features?.map((f, i) => (
                          <li key={i} className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-brandMint shrink-0 mt-0.5" /> {f}</li>
                        ))}
                      </ul>
                      <button 
                        disabled={isSubscribing}
                        onClick={() => handleSubscribe(plan.id)}
                        className="w-full py-3 bg-brandMint text-corporateNavy rounded-xl text-sm font-black hover:bg-emerald-400 transition-all disabled:opacity-50"
                      >
                        {isSubscribing ? 'PROCESSING...' : 'Subscribe'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'safety' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-2xl font-black text-white uppercase">Account & Safety Verification</h3>
              <p className="text-slate-400">For the safety of our operatives, we require verification of employer identities.</p>

              {userProfile?.hirer?.verification_status === 'verified' ? (
                <div className="bg-brandMint/10 border border-brandMint/30 p-6 rounded-xl flex items-center gap-4">
                  <ShieldCheck className="w-12 h-12 text-brandMint" />
                  <div>
                    <h4 className="text-brandMint font-bold text-lg">Identity Verified</h4>
                    <p className="text-slate-300 text-sm">Your employer account has been vetted. You can now post jobs and hire operatives.</p>
                  </div>
                </div>
              ) : userProfile?.hirer?.verification_status === 'pending' ? (
                <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-xl flex items-center gap-4">
                  <AlertTriangle className="w-12 h-12 text-amber-500" />
                  <div>
                    <h4 className="text-amber-500 font-bold text-lg">Verification Pending</h4>
                    <p className="text-slate-300 text-sm">Your safety details are currently under review by our team.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleKycSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Identity Type</label>
                  <select 
                    value={kycForm.identity_type}
                    onChange={(e) => setKycForm({...kycForm, identity_type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                  >
                    <option value="NIN">National Identification Number (NIN)</option>
                    <option value="BVN">Bank Verification Number (BVN)</option>
                    <option value="CAC">CAC (Company Registration)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Identity Number</label>
                  <input 
                    type="text" 
                    required
                    value={kycForm.identity_number}
                    onChange={(e) => setKycForm({...kycForm, identity_number: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Emergency Contact Name</label>
                  <input 
                    type="text" 
                    required
                    value={kycForm.emergency_contact_name}
                    onChange={(e) => setKycForm({...kycForm, emergency_contact_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Emergency Contact Phone</label>
                  <input 
                    type="text" 
                    required
                    value={kycForm.emergency_contact_phone}
                    onChange={(e) => setKycForm({...kycForm, emergency_contact_phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">State of Operation</label>
                  <select 
                    required
                    value={kycForm.state_id}
                    onChange={(e) => setKycForm({...kycForm, state_id: e.target.value, city_id: ''})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                  >
                    <option value="">Select State</option>
                    {kycStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">City/LGA</label>
                  <select 
                    required
                    disabled={!kycForm.state_id}
                    value={kycForm.city_id}
                    onChange={(e) => setKycForm({...kycForm, city_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint disabled:opacity-50"
                  >
                    <option value="">Select City/LGA</option>
                    {kycCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={isSavingKyc}
                  className="w-full py-3 mt-4 bg-brandMint text-corporateNavy rounded-xl text-sm font-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isSavingKyc ? 'SUBMITTING...' : 'SUBMIT SAFETY DETAILS'}
                </button>
              </form>
            )}
          </div>
          )}
        </div>
      </main>

      {/* Availability Calendar Modal */}
      {availabilityModalDriver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-corporateNavy border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative max-h-[90vh]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brandMint to-emerald-400"></div>
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Driver Availability</h2>
              <button onClick={() => setAvailabilityModalDriver(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AvailabilityCalendar driverId={availabilityModalDriver.id} isEmployerMode={true} />
            </div>
          </div>
        </div>
      )}

      {/* Driver Dossier Modal */}
      {dossierDriverId && (
        <DriverDossierModal 
          driverId={dossierDriverId} 
          onClose={() => setDossierDriverId(null)} 
        />
      )}

      {/* Hire Modal */}
      {showHireModal && selectedDriver && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-corporateNavy border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brandMint to-emerald-400"></div>
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Hire Operative</h2>
              <button onClick={() => setShowHireModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={submitHireProposal} className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                  {selectedDriver.user?.avatar ? (
                    <img src={selectedDriver.user.avatar} alt={selectedDriver.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{selectedDriver.user?.name}</h3>
                  <p className="text-sm text-slate-400">{selectedDriver.formatted_driver_id}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Contract Type</label>
                <select 
                  value={hireForm.contract_type}
                  onChange={(e) => setHireForm({...hireForm, contract_type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                >
                  <option value="one_time">One-Time Hire</option>
                  <option value="contract">Contract Employment</option>
                  <option value="fleet">Fleet Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                <input 
                  type="date"
                  value={hireForm.start_date}
                  onChange={(e) => setHireForm({...hireForm, start_date: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">End Date</label>
                <input 
                  type="date"
                  value={hireForm.end_date}
                  onChange={(e) => setHireForm({...hireForm, end_date: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Route/Job Description</label>
                <textarea 
                  value={hireForm.route_description}
                  onChange={(e) => setHireForm({...hireForm, route_description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Proposed Salary (₦)</label>
                <input 
                  type="text"
                  value={hireForm.proposed_salary}
                  onChange={(e) => setHireForm({...hireForm, proposed_salary: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Payment Cycle</label>
                <select 
                  value={hireForm.payment_cycle}
                  onChange={(e) => setHireForm({...hireForm, payment_cycle: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-brandMint"
                >
                  <option value="24-48 hours">24-48 Hours</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brandMint text-corporateNavy rounded-xl text-sm font-black hover:bg-emerald-400 transition-all"
              >
                SEND PROPOSAL
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default HirerPortal;
