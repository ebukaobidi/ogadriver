import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { authService } from '../../api/auth';
import { safeArray } from '../../utils/safeArray';
import { 
  User, Wallet, MapPin, Briefcase, FileText, Phone, Settings, 
  LogOut, Plus, Edit2, Trash2, X, Bell, AlertTriangle, CheckCircle2,
  ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock, ExternalLink,
  ChevronRight, MessageCircle, Send, Loader2, Sparkles, RefreshCw, Map
, Check , Fingerprint, Globe , Sun, Users, Star, Home } from 'lucide-react';
import UniversalSosModal from '../common/UniversalSosModal';
import MapLocationPickerModal from '../common/MapLocationPickerModal';

const DEFAULT_PLACES = [
  { id: '1', name: 'Home', address: 'Victoria Island, Lagos', icon: 'Home' },
  { id: '2', name: 'Office', address: 'Marina Financial Center, Lagos', icon: 'Briefcase' }
];

export default function HirerAccount() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [walletBal, setWalletBal] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [preferences, setPreferences] = useState({
    ac_preference: true,
    quiet_ride: false,
    allow_pets: false,
    female_driver_only: false
  });
  
  // Modals state
  const [showSosModal, setShowSosModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [placeForm, setPlaceForm] = useState({ name: '', address: '', icon: 'MapPin', latitude: null, longitude: null });
  const [mapPicker, setMapPicker] = useState({ isOpen: false, address: '', lat: null, lng: null });

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('5000');
  const [topUpLoading, setTopUpLoading] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', note: '' });
  const [transferLoading, setTransferLoading] = useState(false);

  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [showJobsModal, setShowJobsModal] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [showContractsModal, setShowContractsModal] = useState(false);
  const [myContracts, setMyContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  const [showWalletModal, setShowWalletModal] = useState(false);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', company_name: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSavedPlacesDrawer, setShowSavedPlacesDrawer] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchWallet();
    fetchSavedPlaces();
    fetchPreferences();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me').catch(() => api.get('/hirer/profile'));
      const userData = res.data?.user || res.data?.data || authService.getUser();
      setProfile(userData);
      setProfileForm({
        name: userData?.name || '',
        phone: userData?.phone || '',
        company_name: userData?.hirer?.company_name || ''
      });
    } catch {
      const cached = authService.getUser();
      setProfile(cached);
      if (cached) {
        setProfileForm({
          name: cached.name || '',
          phone: cached.phone || '',
          company_name: cached.company_name || ''
        });
      }
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      const bal = res.data?.wallet?.balance ?? res.data?.data?.balance ?? res.data?.balance ?? 0;
      setWalletBal(bal);
      setWalletTransactions(res.data?.transactions || []);
    } catch {
      // fallback
    }
  };

  const fetchSavedPlaces = async () => {
    try {
      const res = await api.get('/hirer/saved-places');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSavedPlaces(res.data.data);
        localStorage.setItem('ogadriver_saved_places', JSON.stringify(res.data.data));
        return;
      }
    } catch {}

    // Fallback to local storage
    const stored = localStorage.getItem('ogadriver_saved_places');
    if (stored) {
      try {
        setSavedPlaces(JSON.parse(stored));
        return;
      } catch {}
    }
    setSavedPlaces(DEFAULT_PLACES);
  };
  
  const fetchPreferences = async () => {
    try {
      const res = await api.get('/hirer/preferences');
      if (res.data?.data) {
        setPreferences(prev => ({ ...prev, ...res.data.data }));
        return;
      }
    } catch {}

    const stored = localStorage.getItem('ogadriver_hirer_prefs');
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {}
    }
  };

  const handleTogglePref = async (key) => {
    const newVal = !preferences[key];
    const newPrefs = { ...preferences, [key]: newVal };
    setPreferences(newPrefs);
    localStorage.setItem('ogadriver_hirer_prefs', JSON.stringify(newPrefs));
    try {
      await api.put('/hirer/preferences', newPrefs);
    } catch {}
  };

  // 1. Top Up Action
  const handleTopUpSubmit = async (e) => {
    e?.preventDefault();
    if (!topUpAmount || parseFloat(topUpAmount) < 100) {
      alert("Please enter a valid amount (minimum \u20A6100).");
      return;
    }
    setTopUpLoading(true);
    try {
      const res = await api.post('/wallet/topup', { amount: parseFloat(topUpAmount) });
      if (res.data?.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        alert(res.data?.message || 'Top-up initiated successfully!');
        setShowTopUpModal(false);
        fetchWallet();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to initialize payment.');
    } finally {
      setTopUpLoading(false);
    }
  };

  // 2. Transfer / Gift Funds
  const handleTransferSubmit = async (e) => {
    e?.preventDefault();
    if (!transferForm.recipient || !transferForm.amount) {
      alert("Please enter recipient email/phone and amount.");
      return;
    }
    setTransferLoading(true);
    try {
      await api.post('/wallet/transfer', {
        recipient_identifier: transferForm.recipient,
        amount: parseFloat(transferForm.amount),
        note: transferForm.note || 'Wallet transfer'
      });
      alert(`Successfully sent \u20A6${Number(transferForm.amount).toLocaleString()} to ${transferForm.recipient}!`);
      setShowTransferModal(false);
      setTransferForm({ recipient: '', amount: '', note: '' });
      fetchWallet();
    } catch (e) {
      alert(e.response?.data?.message || 'Transfer failed. Please check recipient identifier.');
    } finally {
      setTransferLoading(false);
    }
  };

  // 3. Edit Profile
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/user/profile', profileForm);
      alert('Profile updated successfully!');
      setShowEditProfileModal(false);
      fetchProfile();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // 4. Fetch My Bookings
  const handleOpenBookings = async () => {
    setShowBookingsModal(true);
    setLoadingBookings(true);
    try {
      const res = await api.get('/my-bookings').catch(() => api.get('/rides/history'));
      const list = safeArray(res.data);
      setMyBookings(list);
    } catch {
      setMyBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // 5. Fetch My Job Posts
  const handleOpenJobs = async () => {
    setShowJobsModal(true);
    setLoadingJobs(true);
    try {
      const res = await api.get('/jobs');
      const list = safeArray(res.data);
      setMyJobs(list);
    } catch {
      setMyJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  // 6. Fetch Contracts
  const handleOpenContracts = async () => {
    setShowContractsModal(true);
    setLoadingContracts(true);
    try {
      const res = await api.get('/bookings?booking_mode=employment').catch(() => api.get('/my-bookings'));
      const list = safeArray(res.data);
      setMyContracts(list);
    } catch {
      setMyContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  };

  // 7. Saved Places Add/Edit/Delete
  const handleSavePlace = async (e) => {
    e?.preventDefault();
    if (!placeForm.name || !placeForm.address) return;
    
    if (editingPlace) {
      const updated = savedPlaces.map(p => p.id === editingPlace.id ? { ...p, ...placeForm } : p);
      setSavedPlaces(updated);
      localStorage.setItem('ogadriver_saved_places', JSON.stringify(updated));
      try {
        await api.put(`/hirer/saved-places/${editingPlace.id}`, placeForm).catch(() => {});
      } catch {}
    } else {
      const newPlace = {
        id: String(Date.now()),
        name: placeForm.name,
        address: placeForm.address,
        icon: placeForm.icon || 'MapPin'
      };
      const updated = [newPlace, ...savedPlaces];
      setSavedPlaces(updated);
      localStorage.setItem('ogadriver_saved_places', JSON.stringify(updated));
      try {
        await api.post('/hirer/saved-places', placeForm).catch(() => {});
      } catch {}
    }

    setShowPlaceModal(false);
    setEditingPlace(null);
    setPlaceForm({ name: '', address: '', icon: 'MapPin' });
  };

  const handleDeletePlace = (id) => {
    if (!window.confirm("Delete this saved place?")) return;
    const updated = savedPlaces.filter(p => p.id !== id);
    setSavedPlaces(updated);
    localStorage.setItem('ogadriver_saved_places', JSON.stringify(updated));
    try {
      api.delete(`/hirer/saved-places/${id}`).catch(() => {});
    } catch {}
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isComplete = profile?.name && profile?.phone;

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto">
      {/* â”€â”€ 1. USER PROFILE CARD â”€â”€ */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0f172a] border-2 border-[#1cd188] text-[#1cd188] font-black flex items-center justify-center text-2xl shrink-0 shadow-md overflow-hidden">
            {profile?.avatar ? (
              <img src={profile.avatar.startsWith('http') ? profile.avatar : `https://ogadriver.ng${profile.avatar.startsWith('/') ? '' : '/'}${profile.avatar}`} alt={profile.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              profile?.name?.charAt(0).toUpperCase() || <User />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white truncate">{profile?.name || 'Hirer Account'}</h2>
            </div>
            <p className="text-xs text-slate-400 truncate">{profile?.email || 'hirer@ogadriver.ng'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{profile?.phone || 'No phone set'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs">
          <div>
            {isComplete ? (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Profile Active
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-500 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/30">
                âš  Incomplete Profile
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowEditProfileModal(true)}
            className="text-xs text-slate-400 font-bold flex items-center justify-center bg-[#0f172a] border border-slate-700 w-8 h-8 rounded-full hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* â”€â”€ 2. WALLET BALANCE CARD â”€â”€ */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
            <Wallet className="w-4 h-4 text-[#1cd188]" /> Available Balance
          </span>
          <button 
            onClick={() => setShowWalletModal(true)}
            className="text-[11px] text-[#1cd188] font-bold flex items-center gap-0.5"
          >
            History <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="mb-4 break-words text-2xl font-black tabular-nums text-white sm:text-3xl" aria-label={`Available balance: ${Number(walletBal).toLocaleString()} Nigerian naira`}>
          {"\u20A6"}{Number(walletBal).toLocaleString()}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button 
            onClick={() => setShowTopUpModal(true)}
            className="bg-[#1cd188] text-[#0f172a] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <ArrowDownLeft className="w-4 h-4" /> Top Up Wallet
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="bg-[#0f172a] border border-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <ArrowUpRight className="w-4 h-4 text-[#1cd188]" /> Send Funds
          </button>
        </div>
      </div>

      {/* â”€â”€ 3. QUICK ACTIONS GRID (Fully Functional) â”€â”€ */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 pl-1">
          Hirer Portal Services
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'bookings', icon: Briefcase, label: 'My Bookings', action: handleOpenBookings },
            { id: 'jobs', icon: FileText, label: 'Job Posts', action: handleOpenJobs },
            { id: 'contracts', icon: ShieldCheck, label: 'Contracts', action: handleOpenContracts },
            { id: 'places', icon: MapPin, label: 'Saved Places', action: () => document.getElementById('places-section')?.scrollIntoView({ behavior: 'smooth' }) },
            { id: 'wallet', icon: Wallet, label: 'Statement', action: () => setShowWalletModal(true) },
            { id: 'support', icon: Phone, label: '24/7 Support', action: () => setShowSupportModal(true) },
          ].map(link => {
            const Icon = link.icon;
            return (
              <button 
                key={link.id}
                onClick={link.action}
                className="bg-[#1e293b] border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 text-center active:scale-95 transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center border border-slate-800">
                  <Icon className="w-5 h-5 text-[#1cd188]" />
                </div>
                <span className="text-xs font-bold text-slate-300">{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* â”€â”€ 4. SOS EMERGENCY BUTTON (Universal Safety Integration) â”€â”€ */}
      <button 
        onClick={() => setShowSosModal(true)}
        className="w-full bg-red-600/20 border-2 border-red-500/80 text-red-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.25)] active:scale-95 transition-transform"
      ><AlertTriangle className="w-5 h-5 animate-bounce" /> SOS EMERGENCY ASSISTANCE
      </button>

      {/* â”€â”€ 5. SAVED PLACES SECTION â”€â”€ */}
      <button 
        onClick={() => setShowSavedPlacesDrawer(true)}
        className="w-full bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between active:scale-95 transition-all text-left"
      >
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-[#1cd188]" /> Saved Places</h3>
          <p className="text-slate-400 text-xs mt-1">Manage your home, office, and frequent destinations</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </button>

      {/* â”€â”€ 6. RIDE PREFERENCES TOGGLES â”€â”€ */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-sm">
        <h3 className="text-base font-black text-white">Ride Preferences</h3>
        
        {[
          { key: 'ac_preference', label: 'Air Conditioning Preferred', desc: 'Driver keeps AC turned on during trips' },
          { key: 'quiet_ride', label: 'Quiet Ride (No chatting)', desc: 'Chauffeur maintains silent executive cabin' },
          { key: 'allow_pets', label: 'Pet Friendly', desc: 'Permits small pets in vehicle' },
          { key: 'female_driver_only', label: 'Female Driver Only', desc: 'Prioritize verified female chauffeurs' },
            { key: 'corporate_account', label: 'Corporate / Business Account', desc: 'Bill rides directly to your registered company' }
        ].map(pref => (
          <div key={pref.key} className="flex items-center justify-between bg-[#0f172a] p-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">{pref.label}</span>
              <span className="text-[10px] text-slate-400">{pref.desc}</span>
            </div>
            <button 
              type="button"
              onClick={() => handleTogglePref(pref.key)}
              className={`w-11 h-6 rounded-full p-1 transition-colors flex-shrink-0 ${preferences[pref.key] ? 'bg-[#1cd188]' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferences[pref.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* â”€â”€ 7. LOGOUT â”€â”€ */}
      <button 
        onClick={handleLogout}
        className="w-full bg-[#1e293b] hover:bg-red-500/10 border border-slate-800 text-red-400 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs mb-8"
      >
        <LogOut className="w-4 h-4" /> Logout
      </button>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• MODALS â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}

      
      {/* MODAL: APPEARANCE */}
      {showAppearanceModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowAppearanceModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 relative shadow-2xl space-y-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">Appearance</h3>
              <button onClick={() => setShowAppearanceModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <button className="w-full p-4 rounded-2xl flex items-center justify-between border bg-[#1cd188]/10 border-[#1cd188] text-[#1cd188]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1cd188]/20 flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                  <span className="font-bold text-sm">Dark Mode (Optimized)</span>
                </div>
                <CheckCircle2 className="w-5 h-5" />
              </button>
              <button disabled className="w-full p-4 rounded-2xl flex items-center justify-between border bg-[#1e293b] border-slate-800 text-slate-500 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center"><Sun className="w-4 h-4 text-slate-500" /></div>
                  <span className="font-bold text-sm">Light Mode</span>
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider bg-slate-800 px-2 py-1 rounded-full">Coming Soon</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LANGUAGE */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowLanguageModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 relative shadow-2xl space-y-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">App Language</h3>
              <button onClick={() => setShowLanguageModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {['English (NG)', 'Pidgin', 'Hausa', 'Igbo', 'Yoruba', 'Français'].map(lang => (
                <button 
                  key={lang}
                  onClick={() => {
                    const newPrefs = { ...preferences, app_language: lang };
                    setPreferences(newPrefs);
                    try { api.post('/hirer/preferences', newPrefs); } catch(e) {}
                    setShowLanguageModal(false);
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between border ${preferences?.app_language === lang || (!preferences?.app_language && lang === 'English (NG)') ? 'bg-[#1cd188]/10 border-[#1cd188] text-[#1cd188]' : 'bg-[#1e293b] border-slate-800 text-slate-300'}`}
                >
                  <span className="font-bold text-sm">{lang}</span>
                  {(preferences?.app_language === lang || (!preferences?.app_language && lang === 'English (NG)')) && <CheckCircle2 className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOP UP WALLET */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowTopUpModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Top Up Wallet</h3>
              <button onClick={() => setShowTopUpModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Enter Amount ({"\u20A6"})</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1cd188] font-bold text-sm">{"\u20A6"}</span>
                  <input 
                    type="number"
                    min="100"
                    max="5000000"
                    required
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-[#1e293b] border border-slate-800 rounded-xl text-white font-bold text-base focus:outline-none focus:border-[#1cd188]"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  {[2000, 5000, 10000, 20000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(String(amt))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        topUpAmount === String(amt)
                          ? 'bg-[#1cd188] text-[#0f172a] border-[#1cd188]'
                          : 'bg-[#1e293b] text-slate-400 border-slate-800'
                      }`}
                    >
                      {"\u20A6"}{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1e293b] text-xs text-slate-400 border border-slate-800">
                Direct instant credit via Paystack / Card / USSD / Bank Transfer.
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">Secured by Paystack</span>
                </div>
                <button 
                  type="submit" 
                  disabled={topUpLoading}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg gap-2"
                >
                  {topUpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with Paystack'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND / GIFT FUNDS */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowTransferModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Send / Gift Funds</h3>
              <button onClick={() => setShowTransferModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleTransferSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Recipient Phone or Email</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 08012345678 or driver@email.com"
                  value={transferForm.recipient}
                  onChange={e => setTransferForm({...transferForm, recipient: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#1cd188]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount ({"\u20A6"})</label>
                <input 
                  type="number"
                  min="100"
                  required
                  placeholder="Amount"
                  value={transferForm.amount}
                  onChange={e => setTransferForm({...transferForm, amount: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-[#1cd188]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Note (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Driver tip / trip allowance"
                  value={transferForm.note}
                  onChange={e => setTransferForm({...transferForm, note: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#1cd188]"
                />
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">Secured by Paystack</span>
                </div>
                <button 
                  type="submit" 
                  disabled={topUpLoading}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg gap-2"
                >
                  {topUpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with Paystack'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SAVED PLACES DRAWER */}
      {showSavedPlacesDrawer && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowSavedPlacesDrawer(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 max-h-[85vh] overflow-y-auto relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Saved Places</h3>
                <p className="text-slate-400 text-xs">Used for 1-tap booking</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setEditingPlace(null);
                    setPlaceForm({ name: '', address: '', icon: 'MapPin' });
                    setShowPlaceModal(true);
                  }} 
                  className="text-[#0f172a] bg-[#1cd188] flex items-center justify-center w-8 h-8 rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={() => setShowSavedPlacesDrawer(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 mt-4">
              {savedPlaces.length > 0 ? savedPlaces.map(place => (
                <div key={place.id} className="flex items-center justify-between p-3.5 bg-[#1e293b] rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                      {(place.icon === 'Briefcase' || place.icon === 'Office' || place.name === 'Office') ? <Briefcase className="w-5 h-5 text-blue-400" /> : <MapPin className="w-5 h-5 text-brandMint" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate">{place.name}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{place.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button 
                      onClick={() => {
                        setEditingPlace(place);
                        setPlaceForm({ name: place.name, address: place.address, icon: place.icon || 'MapPin' });
                        setShowPlaceModal(true);
                      }}
                      className="bg-[#0f172a] border border-slate-700 text-slate-300 w-8 h-8 rounded-full flex items-center justify-center active:scale-95"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeletePlace(place.id)} 
                      className="bg-red-500/10 border border-red-500/20 text-red-400 w-8 h-8 rounded-full flex items-center justify-center active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-xs text-slate-500 py-8">No saved locations yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROFILE */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowEditProfileModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Edit Hirer Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input 
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#1cd188]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                <input 
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#1cd188]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company / Organization (Optional)</label>
                <input 
                  type="text"
                  value={profileForm.company_name}
                  onChange={e => setProfileForm({...profileForm, company_name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#1cd188]"
                />
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">Secured by Paystack</span>
                </div>
                <button 
                  type="submit" 
                  disabled={topUpLoading}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg gap-2"
                >
                  {topUpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with Paystack'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MY BOOKINGS DRAWER */}
      {showBookingsModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowBookingsModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 max-h-[85vh] overflow-y-auto relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">My Bookings</h3>
                <p className="text-slate-400 text-xs">All trip requests, hires, and rides</p>
              </div>
              <button onClick={() => setShowBookingsModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingBookings ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin" />
              </div>
            ) : myBookings.length > 0 ? (
              <div className="space-y-2.5">
                {myBookings.map(b => (
                  <div key={b.id} className="bg-[#1e293b] p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{b.title || 'Trip Booking'}</span>
                      <span className="bg-[#1cd188]/20 text-[#1cd188] font-bold px-2 py-0.5 rounded-full uppercase text-[10px]">
                        {b.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-slate-400 truncate">{b.pickup_location || b.pickup} â†’ {b.dropoff_location || b.dropoff}</p>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>{b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recent'}</span>
                      <span className="text-[#1cd188] font-bold">{"\u20A6"}{Number(b.agreed_rate || b.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active bookings yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MY JOB POSTS DRAWER */}
      {showJobsModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowJobsModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 max-h-[85vh] overflow-y-auto relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">My Job Posts</h3>
                <p className="text-slate-400 text-xs">Positions you published to the driver market</p>
              </div>
              <button onClick={() => setShowJobsModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingJobs ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin" />
              </div>
            ) : myJobs.length > 0 ? (
              <div className="space-y-2.5">
                {myJobs.map(job => (
                  <div key={job.id} className="bg-[#1e293b] p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{job.title}</span>
                      <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase text-[10px]">
                        {job.status || 'Open'}
                      </span>
                    </div>
                    <p className="text-slate-400">{job.location || 'Lagos'}</p>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>Salary: {"\u20A6"}{Number(job.amount || job.monthly_rate || 0).toLocaleString()}</span>
                      <span className="text-[#1cd188] font-bold">{job.applications_count || 0} Applicants</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                You haven't posted any job vacancies yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONTRACTS DRAWER */}
      {showContractsModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowContractsModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 max-h-[85vh] overflow-y-auto relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Employment Contracts</h3>
                <p className="text-slate-400 text-xs">Active and signed driver agreements</p>
              </div>
              <button onClick={() => setShowContractsModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingContracts ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin" />
              </div>
            ) : myContracts.length > 0 ? (
              <div className="space-y-2.5">
                {myContracts.map(c => (
                  <div key={c.id} className="bg-[#1e293b] p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{c.title || 'Driver Contract'}</span>
                      <span className="bg-[#1cd188]/20 text-[#1cd188] font-bold px-2 py-0.5 rounded-full uppercase text-[10px]">
                        {c.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-slate-400">Driver: {c.driver?.user?.name || c.driver_name || 'Assigned Driver'}</p>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>Terms: {c.contract_type || 'Monthly'}</span>
                      <span className="text-[#1cd188] font-bold">{"\u20A6"}{Number(c.agreed_rate || c.proposed_salary || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active driver contracts. Hire a driver from the Hire tab!
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: WALLET TRANSACTIONS STATEMENT */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowWalletModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 max-h-[85vh] overflow-y-auto relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Wallet Statement</h3>
                <p className="text-slate-400 text-xs">Recent transaction records</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#1e293b] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Balance:</span>
              <span className="text-xl font-black text-[#1cd188]">{"\u20A6"}{Number(walletBal).toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              {walletTransactions.length > 0 ? (
                walletTransactions.map(tx => (
                  <div key={tx.id} className="bg-[#1e293b] p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-white font-bold truncate">{tx.description || tx.purpose || 'Transaction'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Recent'}</p>
                    </div>
                    <span className={`font-black ${tx.type === 'credit' ? 'text-[#1cd188]' : 'text-red-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{"\u20A6"}{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-xs text-slate-500">No transaction records found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 24/7 SUPPORT SHEET */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowSupportModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">24/7 Concierge Support</h3>
                <p className="text-slate-400 text-xs">Direct priority assistance for hirers</p>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <a 
                href="tel:08000000000"
                className="w-full bg-[#1e293b] hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1cd188]/20 flex items-center justify-center text-[#1cd188]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Direct Phone Hotline</p>
                  <p className="text-slate-400 text-xs">Call toll-free dispatch center</p>
                </div>
              </a>

              <a 
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#1e293b] hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">WhatsApp Priority Chat</p>
                  <p className="text-slate-400 text-xs">Chat with operations duty officer</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SAVED PLACE */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6" onClick={() => setShowPlaceModal(false)}>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 relative shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">
                {editingPlace ? 'Edit Saved Place' : 'Add Saved Place'}
              </h3>
              <button onClick={() => setShowPlaceModal(false)} className="p-2 bg-[#1e293b] rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Place Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Home, Office, Gym, Lekki Gate" 
                  value={placeForm.name} 
                  onChange={e => setPlaceForm({...placeForm, name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#1cd188]"
                />
              </div>

              {/* Icon presets */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Place Icon</label>
                <div className="flex gap-2">
                  {['Home', 'Briefcase', 'MapPin', 'Users', 'Star'].map(icon => (
                    <button
                        key={icon}
                        type="button"
                        onClick={() => setPlaceForm({ ...placeForm, icon })}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-colors ${
                          placeForm.icon === icon ? 'bg-[#1cd188]/20 border-[#1cd188] text-[#1cd188]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {icon === 'Home' && <MapPin className="w-5 h-5" />}
                        {icon === 'Briefcase' && <Briefcase className="w-5 h-5" />}
                        {icon === 'MapPin' && <MapPin className="w-5 h-5" />}
                        {icon === 'Users' && <Users className="w-5 h-5" />}
                        {icon === 'Star' && <Star className="w-5 h-5" />}
                      </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Street Address</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    required
                    placeholder="Full address (Type or pick on map)" 
                    value={placeForm.address} 
                    onChange={e => setPlaceForm({...placeForm, address: e.target.value})}
                    className="w-full pl-3.5 pr-16 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#1cd188]"
                  />
                  <button
                    type="button"
                    onClick={() => setMapPicker({ isOpen: true, address: placeForm.address, lat: placeForm.latitude || null, lng: placeForm.longitude || null })}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-[#1cd188] bg-[#1cd188]/10 hover:bg-[#1cd188]/20 rounded-lg active:scale-95 transition-all flex items-center gap-1 text-[10px] font-bold"
                    title="Pick on Interactive Map"
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Map</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-bold">Secured by Paystack</span>
                </div>
                <button 
                  type="submit" 
                  disabled={topUpLoading}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg gap-2"
                >
                  {topUpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay with Paystack'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ 8. UNIVERSAL EMERGENCY SOS MODAL â”€â”€ */}
      <UniversalSosModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        userProfile={profile || { role: 'hirer' }}
      />

      {/* â”€â”€ 9. MAP LOCATION PICKER MODAL â”€â”€ */}
      <MapLocationPickerModal
        isOpen={mapPicker.isOpen}
        onClose={() => setMapPicker(prev => ({ ...prev, isOpen: false }))}
        initialAddress={mapPicker.address}
        initialLat={mapPicker.lat}
        initialLng={mapPicker.lng}
        onConfirm={({ address, lat, lng }) => {
          setPlaceForm(prev => ({
            ...prev,
            address,
            latitude: lat,
            longitude: lng
          }));
          setMapPicker({ isOpen: false, address: '', lat: null, lng: null });
        }}
      />
    </div>
  );
}
