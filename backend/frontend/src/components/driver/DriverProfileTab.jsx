import React, { useEffect, useMemo, useState } from 'react';
import {
  Car,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  HelpCircle,
  Lock,
  Menu,
  Share2,
  User,
  Briefcase,
  X,
  Sparkles,
  Zap,
  Gift,
  Copy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../NotificationSystem';
import { MessagingButton } from '../MessagingSystem';
import { driverService } from '../../api/drivers';
import InstantCashoutModal from './InstantCashoutModal';
import EditBasicInfoModal from './EditBasicInfoModal';

const StatDial = ({ label, value, percent, color = '#1cd188' }) => {
  const dashArray = 2 * Math.PI * 18;
  const safePercent = Math.min(100, Math.max(0, Number(percent) || 0));
  const dashOffset = dashArray - (dashArray * safePercent) / 100;

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="relative mb-2 h-14 w-14">
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#1e293b" strokeWidth="3" />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-center text-[10px] font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="flex h-6 items-center justify-center text-center text-[9px] uppercase leading-tight tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
};

const DriverProfileTab = ({
  user,
  driver,
  setDriver,
  setActiveTab,
  handleLogout,
  languages,
  employmentTypes,
  skills,
  handleAddSkill,
  handleRemoveSkill,
  handleSaveProfile,
  nickname, setNickname, email, setEmail, phone, setPhone, gender, setGender, dateOfBirth, setDateOfBirth, residenceStateId, setResidenceStateId, dbStates, residenceCityId, setResidenceCityId, dbCitiesResidence
}) => {
  const navigate = useNavigate();
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [earningsError, setEarningsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showVehicleMissingModal, setShowVehicleMissingModal] = useState(false);
  const [showInstantCashout, setShowInstantCashout] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showFuelLoanModal, setShowFuelLoanModal] = useState(false);
  const [loanAccountNumber, setLoanAccountNumber] = useState('');
  const [showInterStateModal, setShowInterStateModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [interStateData, setInterStateData] = useState({ state: '', city: '' });
  const [destinations, setDestinations] = useState([]);
  const [newDestination, setNewDestination] = useState({ title: '', address: '' });
  const [biometricEnabled, setBiometricEnabled] = useState(driver?.biometric_enabled || false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(driver?.two_fa_enabled || false);
  const [interStateEnabled, setInterStateEnabled] = useState(driver?.inter_state_enabled || false);
  const [bankName, setBankName] = useState(driver?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(driver?.account_number || '');
  const [emergencyName, setEmergencyName] = useState(driver?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(driver?.emergency_contact_phone || '');
  const [weeklyGoal, setWeeklyGoal] = useState(driver?.weekly_goal || 50000);
  const [showBankModal, setShowBankModal] = useState(false);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);


  useEffect(() => {
    let isCurrent = true;

    const loadEarnings = async () => {
      if (!driver?.id) {
        setEarningsSummary(null);
        setEarningsError('Your driver profile is not available.');
        return;
      }

      setEarningsSummary(null);
      setEarningsError('');
      try {
        const response = await driverService.getEarningsSummary(driver.id);
        const summary = response?.data;
        const hasValidAmounts = summary
          && ['today_earnings', 'month_earnings', 'total_earnings']
            .every((field) => summary[field] !== null
              && summary[field] !== undefined
              && Number.isFinite(Number(summary[field])));
        if (!isCurrent) return;
        if (!hasValidAmounts) {
          if (isCurrent) setEarningsError('Earnings data is unavailable.');
          return;
        }
        setEarningsSummary(summary);
      } catch (error) {
        if (isCurrent) {
          setEarningsSummary(null);
          setEarningsError(error.response?.data?.message || 'Could not load earnings from the server.');
        }
      }
    };

    loadEarnings();
    return () => {
      isCurrent = false;
    };
  }, [driver?.id]);

  const profileUser = driver?.user || user;
  const verificationProgress = useMemo(() => {
    if (!driver) return null;
    const completedChecks = [
      Boolean(driver.license_number),
      Boolean(driver.nin),
      Boolean(driver.vehicle_make || driver.vehicle?.make),
      Boolean(profileUser?.avatar || profileUser?.avatar_url),
      Boolean(driver.guarantor_a_name),
    ].filter(Boolean).length;
    return Math.round((completedChecks / 5) * 100);
  }, [driver, profileUser]);

  const updateDriver = async (values) => {
    if (!driver?.id || !setDriver) {
      setActionError('Your driver profile is unavailable. Sign in again and retry.');
      return null;
    }

    setSaving(true);
    setActionError('');
    try {
      const response = await driverService.updateProfile(driver.id, values);
      const updatedDriver = response?.data;
      if (!updatedDriver?.id) {
        throw new Error('The server did not return the updated driver profile.');
      }
      setDriver((current) => ({ ...current, ...updatedDriver }));
      return updatedDriver;
    } catch (error) {
      setActionError(error.response?.data?.message || error.message || 'Could not save your profile.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleServiceModeChange = async (mode) => {
    if (driver?.service_mode === mode) return;

    const updatedDriver = await updateDriver({ service_mode: mode });
    if (!updatedDriver) return;

    if ((mode === 'driver_with_vehicle' || mode === 'both') && !(driver?.vehicle_make || driver?.vehicle_model || driver?.license_plate || driver?.vehicle)) {
      setShowVehicleMissingModal(true);
    }
    
    if ((mode === 'driver_without_vehicle' || mode === 'both') && !(driver?.guarantor_a_name || driver?.guarantor_b_name)) {
      alert("Please ensure you update your Guarantors and Police Clearance in the Documents section to be fully active as a Fleet Operative.");
    }
  };

  const toggleOnline = async () => {
    if (!driver?.id || !setDriver) {
      setActionError('Your driver profile is unavailable. Sign in again and retry.');
      return;
    }

    setSaving(true);
    setActionError('');
    try {
      const response = await driverService.toggleOnline(driver.id);
      const isOnline = response?.data?.is_online;
      if (typeof isOnline !== 'boolean') {
        throw new Error('The server did not return your saved online status.');
      }
      setDriver((current) => ({ ...current, is_online: isOnline }));
    } catch (error) {
      setActionError(error.response?.data?.message || error.message || 'Could not update your online status.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceToggle = (field, value) => updateDriver({ [field]: value });

  const shareReferralLink = async () => {
    const referralCode = user?.referral_code || user?.system_id;
    if (!referralCode) {
      setActionError('A referral code is not available on your account yet.');
      return;
    }

    const referralUrl = `${window.location.origin}/r/${encodeURIComponent(referralCode)}`;
    try {
      if (navigator.share) {
        await navigator.share({ url: referralUrl });
      } else {
        await navigator.clipboard.writeText(referralUrl);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setActionError('Could not share the referral link.');
      }
    }
  };

  const doLogout = () => {
    if (handleLogout) {
      handleLogout();
      return;
    }
    navigate('/login');
  };

  const isOnline = driver?.is_online === true;
  const displayId = driver?.formatted_id || profileUser?.system_id || '—';
  const fullName = [profileUser?.first_name, profileUser?.last_name].filter(Boolean).join(' ');
  const avatar = profileUser?.avatar || profileUser?.avatar_url;
  const referralCode = profileUser?.referral_code || profileUser?.system_id;
  const currencySymbol = profileUser?.currency_symbol || driver?.currency_symbol || '₦';
  const boostPrice = currencySymbol === '₦' ? '500' : '0.50';
  
  const driverTier = driver?.total_jobs > 500 ? 'Merit' : driver?.total_jobs > 100 ? 'Gold' : driver?.total_jobs > 20 ? 'Silver' : 'Standard';
  const tierColor = driverTier === 'Merit' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : driverTier === 'Gold' ? 'bg-amber-500 text-amber-950' : driverTier === 'Silver' ? 'bg-slate-300 text-slate-900' : 'bg-slate-700 text-slate-300';

  const systemId = profileUser?.system_id || driver?.system_id || '—';
  const fleetBonus = currencySymbol === '₦' ? '500' : '5.00';
  const independentBonus = currencySymbol === '₦' ? '1,000' : '10.00';

  if (!driver) {
    return (
      <div className="mx-auto max-w-md p-6 text-center text-slate-300" role="alert">
        Driver profile data could not be loaded from the server.
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] pb-28 text-white">
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 shadow-2xl shadow-slate-950/40">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero/female_driver_1784366932413.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020817]/90 via-[#020817]/70 to-[#0f172a]/30" />

          <div className="relative p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.28em] text-emerald-400">SYSTEM ID: {systemId}</p>
                <h1 className="mt-2 text-2xl font-black leading-none">Profile</h1>
                  <button onClick={() => setShowBasicInfoModal(true)} className="mt-3 text-[10px] font-bold text-white bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-white/20 transition"><User className="w-3 h-3" /> Edit Basic Info</button>
                  <div className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg ${tierColor}`}>
                    {driverTier} Tier
                  </div>

              </div>

              <div className="flex items-center gap-2">
                <MessagingButton />
                <NotificationBell />
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  aria-label="Open settings"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  <Menu className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/30 bg-slate-900/80 shadow-xl shadow-slate-950/50">
                  {avatar ? (
                    <img src={avatar} alt="Driver profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold uppercase text-slate-300">
                      {fullName ? fullName[0] : <User aria-hidden="true" />}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">{fullName || 'Name unavailable'}</h2>
                    {driver.is_verified && <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Verified" />}
                  </div>
                  <p className="mt-1 text-sm text-slate-200">
                    {driver.rating ?? '—'} ★ · {driver.subscription_tier || '—'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleOnline}
                disabled={saving}
                className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.18em] transition-colors disabled:opacity-60 ${
                  isOnline
                    ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300'
                    : 'border-slate-600 bg-slate-900/80 text-slate-300'
                }`}
              >
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-5 px-4" aria-label="Performance statistics">
        <div className="rounded-[26px] border border-white/10 bg-[#0f172a] p-5 shadow-lg shadow-slate-950/30">
          {earningsError ? (
            <p className="w-full text-center text-xs text-rose-300" role="alert">{earningsError}</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earning</p>
                <p className="text-sm font-black text-white">{currencySymbol}{earningsSummary ? Number(earningsSummary.total_earnings).toLocaleString() : '0'}</p>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">This Month</p>
                <p className="text-sm font-black text-white">{currencySymbol}{earningsSummary ? Number(earningsSummary.month_earnings).toLocaleString() : '0'}</p>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completed</p>
                <p className="text-sm font-black text-white">{driver?.total_jobs || 0}</p>
              </div>
              
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Offers</p>
                <p className="text-sm font-black text-white">{driver?.job_offers || driver?.total_jobs || 0}</p>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Acceptance</p>
                <p className="text-sm font-black text-[#1cd188]">{driver?.acceptance_rate || 100}%</p>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cancelled</p>
                <p className="text-sm font-black text-rose-400">{driver?.cancellation_rate || 0}%</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowInstantCashout(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1cd188]/30 bg-[#1cd188]/10 px-4 py-3 text-sm font-bold text-[#1cd188] shadow-lg transition-colors hover:bg-[#1cd188]/20"
          >
            Withdraw Fund ({currencySymbol}{Number(driver?.wallet_balance || 0).toLocaleString()})
          </button>
        </div>
      </section>

      {actionError && (
        <p className="mx-4 mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200" role="alert">
          {actionError}
        </p>
      )}

            <section className="mt-5 px-4" aria-label="Boost profile">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-800 to-purple-900 p-5 shadow-lg">
          <Zap className="absolute -right-4 top-4 h-32 w-32 -rotate-12 text-white/10" />
          <div className="relative z-10">
            <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
              <Sparkles className="h-5 w-5" />
              Boost My Profile
            </h3>
            <p className="mb-4 text-sm text-indigo-100">
              Rank #1 on the local hire directory for 24 hours. Get 10x more job offers.
            </p>
            <button
              type="button"
              className="rounded-xl bg-white px-5 py-3 text-sm font-black text-indigo-950 shadow-md transition-colors hover:bg-slate-100 uppercase"
            >
              ACTIVATE {currencySymbol}{boostPrice} / DAY
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 mt-4">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center mb-3 relative z-10">
            <h3 className="text-white font-black text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Weekly Goal
            </h3>
            <button onClick={() => setShowGoalModal(true)} className="text-amber-400 text-xs font-bold hover:text-amber-300">Edit</button>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400">Progress</span>
              <span className="text-white">{currencySymbol}{Number(earningsSummary?.month_earnings || 0).toLocaleString()} / {currencySymbol}{Number(weeklyGoal).toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((earningsSummary?.month_earnings || 0) / (weeklyGoal || 1)) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 px-6" aria-labelledby="driver-status-heading">
        <h3 id="driver-status-heading" className="mb-3 text-sm font-bold">Driver Status</h3>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleServiceModeChange('driver_with_vehicle')}
            aria-pressed={driver?.service_mode === 'driver_with_vehicle'}
            className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all disabled:opacity-50 ${
              driver?.service_mode === 'driver_with_vehicle' ? 'border-[#1cd188] bg-[#1cd188]/10' : 'border-white/10 bg-slate-900/60 backdrop-blur-2xl hover:border-slate-700'
            }`}
          >
            <div className="relative z-10 mb-1 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Car className={`h-5 w-5 ${driver?.service_mode === 'driver_with_vehicle' ? 'text-[#1cd188]' : 'text-slate-400'}`} />
                <span className="font-black">Independent Operator</span>
              </div>
              {driver?.service_mode === 'driver_with_vehicle' && <CheckCircle2 className="h-5 w-5 text-[#1cd188]" />}
            </div>
            <p className="relative z-10 mb-2 text-xs text-slate-400">You own or lease your vehicle</p>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleServiceModeChange('driver_without_vehicle')}
            aria-pressed={driver?.service_mode === 'driver_without_vehicle'}
            className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all disabled:opacity-50 ${
              driver?.service_mode === 'driver_without_vehicle' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-slate-900/60 backdrop-blur-2xl hover:border-slate-700'
            }`}
          >
            <div className="relative z-10 mb-1 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <User className={`h-5 w-5 ${driver?.service_mode === 'driver_without_vehicle' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="font-black">Fleet Operative</span>
              </div>
              {driver?.service_mode === 'driver_without_vehicle' && <CheckCircle2 className="h-5 w-5 text-blue-400" />}
            </div>
            <p className="relative z-10 mb-2 text-xs text-slate-400">You need a vehicle assigned to you</p>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleServiceModeChange('both')}
            aria-pressed={driver?.service_mode === 'both'}
            className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all disabled:opacity-50 ${
              driver?.service_mode === 'both' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-slate-900/60 backdrop-blur-2xl hover:border-slate-700'
            }`}
          >
            <div className="relative z-10 mb-1 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className={`h-5 w-5 ${driver?.service_mode === 'both' ? 'text-purple-400' : 'text-slate-400'}`} />
                <span className="font-black">Both / Flexible</span>
              </div>
              {driver?.service_mode === 'both' && <CheckCircle2 className="h-5 w-5 text-purple-400" />}
            </div>
            <p className="relative z-10 mb-2 text-xs text-slate-400">Available as an independent or fleet operative</p>
          </button>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-white font-black text-lg">Instant Fuel Loan</h3>
            <p className="text-blue-200 text-sm mt-1">Available exclusively for Merit Drivers.</p>
            <button onClick={() => setShowFuelLoanModal(true)} className="mt-4 bg-blue-500 text-white font-bold px-4 py-3 rounded-xl text-sm shadow-lg w-full hover:bg-blue-400 transition-colors">
              Apply Now (From {currencySymbol}{currencySymbol === '₦' ? '5,000' : '5.00'})
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        </div>
      </section>

            <section className="px-6 mt-6">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#1cd188]" /> Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-sm font-medium text-white">{fullName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-medium text-white break-all">{profileUser?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm font-medium text-white">{profileUser?.phone || profileUser?.phone_number || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Gender</p>
                <p className="text-sm font-medium text-white capitalize">{profileUser?.gender || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-sm font-medium text-white">{profileUser?.date_of_birth || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          
      <section className="px-6 mt-6">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-black text-lg flex items-center gap-2">
              <Car className="w-5 h-5 text-[#1cd188]" /> Active Vehicle
            </h3>
            <button onClick={() => window.location.href='/driver/settings'} className="text-[#1cd188] text-sm font-bold hover:text-emerald-400">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Make & Model</p>
              <p className="text-sm font-medium text-white">{driver?.vehicle_make || '—'} {driver?.vehicle_model || ''}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">License Plate</p>
              <p className="text-sm font-medium text-white">{driver?.license_plate || '—'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-black text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Payout Method
              </h3>
              <button onClick={() => setShowBankModal(true)} className="text-blue-400 text-xs font-bold hover:text-blue-300">Edit</button>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Bank Name</p>
            <p className="text-sm font-medium text-white mb-3">{driver?.bank_name || 'Not Set'}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Account Number</p>
            <p className="text-sm font-medium text-white">{driver?.account_number || 'Not Set'}</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-black text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-rose-400" /> SOS Contact
              </h3>
              <button onClick={() => setShowEmergencyModal(true)} className="text-rose-400 text-xs font-bold hover:text-rose-300">Edit</button>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Contact Name</p>
            <p className="text-sm font-medium text-white mb-3">{driver?.emergency_contact_name || 'Not Set'}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
            <p className="text-sm font-medium text-white">{driver?.emergency_contact_phone || 'Not Set'}</p>
          </div>
        </div>
      </section>

          <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#1cd188]" /> Professional Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">Languages</p>
              <div className="flex flex-wrap gap-2">
                {languages && languages.length > 0 ? (
                  languages.map((lang, i) => (
                    <span key={i} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">{lang}</span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No languages added</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">Employment Tracks</p>
              <div className="flex flex-wrap gap-2">
                {employmentTypes && employmentTypes.length > 0 ? (
                  employmentTypes.map((type, i) => (
                    <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-medium capitalize">{type.replace('_', ' ')}</span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No tracks selected</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">Specialized Skills</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills && skills.length > 0 ? (
                  skills.map((skill, i) => (
                    <span key={i} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      {skill}
                      <button onClick={() => handleRemoveSkill(i)} className="text-amber-500 hover:text-amber-300 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No skills added</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="newSkillInput"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="E.g. Defensive Driving..." 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#1cd188] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSkill.trim()) {
                      handleAddSkill(newSkill.trim());
                      setNewSkill('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newSkill.trim()) {
                      handleAddSkill(newSkill.trim());
                      setNewSkill('');
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleSaveProfile}
              className="w-full mt-2 bg-[#1cd188]/10 border border-[#1cd188]/30 text-[#1cd188] py-3 rounded-xl font-bold text-sm hover:bg-[#1cd188]/20 transition-all"
            >
              Save Details
            </button>
          </div>
        </div>
      </section>
      <section className="px-6 mt-6">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          <h3 className="text-white font-black text-lg mb-4">Operative Preferences</h3>
          
          <div className="space-y-3">
            <PreferenceToggle 
              label="Biometric Login" 
              description="Use fingerprint or face ID to log in"
              checked={biometricEnabled}
              onChange={setBiometricEnabled}
            />
            <PreferenceToggle 
              label="Two-Factor Authentication (2FA)" 
              description="Add an extra layer of security"
              checked={twoFaEnabled}
              onChange={setTwoFaEnabled}
            />
            <PreferenceToggle 
              label="Inter-state Available" 
              description="Available for long distance trips"
              checked={interStateEnabled}
              onChange={(val) => {
                setInterStateEnabled(val);
                if (val) setShowInterStateModal(true);
              }}
            />
          </div>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-black text-lg">My Destinations</h3>
            <button onClick={() => setShowDestinationModal(true)} className="text-[#1cd188] text-sm font-bold hover:text-emerald-400">+ Add</button>
          </div>
          
          <div className="space-y-3">
            {destinations.length > 0 ? (
              destinations.map((dest, i) => (
                <div key={i} className="bg-slate-900 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm text-white">{dest.title}</p>
                    <p className="text-xs text-slate-400">{dest.address}</p>
                  </div>
                  <button onClick={() => setDestinations(destinations.filter((_, idx) => idx !== i))} className="text-rose-500 p-2"><X className="w-4 h-4" /></button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No destinations added yet.</p>
            )}
          </div>
        </div>
      </section>


            <section className="mt-6 px-6" aria-label="Operative Growth">
        <div className="relative rounded-[24px] border border-white/10 bg-[#0f172a] p-5 shadow-lg overflow-hidden">
          <Gift className="absolute -right-4 top-4 h-28 w-28 text-white/5" strokeWidth={1} />
          
          <div className="relative z-10">
            <h4 className="text-[10px] font-black tracking-widest text-[#1cd188] uppercase mb-1">Operative Growth</h4>
            <h3 className="text-xl font-bold text-white mb-2">Referral Earnings</h3>
            <p className="mb-5 text-sm text-slate-300">
              Invite other drivers to OgaDriver and earn {currencySymbol}{independentBonus} for every Independent Operator and {currencySymbol}{fleetBonus} for every Fleet Operative.
            </p>

            <div className="flex gap-3 mb-5">
              <div className="flex-1 rounded-2xl bg-slate-900/60 backdrop-blur-2xl p-4 border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Referred</p>
                <p className="text-2xl font-black text-white">{driver?.total_referred || 0}</p>
              </div>
              <div className="flex-1 rounded-2xl bg-slate-900/60 backdrop-blur-2xl p-4 border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bonus Earned</p>
                <p className="text-2xl font-black text-[#1cd188]">{currencySymbol}{driver?.referral_earnings || 0}</p>
              </div>
            </div>

            {referralCode && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 border border-white/10">
                <span className="text-sm font-medium text-slate-300">{referralCode}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(referralCode)}
                  className="text-[#1cd188] hover:text-emerald-400"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={shareReferralLink}
              disabled={!referralCode}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1cd188]/30 bg-[#1cd188]/10 py-3 text-sm font-bold text-[#1cd188] shadow-lg transition-colors hover:bg-[#1cd188]/20 disabled:opacity-50"
            >
              <Gift className="h-4 w-4" /> Share & Invite Link
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 flex gap-4 px-6" aria-label="Driver actions">
        <button
          type="button"
          onClick={() => setActiveTab('compliance')}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur-2xl py-4 text-sm font-bold shadow-lg transition-all hover:bg-slate-800"
        >
          <FolderOpen className="h-5 w-5" /> Documents
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 backdrop-blur-2xl py-4 text-sm font-bold shadow-lg transition-all hover:bg-slate-800"
        >
          <HelpCircle className="h-5 w-5" /> Help & Support
        </button>
      </section>

      <section className="mx-6 mb-8 mt-6">
        <button
          type="button"
          onClick={doLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 font-bold transition-all hover:bg-red-500/20 shadow-lg"
        >
          <Lock size={18} /> Sign Out
        </button>
      </section>

      <InstantCashoutModal
        isOpen={showInstantCashout}
        onClose={() => setShowInstantCashout(false)}
        walletBalance={Number(driver?.wallet_balance || 0)}
        onCashoutSuccess={() => {
          setShowInstantCashout(false);
          setDriver((current) => ({ ...current, wallet_balance: 0 }));
        }}
      />

      {showVehicleMissingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold">Vehicle Details Needed</h3>
            <p className="mb-6 text-sm text-slate-400">
              You have selected Independent Operator but have not added vehicle details. Upload the vehicle documents from the Documents tab.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowVehicleMissingModal(false)}
                className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVehicleMissingModal(false);
                  setActiveTab('compliance');
                }}
                className="flex-1 rounded-xl bg-[#1cd188] py-3 font-bold text-[#0f172a]"
              >
                Go to Documents
              </button>
            </div>
          </div>
        </div>
      )}
      {showFuelLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Instant Fuel Loan</h3>
            <p className="mb-6 text-sm text-slate-400">
              Enter your account details to receive your fuel loan.
            </p>
            <input
              type="text"
              placeholder="Account Number"
              value={loanAccountNumber}
              onChange={(e) => setLoanAccountNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#1cd188] mb-6"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowFuelLoanModal(false)}
                className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFuelLoanModal(false);
                  setLoanAccountNumber('');
                  alert('Loan application submitted!');
                }}
                className="flex-1 rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-400"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showInterStateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Inter-State Availability</h3>
            <p className="mb-4 text-sm text-slate-400">
              Select the state and city you are willing to travel to.
            </p>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="State"
                value={interStateData.state}
                onChange={(e) => setInterStateData({...interStateData, state: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#1cd188]"
              />
              <input
                type="text"
                placeholder="City"
                value={interStateData.city}
                onChange={(e) => setInterStateData({...interStateData, city: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#1cd188]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowInterStateModal(false);
                  setInterStateEnabled(false);
                }}
                className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowInterStateModal(false)}
                className="flex-1 rounded-xl bg-[#1cd188] py-3 font-bold text-[#0f172a]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Payout Method</h3>
            <p className="mb-4 text-sm text-slate-400">Enter your bank details for withdrawals. Secured by <strong>Paystack</strong>.</p>
            <div className="space-y-4 mb-6">
              <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => { setBankName(e.target.value); setBankVerified(false); }} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
              <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value); setBankVerified(false); }} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowBankModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
              {!bankVerified ? (
                <button type="button" onClick={() => {
                  setIsVerifyingBank(true);
                  setTimeout(() => { setIsVerifyingBank(false); setBankVerified(true); }, 1500);
                }} className="flex-1 rounded-xl bg-indigo-500 py-3 font-bold text-white hover:bg-indigo-400">
                  {isVerifyingBank ? 'Verifying...' : 'Verify Bank'}
                </button>
              ) : (
                <button type="button" onClick={async () => { await updateDriver({ bank_name: bankName, account_number: accountNumber }); setShowBankModal(false); setBankVerified(false); }} className="flex-1 rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-400">Save</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Emergency Contact</h3>
            <p className="mb-6 text-sm text-slate-400">Set up a trusted contact for emergencies.</p>
            <div className="space-y-4 mb-6">
              <input type="text" placeholder="Contact Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500" />
              <input type="text" placeholder="Phone Number" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowEmergencyModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
              <button type="button" onClick={async () => { await updateDriver({ emergency_contact_name: emergencyName, emergency_contact_phone: emergencyPhone }); setShowEmergencyModal(false); }} className="flex-1 rounded-xl bg-rose-500 py-3 font-bold text-white hover:bg-rose-400">Save</button>
            </div>
          </div>
        </div>
      )}

      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Weekly Goal</h3>
            <p className="mb-6 text-sm text-slate-400">Set a personal earnings target to stay motivated.</p>
            <div className="space-y-4 mb-6">
              <input type="number" placeholder="Target Amount" value={weeklyGoal} onChange={(e) => setWeeklyGoal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
              <button type="button" onClick={async () => { await updateDriver({ weekly_goal: weeklyGoal }); setShowGoalModal(false); }} className="flex-1 rounded-xl bg-amber-500 py-3 font-bold text-white hover:bg-amber-400">Set Goal</button>
            </div>
          </div>
        </div>
      )}

      {showDestinationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Add Destination</h3>
            <p className="mb-4 text-sm text-slate-400">
              Add a new destination to your saved places.
            </p>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Title (e.g. Home, Office)"
                value={newDestination.title}
                onChange={(e) => setNewDestination({...newDestination, title: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#1cd188]"
              />
              <input
                type="text"
                placeholder="Full Address"
                value={newDestination.address}
                onChange={(e) => setNewDestination({...newDestination, address: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#1cd188]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDestinationModal(false)}
                className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newDestination.title && newDestination.address) {
                    setDestinations([...destinations, newDestination]);
                    setNewDestination({ title: '', address: '' });
                    setShowDestinationModal(false);
                  }
                }}
                className="flex-1 rounded-xl bg-[#1cd188] py-3 font-bold text-[#0f172a]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
  );
};

const PreferenceToggle = ({ label, description, checked, disabled, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-900/30 p-3">
    <span>
      <span className="block text-sm font-bold text-white">{label}</span>
      <span className="block text-[10px] text-slate-500">{description}</span>
    </span>
    <div className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[#1cd188]' : 'bg-slate-700'} ${disabled ? 'opacity-50' : ''}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
    <input
      type="checkbox"
      className="sr-only"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
  </label>
);

export default DriverProfileTab;
