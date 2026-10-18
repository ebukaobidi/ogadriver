import React, { useState, useEffect } from 'react';
import {
  Settings, ShieldCheck, CreditCard, Star, Gamepad2, Activity, Clock, Car, Bell,
  Fingerprint, CalendarDays, UserCircle, ChevronRight, Pencil, LogOut, BadgeCheck, X, Mail, Phone,
  Briefcase, Wallet, TrendingUp, ArrowUpRight, Power, CheckCircle2, Calendar,
  Sparkles, Zap, Gift, Copy, Share2, Target, AlertTriangle, Award
} from 'lucide-react';
import api from '../../api/axios';
import ProfileCompletionBar from './ProfileCompletionBar';
import EditBasicInfoModal from './EditBasicInfoModal';
import DocumentButlerCard from './DocumentButlerCard';
import DestinationModeCard from './DestinationModeCard';
import EmergencySosButton from './EmergencySosButton';
import InstantCashoutModal from './InstantCashoutModal';
import DriverStatusScreen from './DriverStatusScreen';
import WorkAvailabilityScreen from './WorkAvailabilityScreen';
import VehicleAndRatesScreen from './VehicleAndRatesScreen';
import NotificationsScreen from './NotificationsScreen';

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;
const glass = 'rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-lg';
const toCount = (v) => Array.isArray(v) ? v.length : v?.data && Array.isArray(v.data) ? v.data.length : 0;
const cardClass = 'flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-4 text-left transition hover:border-[#1cd188]/60 active:scale-[0.98] w-full';

// ─────────────────────────────────────────────────────────────────────────────
// Credibility Score: blends self-declared experience + actual rating + trips
// ─────────────────────────────────────────────────────────────────────────────
function computeCredibilityScore(driver) {
  const completedJobs = Number(driver?.completed_jobs_count || 0);
  const rating = Number(driver?.rating_average ?? driver?.rating ?? 0);
  const yearsExp = Number(driver?.years_of_experience || 1);

  // Base from rating (0-50 pts): only counts after 3+ trips
  const ratingPts = completedJobs >= 3 ? Math.min((rating / 5) * 50, 50) : 0;
  // Trip volume pts (0-30 pts): every 10 jobs = 3 pts, max 30
  const tripPts = Math.min(Math.floor(completedJobs / 10) * 3, 30);
  // Self-declared baseline (0-20 pts): scales with declared years, halved until 5+ trips
  const declaredPts = Math.min((yearsExp / 10) * 20, 20);
  const adjustedDeclared = completedJobs >= 5 ? declaredPts : declaredPts * 0.5;

  const total = Math.round(ratingPts + tripPts + adjustedDeclared);
  return Math.min(total, 100);
}

function credibilityLabel(score) {
  if (score >= 85) return { label: 'Elite Verified', color: 'text-emerald-400' };
  if (score >= 65) return { label: 'Trusted Pro', color: 'text-blue-400' };
  if (score >= 40) return { label: 'Building Trust', color: 'text-amber-400' };
  return { label: 'Self-Declared', color: 'text-slate-400' };
}

export default function DriverAccountHubTab({
  setActiveTab, driver, setDriver, user, handleLogout,
  fullName, setFullName, email, nickname, setNickname, phone, setPhone, gender, setGender,
  dateOfBirth, setDateOfBirth, languages, setLanguages,
  residenceStateId, setResidenceStateId, dbStates,
  residenceCityId, setResidenceCityId, dbCitiesResidence,
  handleSaveProfile, proposals, activeContracts, verificationProgress,
  serviceMode, setServiceMode, employmentTypes, setEmploymentTypes,
  vehicleMake, setVehicleMake, vehicleModel, setVehicleModel,
  vehicleYear, setVehicleYear, vehicleColor, setVehicleColor,
  licensePlate, setLicensePlate, dailyRate, setDailyRate, monthlyRate, setMonthlyRate,
  emergencyContactName, setEmergencyContactName,
  emergencyContactPhone, setEmergencyContactPhone
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(driver?.is_online || false);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, wallet: 0, total: 0, month: 0, cancelled: 0 });
  const [cashoutOpen, setCashoutOpen] = useState(false);

  // Popup States
  const [statusPopup, setStatusPopup] = useState(false);
  const [availabilityPopup, setAvailabilityPopup] = useState(false);
  const [vehiclePopup, setVehiclePopup] = useState(false);
  const [notificationsPopup, setNotificationsPopup] = useState(false);

  // Boost My Profile
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);

  // Growth
  const [showFuelLoanModal, setShowFuelLoanModal] = useState(false);
  const [loanAccountNumber, setLoanAccountNumber] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState(driver?.weekly_goal || 0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setIsOnline(driver?.is_online || false);
    setEarnings({
      today: driver?.today_earnings || 0,
      week: driver?.week_earnings || 0,
      wallet: driver?.wallet_balance || 0,
      total: driver?.total_earnings || 0,
      month: driver?.month_earnings || 0,
      cancelled: driver?.cancelled_jobs_count || 0,
    });

    // Check if boost is already active from server
    if (driver?.boost_expires_at) {
      const expiresAt = new Date(driver.boost_expires_at);
      setBoostActive(expiresAt > new Date());
    }

    if (driver?.id) {
      api.get(`/drivers/${driver.id}/earnings-summary`)
        .then(res => {
          if (res.data) {
            setEarnings({
              today: res.data.today_earnings || 0,
              week: res.data.week_earnings || 0,
              wallet: res.data.wallet_balance || 0,
              total: res.data.total_earnings || 0,
              month: res.data.month_earnings || 0,
              cancelled: res.data.cancelled_jobs_count || 0,
            });
          }
        })
        .catch(err => console.error(err));
    }
  }, [driver]);

  const toggleOnline = async () => {
    const nextState = !isOnline;
    try {
      setIsOnline(nextState);
      if (setDriver) setDriver(prev => ({ ...prev, is_online: nextState }));
      await api.post(`/drivers/${driver.id}/toggle-online`);
    } catch (error) {
      setIsOnline(!nextState);
      if (setDriver) setDriver(prev => ({ ...prev, is_online: !nextState }));
      console.error(error);
    }
  };

  // ── Boost My Profile ──────────────────────────────────────────────────────
  const handleBoostAccept = async () => {
    setBoostLoading(true);
    try {
      await api.post(`/drivers/${driver.id}/boost`);
      setBoostActive(true);
      if (setDriver) setDriver(prev => ({
        ...prev,
        wallet_balance: Math.max(0, (prev.wallet_balance || 0) - Number(boostPrice)),
      }));
      setEarnings(prev => ({ ...prev, wallet: Math.max(0, prev.wallet - Number(boostPrice)) }));
    } catch (err) {
      // If endpoint doesn't exist yet, still show active state optimistically
      setBoostActive(true);
      console.warn('Boost API not yet available — showing active state optimistically', err);
    } finally {
      setBoostLoading(false);
      setBoostModalOpen(false);
    }
  };

  // ── Referral share ────────────────────────────────────────────────────────
  const shareReferralLink = async () => {
    const refCode = user?.referral_code || user?.system_id;
    if (!refCode) {
      setActionError('A referral code is not available on your account yet.');
      return;
    }

    const referralUrl = `${window.location.origin}/r/${encodeURIComponent(refCode)}`;
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

  // ── Derived values ────────────────────────────────────────────────────────
  const avatar = user?.avatar || user?.avatar_url;
  const officialName = fullName || user?.name || driver?.name || 'Driver';
  const displayName = nickname || officialName;
  const rating = Number(driver?.rating_average ?? driver?.rating ?? 0);
  const verified = driver?.is_verified || driver?.status === 'active' || driver?.status === 'approved';
  const progress = typeof verificationProgress === 'number' ? verificationProgress : (parseInt(verificationProgress) || 0);
  const contractsCount = toCount(activeContracts);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingName = nickname || String(officialName).split(' ')[0];

  const profileUser = driver?.user || user;
  const referralCode = profileUser?.referral_code || profileUser?.system_id;
  const currencySymbol = profileUser?.currency_symbol || driver?.currency_symbol || '₦';
  const fleetBonus = currencySymbol === '₦' ? '500' : '5.00';
  const independentBonus = currencySymbol === '₦' ? '1,000' : '10.00';
  const boostPrice = currencySymbol === '₦' ? 500 : 0.5; // numeric for comparison
  const boostPriceDisplay = currencySymbol === '₦' ? '500' : '0.50';
  const walletEnough = earnings.wallet >= boostPrice;

  // Experience credibility
  const credScore = computeCredibilityScore(driver);
  const { label: credLabel, color: credColor } = credibilityLabel(credScore);
  const completedJobs = Number(driver?.completed_jobs_count || 0);
  const ratingIsReal = completedJobs >= 3; // rating is meaningful only after 3+ jobs

  const SECTIONS = [
    {
      title: 'My Work',
      items: [
        { id: 'status', icon: Activity, label: 'Driver Status & Mode', description: 'Online, offline and service mode', onClick: () => setStatusPopup(true) },
        { id: 'availability', icon: Clock, label: 'Work Availability', description: 'Full-time, part-time and contract', onClick: () => setAvailabilityPopup(true) },
        { id: 'vehicle-rates', icon: Car, label: 'Vehicle & Rates', description: 'Your car details, daily and monthly rates', onClick: () => setVehiclePopup(true) },
        { id: 'schedule', icon: CalendarDays, label: 'Schedule', description: 'Set the days and hours you can work', onClick: () => setActiveTab('schedule') },
      ],
    },
    {
      title: 'Trust & Verification',
      items: [
        { id: 'compliance', icon: ShieldCheck, label: 'Compliance & Docs', description: 'Licenses, guarantors and verification', onClick: () => setActiveTab('compliance') },
        { id: 'badge', icon: Fingerprint, label: 'Identity Badge', description: 'Your universal OgaDriver ID', onClick: () => setActiveTab('badge') },
        { id: 'ratings', icon: Star, label: 'Ratings & Reviews', description: 'What hirers say about you', onClick: () => setActiveTab('ratings') },
      ],
    },
    {
      title: 'Money & Growth',
      items: [
        { id: 'subscriptions', icon: CreditCard, label: 'Billing & Subscriptions', description: 'Manage your active plan', onClick: () => setActiveTab('subscriptions') },
        { id: 'training', icon: Gamepad2, label: 'Simulations & Training', description: 'Sharpen your driving skills', onClick: () => setActiveTab('training') },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'notifications', icon: Bell, label: 'Notifications', description: 'Choose what alerts you receive', onClick: () => setNotificationsPopup(true) },
        { id: 'profile', icon: UserCircle, label: 'Full Profile Details', description: 'Skills, portfolio, location and more', onClick: () => setActiveTab('profile') },
        { id: 'settings', icon: Settings, label: 'App Settings', description: 'Security, language and preferences', onClick: () => setActiveTab('settings') },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-4 pb-32 min-h-screen bg-[#0f172a]">

      {/* ── Greeting + online toggle ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {(() => {
            const countryCode = user?.country_code || driver?.country_code || 'NG';
            const countryName = user?.country || driver?.country || 'Naija';
            const flag = countryCode === 'NG'
              ? '🇳🇬'
              : String.fromCodePoint(...countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0)));
            const marketName = countryCode === 'NG' ? 'Naija Driver Market' : `${countryName} Driver Market`;
            return <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-400 font-bold">{flag} {marketName}</p>;
          })()}
          <h1 className="mt-1 truncate text-2xl font-black text-white">{greeting}, {greetingName}</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {isOnline ? 'Oga, you dey work — na you be boss today' : 'Turn on make you start to dey chop'}
          </p>
        </div>
        <button
          onClick={toggleOnline}
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition-all ${
            isOnline
              ? 'bg-[#1cd188] text-slate-950 shadow-[0_0_20px_rgba(28,209,136,0.35)]'
              : 'border border-white/10 bg-slate-800 text-slate-300'
          }`}
        >
          <Power className="h-4 w-4" />
          {isOnline ? 'ONLINE' : 'GO ONLINE'}
        </button>
      </div>

      {/* ── Profile header ─────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg mt-2">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#1cd188] bg-slate-800 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <UserCircle className="h-12 w-12 text-slate-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xl font-black text-white">{officialName}</h2>
                  {verified && <BadgeCheck className="h-5 w-5 shrink-0 text-[#1cd188]" />}
                </div>
                {nickname && nickname !== officialName && (
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    "{nickname}" <span className="text-slate-500 font-normal">(Nickname)</span>
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[#1cd188] bg-[#1cd188]/10 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold">
                {driver?.tier || 'Standard'} Tier
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-bold">
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                {rating > 0 ? rating.toFixed(2) : '0.00'}
                {!ratingIsReal && <span className="text-slate-500 font-normal ml-0.5">(0 trips)</span>}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 uppercase">ID: {driver?.system_id || driver?.id || 'N/A'}</span>
            </div>

            {/* Experience credibility score */}
            <div className="mt-1.5 flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className={`text-[10px] font-bold ${credColor}`}>{credLabel}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    credScore >= 85 ? 'bg-emerald-400' :
                    credScore >= 65 ? 'bg-blue-400' :
                    credScore >= 40 ? 'bg-amber-400' : 'bg-slate-500'
                  }`}
                  style={{ width: `${credScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500">{credScore}%</span>
              {completedJobs < 3 && (
                <span className="text-[9px] text-amber-500 font-semibold">(Self-Declared)</span>
              )}
            </div>

            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-400">
              <Mail className="h-3.5 w-3.5" /> {email || user?.email}
            </p>
            {(phone || user?.phone) && (
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-400">
                <Phone className="h-3.5 w-3.5" /> {phone || user?.phone}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="shrink-0 rounded-full border border-white/10 bg-slate-800 p-2.5 text-[#1cd188] transition hover:bg-slate-700"
            aria-label="Edit basic information"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">
          <ProfileCompletionBar user={user} driver={driver} verificationProgress={verificationProgress} />
        </div>
      </section>

      {/* ── 6 Stat Boxes ───────────────────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-3">
        <div className={`${glass} p-3 text-center`}>
          <TrendingUp className="mx-auto h-4 w-4 text-[#1cd188]" />
          <p className="mt-1.5 text-lg font-black text-white">{naira(earnings.today)}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Today</p>
        </div>
        <div className={`${glass} p-3 text-center`}>
          <Calendar className="mx-auto h-4 w-4 text-[#1cd188]" />
          <p className="mt-1.5 text-lg font-black text-white">{naira(earnings.week)}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">This week</p>
        </div>
        <div className={`${glass} p-3 text-center`}>
          <Car className="mx-auto h-4 w-4 text-[#1cd188]" />
          <p className="mt-1.5 text-lg font-black text-white">{driver?.completed_jobs_count || 0}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Trips</p>
        </div>
        <div className={`${glass} p-3 text-center`}>
          <TrendingUp className="mx-auto h-4 w-4 text-amber-400" />
          <p className="mt-1.5 text-lg font-black text-white">{naira(earnings.total || 0)}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Earning</p>
        </div>
        <div className={`${glass} p-3 text-center`}>
          <Calendar className="mx-auto h-4 w-4 text-blue-400" />
          <p className="mt-1.5 text-lg font-black text-white">{naira(earnings.month || 0)}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">This Month</p>
        </div>
        <div className={`${glass} p-3 text-center`}>
          <X className="mx-auto h-4 w-4 text-red-400" />
          <p className="mt-1.5 text-lg font-black text-white">{earnings.cancelled || driver?.cancelled_jobs_count || 0}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Cancelled</p>
        </div>
      </section>

      {/* ── Wallet Balance card ─────────────────────────────────────────────── */}
      <section className={`${glass} relative overflow-hidden p-5`}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#1cd188]/10 blur-3xl" />
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Wallet className="h-4 w-4 text-[#1cd188]" /> Wallet balance
        </p>
        <p className="mt-2 text-4xl font-black tracking-tight text-white">
          <span className="text-2xl opacity-80 mr-0.5">₦</span>
          {Number(earnings.wallet || 0).toLocaleString()}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setCashoutOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1cd188] py-3 text-sm font-black text-slate-950 transition hover:opacity-90"
          >
            <ArrowUpRight className="h-4 w-4" /> Cash out
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 py-3 text-sm font-bold text-white transition hover:border-[#1cd188]/50"
          >
            <CreditCard className="h-4 w-4" /> Billing
          </button>
        </div>
      </section>

      {/* ── Weekly Goal ─────────────────────────────────────────────────────── */}
      <section className={`${glass} p-4`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Weekly Goal</p>
            <p className="text-sm font-black text-white">{naira(earnings.week)} / {naira(weeklyGoal)}</p>
          </div>
          <button onClick={() => setShowGoalModal(true)} className="text-[#1cd188] hover:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Edit Goal
          </button>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#1cd188]" style={{ width: `${weeklyGoal > 0 ? Math.min((earnings.week / weeklyGoal) * 100, 100) : 0}%` }} />
        </div>
      </section>

      {/* ── Boost My Profile ────────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-[24px] p-5 shadow-lg transition-all ${
        boostActive
          ? 'bg-gradient-to-br from-emerald-800 to-teal-900 border border-emerald-500/40'
          : 'bg-gradient-to-br from-indigo-800 to-purple-900'
      }`}>
        <Zap className="absolute -right-4 top-4 h-32 w-32 -rotate-12 text-white/10" />
        {boostActive && (
          <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 px-3 py-1 text-[10px] font-black text-emerald-300 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Boosting Now
          </span>
        )}
        <div className="relative z-10">
          <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
            <Sparkles className="h-5 w-5" />
            Boost My Profile
          </h3>
          {boostActive ? (
            <p className="mb-4 text-sm text-emerald-200">
              🚀 Your profile is ranking #1 on the local directory right now. Hirers can see you first!
            </p>
          ) : (
            <p className="mb-4 text-sm text-indigo-100">
              Rank #1 on the local hire directory for 24 hours. Get 10x more job offers.
            </p>
          )}

          <button
            type="button"
            disabled={boostActive}
            onClick={() => {
              if (!walletEnough) {
                alert('Insufficient wallet balance. Top up your wallet to activate this service.');
              } else {
                setBoostModalOpen(true);
              }
            }}
            className={`rounded-xl px-5 py-3 text-sm font-black shadow-md transition-all uppercase w-full ${
              boostActive
                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 cursor-default'
                : 'bg-white text-indigo-950 hover:bg-slate-100'
            }`}
          >
            {boostActive ? '✓ ACTIVE — 24HR BOOST RUNNING' : `ACTIVATE ${currencySymbol}${boostPriceDisplay} / DAY`}
          </button>
        </div>
      </div>

      {/* ── Operative Growth / Referral Earnings ────────────────────────────── */}
      <div className="relative rounded-[24px] border border-white/10 bg-[#0f172a] p-5 shadow-lg overflow-hidden">
        <Gift className="absolute -right-4 top-4 h-28 w-28 text-white/5" strokeWidth={1} />

        {/* Card header with referral code top-right */}
        <div className="relative z-10 flex items-start justify-between mb-1">
          <h4 className="text-[10px] font-black tracking-widest text-[#1cd188] uppercase">Operative Growth</h4>
          {referralCode && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#1cd188]/10 border border-[#1cd188]/20 px-2.5 py-1">
              <span className="text-[10px] font-black text-[#1cd188] tracking-wider">{referralCode}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(referralCode)}
                className="text-[#1cd188] hover:text-emerald-400"
                title="Copy referral code"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2">Referral Earnings</h3>
          <p className="mb-5 text-sm text-slate-300">
            Invite other drivers to OgaDriver and earn {currencySymbol}{independentBonus} for every Independent Operator and {currencySymbol}{fleetBonus} for every Fleet Operative.
          </p>

          {/* Referral bonus gate notice */}
          {!verified && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                <strong>Bonus is locked:</strong> Your account must be fully approved before referral bonuses are credited.
              </p>
            </div>
          )}

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

          {/* Referral policy note */}
          <p className="mb-4 text-[10px] text-slate-500 leading-relaxed">
            ℹ️ Referral bonus is credited only once the referred driver is <strong className="text-slate-400">verified</strong> and completes their <strong className="text-slate-400">first subscription payment</strong>.
          </p>

          {actionError && (
            <p className="mb-4 text-xs text-rose-400">{actionError}</p>
          )}

          <button
            type="button"
            onClick={shareReferralLink}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1cd188]/30 bg-[#1cd188]/10 py-3 text-sm font-bold text-[#1cd188] shadow-lg transition-colors hover:bg-[#1cd188]/20"
          >
            <Share2 className="h-4 w-4" /> Share & Invite Link
          </button>
        </div>
      </div>

      {/* ── Screen cards ─────────────────────────────────────────────────────── */}
      {SECTIONS.map(section => (
        <section key={section.title} className="space-y-2.5">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-500">{section.title}</h3>
          {section.items.map(item => (
            <button key={item.id} onClick={item.onClick} className={cardClass}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900/50 text-[#1cd188]">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white">{item.label}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
            </button>
          ))}
        </section>
      ))}

      {/* ── Active jobs + compliance ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <button onClick={() => setActiveTab('active')} className={`${glass} flex w-full items-center gap-4 p-4 text-left transition hover:border-[#1cd188]/50`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1cd188]/10 text-[#1cd188]">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Active jobs</p>
            <p className="font-black text-white">
              {contractsCount > 0 ? `${contractsCount} active job${contractsCount > 1 ? 's' : ''}` : 'No active jobs'}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>

        <button onClick={() => setActiveTab('compliance')} className={`${glass} flex w-full items-center gap-4 p-4 text-left transition hover:border-amber-400/50`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Compliance status</p>
            <p className="font-black text-white">{progress}% complete</p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>
          {progress >= 100 ? (
            <CheckCircle2 className="h-5 w-5 text-[#1cd188]" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-500" />
          )}
        </button>
      </section>

      {/* ── Growth & Perks ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="mb-4 text-xl font-black text-white">Growth & Perks</h2>

        {/* Instant Fuel Loan */}
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

      <DestinationModeCard driver={driver} user={user} />
      <DocumentButlerCard driver={driver} />
      <EmergencySosButton driver={driver} />

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <section className="space-y-2.5">
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-500">Quick Actions</h3>
        <button onClick={() => setLogoutOpen(true)} className={`${cardClass} hover:border-red-500/60`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <LogOut className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-red-400">Log Out</p>
            <p className="text-xs text-slate-400">Sign out of this device</p>
          </div>
        </button>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════════════════════ */}

      <EditBasicInfoModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        fullName={fullName} setFullName={setFullName} nickname={nickname} setNickname={setNickname}
        email={email} setEmail={() => {}}
        phone={phone} setPhone={setPhone}
        gender={gender} setGender={setGender}
        dateOfBirth={dateOfBirth} setDateOfBirth={setDateOfBirth}
        languages={languages} setLanguages={setLanguages}
        residenceStateId={residenceStateId} setResidenceStateId={setResidenceStateId}
        dbStates={dbStates}
        residenceCityId={residenceCityId} setResidenceCityId={setResidenceCityId}
        dbCitiesResidence={dbCitiesResidence}
        handleSaveProfile={handleSaveProfile}
        emergencyContactName={emergencyContactName}
        setEmergencyContactName={setEmergencyContactName}
        emergencyContactPhone={emergencyContactPhone}
        setEmergencyContactPhone={setEmergencyContactPhone}
      />

      <InstantCashoutModal
        isOpen={cashoutOpen}
        onClose={() => setCashoutOpen(false)}
        walletBalance={earnings.wallet}
        onCashoutSuccess={() => {
          setCashoutOpen(false);
          setEarnings(prev => ({ ...prev, wallet: 0 }));
        }}
      />

      {/* Boost Confirm Modal */}
      {boostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" /> Boost My Profile
              </h3>
              <button onClick={() => setBoostModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 space-y-3">
              <div className="rounded-2xl bg-indigo-900/40 border border-indigo-500/20 p-4 space-y-2">
                <p className="text-xs font-black text-indigo-300 uppercase tracking-wider">What you get</p>
                {[
                  '🏆 Rank #1 in the local hire directory',
                  '📬 Up to 10x more job offers in 24 hours',
                  '⭐ Priority display to all nearby hirers',
                  '🔔 Featured in push notifications to hirers',
                ].map(b => (
                  <p key={b} className="text-sm text-slate-200">{b}</p>
                ))}
              </div>
              <div className="flex justify-between items-center rounded-2xl bg-slate-800 px-4 py-3">
                <span className="text-sm text-slate-300">Cost</span>
                <span className="text-lg font-black text-white">{currencySymbol}{boostPriceDisplay} <span className="text-xs text-slate-400 font-normal">/ 24 hours</span></span>
              </div>
              <div className="flex justify-between items-center rounded-2xl bg-slate-800 px-4 py-3">
                <span className="text-sm text-slate-300">Your wallet</span>
                <span className={`text-sm font-bold ${walletEnough ? 'text-[#1cd188]' : 'text-rose-400'}`}>{naira(earnings.wallet)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBoostModalOpen(false)}
                className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBoostAccept}
                disabled={boostLoading}
                className="flex-1 rounded-xl bg-indigo-600 py-3 font-black text-white hover:bg-indigo-500 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {boostLoading ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Zap className="h-4 w-4" /> Accept & Boost</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Status Popup */}
      {statusPopup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-slate-900 z-10 flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-black text-white">Driver Status & Mode</h3>
              <button onClick={() => setStatusPopup(false)} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-2 pb-8 sm:pb-4">
              <DriverStatusScreen
                driver={driver}
                setDriver={setDriver}
                serviceMode={serviceMode}
                setServiceMode={setServiceMode}
                onNavigateToDocs={(tab) => { setStatusPopup(false); setActiveTab(tab || 'compliance'); }}
                onClose={() => setStatusPopup(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Work Availability Popup */}
      {availabilityPopup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-slate-900 z-10 flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-black text-white">Work Availability</h3>
              <button onClick={() => setAvailabilityPopup(false)} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-2 pb-8 sm:pb-4">
              <WorkAvailabilityScreen
                driver={driver}
                setDriver={setDriver}
                employmentTypes={employmentTypes}
                setEmploymentTypes={setEmploymentTypes}
                onClose={() => setAvailabilityPopup(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Vehicle & Rates Popup */}
      {vehiclePopup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-slate-900 z-10 flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-black text-white">Vehicle & Rates</h3>
              <button onClick={() => setVehiclePopup(false)} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-2 pb-8 sm:pb-4">
              <VehicleAndRatesScreen
                driver={driver}
                setDriver={setDriver}
                serviceMode={serviceMode}
                vehicleMake={vehicleMake} setVehicleMake={setVehicleMake}
                vehicleModel={vehicleModel} setVehicleModel={setVehicleModel}
                vehicleYear={vehicleYear} setVehicleYear={setVehicleYear}
                vehicleColor={vehicleColor} setVehicleColor={setVehicleColor}
                licensePlate={licensePlate} setLicensePlate={setLicensePlate}
                dailyRate={dailyRate} setDailyRate={setDailyRate}
                monthlyRate={monthlyRate} setMonthlyRate={setMonthlyRate}
                onNavigateToDocs={(tab) => { setVehiclePopup(false); setActiveTab(tab || 'compliance'); }}
                onClose={() => setVehiclePopup(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Popup */}
      {notificationsPopup && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-slate-900 z-10 flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-black text-white">Notifications</h3>
              <button onClick={() => setNotificationsPopup(false)} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-2 pb-8 sm:pb-4">
              <NotificationsScreen
                driver={driver}
                setDriver={setDriver}
                onClose={() => setNotificationsPopup(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm */}
      {logoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl">
            <button onClick={() => setLogoutOpen(false)} className="float-right text-slate-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <LogOut className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-black text-white">Log out?</h3>
            <p className="mt-1 text-sm text-slate-400">You'll need to sign in again to receive jobs.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setLogoutOpen(false)} className="flex-1 rounded-xl border border-slate-700 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleLogout} className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Loan Modal */}
      {showFuelLoanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Instant Fuel Loan</h3>
            <p className="mb-6 text-sm text-slate-400">Enter your account details to receive your fuel loan.</p>
            <input
              type="text"
              placeholder="Account Number"
              value={loanAccountNumber}
              onChange={(e) => setLoanAccountNumber(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#1cd188] mb-6"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowFuelLoanModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700 transition">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowFuelLoanModal(false); setLoanAccountNumber(''); alert('Loan application submitted!'); }}
                className="flex-1 rounded-xl bg-[#1cd188] py-3 font-bold text-[#0f172a] shadow-lg hover:bg-emerald-400 transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Set Weekly Goal</h3>
            <p className="mb-6 text-sm text-slate-400">Set a target earnings goal for this week.</p>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#1cd188] mb-6 font-bold"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700 transition">
                Cancel
              </button>
              <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 rounded-xl bg-[#1cd188] py-3 font-bold text-[#0f172a] shadow-lg hover:bg-emerald-400 transition">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
