import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Briefcase,
  Car,
  ChevronRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Home,
  Leaf,
  Loader2,
  Lock,
  MapPin,
  Save,
  Shield,
  Smartphone,
  User,
  UserCheck,
} from 'lucide-react';
import { driverService } from '../../api/drivers';

const cardClass = 'rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg sm:p-6';
const fieldClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#1cd188] focus:outline-none';

const DriverSettingsTab = ({
  driver,
  setDriver,
  user,
  setActiveTab,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleChangePassword,
  processingId,
  handleAvatarUpload,
  email,
  nickname,
  setNickname,
  phone,
  setPhone,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  languages,
  setLanguages,
  residenceStateId,
  setResidenceStateId,
  dbStates,
  residenceCityId,
  setResidenceCityId,
  dbCitiesResidence,
  dailyRate,
  setDailyRate,
  monthlyRate,
  setMonthlyRate,
  serviceMode,
  setServiceMode,
  accommodationNeeded,
  setAccommodationNeeded,
  accommodationNotes,
  setAccommodationNotes,
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleColor,
  setVehicleColor,
  licensePlate,
  setLicensePlate,
  employmentTypes,
  setEmploymentTypes,
  kycData,
  handleSaveProfile,
  handleSaveRates,
}) => {
  const navigate = useNavigate();
  const [savedPlaces, setSavedPlaces] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState(null);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [interstateAvailable, setInterstateAvailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const [formError, setFormError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [batterySaver, setBatterySaver] = useState(
    () => localStorage.getItem('battery_saver') === 'true'
  );

  useEffect(() => {
    setSavedPlaces(driver?.saved_places || null);
    setNotificationPreferences(driver?.notification_preferences || null);
    setBiometricLogin(Boolean(driver?.biometric_login));
    setInterstateAvailable(Boolean(driver?.available_for_interstate));
  }, [driver?.id, driver?.saved_places, driver?.notification_preferences, driver?.biometric_login, driver?.available_for_interstate]);

  const updateSavedPlace = (place, address) => {
    setSavedPlaces((current) => ({
      ...(current || {}),
      [place]: {
        ...((current && current[place]) || {}),
        address,
      },
    }));
    setSaveMessage('');
  };

  const updateNotificationPreference = (key, value) => {
    setNotificationPreferences((current) => ({
      ...(current || {}),
      [key]: value,
    }));
    setSaveMessage('');
  };

  const toggleOnline = async () => {
    if (!driver?.id || !setDriver) {
      setFormError('Your driver account is unavailable. Sign in again and retry.');
      return;
    }

    setIsTogglingOnline(true);
    setFormError('');
    try {
      const response = await driverService.toggleOnline(driver.id);
      const updatedStatus = response?.data?.is_online;
      if (typeof updatedStatus !== 'boolean') {
        throw new Error('The server did not return the saved driver status.');
      }
      setDriver((current) => ({ ...current, is_online: updatedStatus }));
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || 'Could not update your driver status.');
    } finally {
      setIsTogglingOnline(false);
    }
  };

  const handleSaveAll = async () => {
    setFormError('');
    setSaveMessage('');

    if (!driver?.id) {
      setFormError('Your driver profile is not available. Reload the page and try again.');
      return;
    }
    if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) {
      setFormError('Enter a valid phone number before saving.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setFormError('The new password and confirmation do not match.');
      return;
    }
    for (const rate of [dailyRate, monthlyRate]) {
      if (rate !== '' && (!Number.isFinite(Number(rate)) || Number(rate) < 1000 || Number(rate) > 1000000)) {
        setFormError('Rates must be between 1,000 and 1,000,000.');
        return;
      }
    }

    setSaving(true);
    try {
      const profileSaved = await handleSaveProfile();
      if (profileSaved === false) {
        setFormError('Personal information could not be saved. Review the error and try again.');
        return;
      }

      const preferencesSaved = await handleSaveRates(setDriver);
      if (preferencesSaved === false) {
        setFormError('Driver preferences could not be saved. Review the error and try again.');
        return;
      }

      const settingsResponse = await driverService.updateProfile(driver.id, {
        biometric_login: biometricLogin,
        available_for_interstate: interstateAvailable,
        saved_places: {
          home: { address: savedPlaces?.home?.address || '' },
          work: { address: savedPlaces?.work?.address || '' },
        },
        notification_preferences: notificationPreferences || {},
      });

      const updatedDriver = settingsResponse?.data;
      if (!updatedDriver?.id) {
        throw new Error('The server did not return your saved settings.');
      }
      setDriver((current) => ({ ...current, ...updatedDriver }));
      setSaveMessage('Settings saved to your driver account.');
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setFormError('');
    setPasswordMessage('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError('Enter your current password and complete all new password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('The new password and confirmation do not match.');
      return;
    }

    const changed = await handleChangePassword();
    if (changed !== false) {
      setPasswordMessage('Password updated.');
    }
  };

  const selectServiceMode = (mode) => {
    setServiceMode(mode);
    setSaveMessage('');
  };

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  const vehicle = driver?.vehicle || {};
  const isOnline = driver?.is_online === true;

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 pb-8 text-white sm:px-6">
      <header className="flex items-start justify-between gap-4 pt-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1cd188]">
            {driver?.formatted_id || 'Driver account'}
          </p>
          <h1 className="mt-1 text-3xl font-black">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">{fullName || 'Manage your driver account'}</p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="rounded-xl border border-slate-700 bg-slate-900/60 backdrop-blur-2xl px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-[#1cd188]/50"
        >
          Profile
        </button>
      </header>

      {formError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      {saveMessage && (
        <p className="rounded-xl border border-[#1cd188]/30 bg-[#1cd188]/10 p-3 text-sm text-[#1cd188]" role="status">
          {saveMessage}
        </p>
      )}

      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
              {user?.avatar || user?.avatar_url
                ? <img src={user.avatar || user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                : <User className="h-6 w-6 text-slate-400" />}
            </div>
            <div>
              <p className="font-bold">{fullName || 'Name unavailable'}</p>
              <p className="text-xs text-slate-400">{email || user?.email || 'Email unavailable'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleAvatarUpload('primary')}
            disabled={processingId === 'avatar_primary'}
            className="rounded-xl bg-[#1cd188] px-4 py-2 text-sm font-bold text-[#0f172a] transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {processingId === 'avatar_primary' ? 'Uploading…' : 'Change photo'}
          </button>
        </div>
      </section>

      <section className="space-y-3 mb-6">
        <button type="button" onClick={() => navigate('/driver/status')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1cd188] transition w-full">
          <div className="flex items-center gap-3"><Car className="h-5 w-5 text-[#1cd188]" /><span className="font-bold text-white">Driver Status & Mode</span></div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
        <button type="button" onClick={() => navigate('/driver/availability')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1cd188] transition w-full">
          <div className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-[#1cd188]" /><span className="font-bold text-white">Work Availability</span></div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
        <button type="button" onClick={() => navigate('/driver/notifications')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1cd188] transition w-full">
          <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-[#1cd188]" /><span className="font-bold text-white">Notifications</span></div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
        <button type="button" onClick={() => navigate('/driver/vehicle-rates')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1cd188] transition w-full">
          <div className="flex items-center gap-3"><Car className="h-5 w-5 text-[#1cd188]" /><span className="font-bold text-white">Vehicle & Rates</span></div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
      </section>

      

      

      

      <section className={cardClass}>
        <h2 className="mb-4 border-b border-white/10 pb-3 text-lg font-black">Driver Preferences</h2>
        <div className="space-y-3">
          <PreferenceToggle
            icon={Smartphone}
            title="Biometric login"
            description="Allow Face ID or fingerprint sign-in."
            checked={biometricLogin}
            onChange={setBiometricLogin}
          />
          <PreferenceToggle
            icon={Globe}
            title="Interstate availability"
            description="Available for long-distance trips."
            checked={interstateAvailable}
            onChange={setInterstateAvailable}
          />
          <PreferenceToggle
            icon={Home}
            title="Accommodation needed"
            description="Let employers know that you require accommodation."
            checked={Boolean(accommodationNeeded)}
            onChange={setAccommodationNeeded}
          />
        </div>
        {accommodationNeeded && (
          <Field label="Accommodation notes" className="mt-4">
            <textarea className={fieldClass} rows={3} value={accommodationNotes || ''} onChange={(event) => setAccommodationNotes(event.target.value)} />
          </Field>
        )}
      </section>



      

      <section className={cardClass}>
        <h2 className="mb-4 border-b border-white/10 pb-3 text-lg font-black">Device Preference</h2>
        <PreferenceToggle
          icon={Leaf}
          title="Battery saver"
          description="This device sends location updates less often while you are online."
          checked={batterySaver}
          onChange={(checked) => {
            setBatterySaver(checked);
            localStorage.setItem('battery_saver', String(checked));
          }}
        />
      </section>

      <section className={cardClass}>
        <h2 className="mb-2 flex items-center gap-2 text-lg font-black"><UserCheck className="h-5 w-5 text-[#1cd188]" /> Guarantor Status</h2>
        <p className="mb-4 text-xs text-slate-400">Status is read from your saved driver profile.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <GuarantorCard label="Guarantor A" name={kycData?.guarantorA_name} phone={kycData?.guarantorA_phone} occupation={kycData?.guarantorA_occupation} />
          <GuarantorCard label="Guarantor B" name={kycData?.guarantorB_name} phone={kycData?.guarantorB_phone} occupation={kycData?.guarantorB_occupation} />
        </div>
        <button type="button" onClick={() => setActiveTab('compliance')} className="mt-4 text-sm font-bold text-[#1cd188] hover:text-emerald-300">
          Open documents and verification
        </button>
      </section>

      <section className={cardClass}>
        <h2 className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-lg font-black"><Lock className="h-5 w-5 text-[#1cd188]" /> Change Password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password">
            <PasswordInput value={currentPassword} onChange={setCurrentPassword} visible={showCurrentPassword} setVisible={setShowCurrentPassword} autoComplete="current-password" />
          </Field>
          <span className="hidden sm:block" />
          <Field label="New password">
            <PasswordInput value={newPassword} onChange={setNewPassword} visible={showNewPassword} setVisible={setShowNewPassword} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} visible={showConfirmPassword} setVisible={setShowConfirmPassword} autoComplete="new-password" />
          </Field>
        </div>
        {passwordMessage && <p className="mt-3 text-sm text-[#1cd188]" role="status">{passwordMessage}</p>}
        <button type="button" onClick={handlePasswordUpdate} className="mt-4 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold transition hover:border-[#1cd188]/50">
          Update password
        </button>
      </section>

      <div className="sticky bottom-20 z-20 flex justify-end">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[#1cd188] px-6 py-3 font-black text-[#0f172a] shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, className = '', children }) => (
  <label className={`block space-y-1.5 ${className}`}>
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
    {children}
  </label>
);

const PreferenceToggle = ({ icon: Icon, title, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-slate-700">
    <span className="flex items-center gap-3">
      {Icon && <Icon className="h-5 w-5 shrink-0 text-[#1cd188]" />}
      <span>
        <span className="block text-sm font-bold text-white">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{description}</span>
      </span>
    </span>
    <div className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[#1cd188]' : 'bg-slate-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only" />
  </label>
);

const GuarantorCard = ({ label, name, phone, occupation }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-bold">{label}</span>
      <span className={`text-xs font-bold ${name ? 'text-[#1cd188]' : 'text-slate-500'}`}>
        {name ? 'Submitted' : 'Not provided'}
      </span>
    </div>
    {name && (
      <div className="mt-3 space-y-1 text-xs text-slate-400">
        <p>Name: {name}</p>
        {phone && <p>Phone: {phone}</p>}
        {occupation && <p>Occupation: {occupation}</p>}
      </div>
    )}
  </div>
);

const PasswordInput = ({ value, onChange, visible, setVisible, autoComplete }) => (
  <span className="relative block">
    <input
      className={`${fieldClass} pr-12`}
      type={visible ? 'text' : 'password'}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
    />
    <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </span>
);

export default DriverSettingsTab;
