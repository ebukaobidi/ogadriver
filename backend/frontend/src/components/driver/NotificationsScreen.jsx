import React, { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Mail, 
  Smartphone, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { driverService } from '../../api/drivers';

const PreferenceToggle = ({ icon: Icon, title, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition-all hover:border-slate-700 active:scale-[0.99]">
    <span className="flex items-center gap-3">
      {Icon && (
        <div className={`p-2 rounded-xl ${checked ? 'bg-[#1cd188]/20 text-[#1cd188]' : 'bg-slate-800 text-slate-400'}`}>
          <Icon className="h-5 w-5 shrink-0" />
        </div>
      )}
      <span>
        <span className="block text-sm font-bold text-white">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-400 leading-relaxed">{description}</span>
      </span>
    </span>
    <div className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[#1cd188]' : 'bg-slate-700'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)} 
      className="sr-only" 
    />
  </label>
);

const NotificationsScreen = ({ driver, setDriver, onClose }) => {
  const [notificationPreferences, setNotificationPreferences] = useState({
    jobAlerts: driver?.notification_preferences?.jobAlerts ?? true,
    email: driver?.notification_preferences?.email ?? true,
    security: driver?.notification_preferences?.security ?? true,
    smsAlerts: driver?.notification_preferences?.smsAlerts ?? false,
    payoutAlerts: driver?.notification_preferences?.payoutAlerts ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updatePreference = (key, value) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    if (!driver?.id) {
      setError('Driver ID not available. Please sign in again.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await driverService.updateProfile(driver.id, {
        notification_preferences: notificationPreferences
      });

      if (setDriver) {
        setDriver(prev => ({
          ...prev,
          notification_preferences: notificationPreferences
        }));
      }

      setSuccess('Notification preferences saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save notifications.');
    } finally {
      setSaving(false);
    }
  };

  const cardClass = 'rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-5 shadow-lg sm:p-6';

  return (
    <div className="min-h-screen bg-slate-950/80 p-4 sm:p-6 text-white max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 shadow-lg" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#1cd188]/30 bg-[#1cd188]/10 p-4 text-sm text-[#1cd188] shadow-lg" role="status">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1cd188]" />
          <span>{success}</span>
        </div>
      )}

      <section className={cardClass}>
        <div className="mb-5 border-b border-white/10 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#1cd188]" />
            Notifications & Dispatch Alerts
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Control which alerts and push notifications you receive for new trips, proposals, wallet payouts, and security.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <PreferenceToggle
            icon={Bell}
            title="Instant Job & Ride Alerts"
            description="Push notifications when a hirer nearby requests a ride or posts a matching contract."
            checked={notificationPreferences.jobAlerts === true}
            onChange={(checked) => updatePreference('jobAlerts', checked)}
          />
          <PreferenceToggle
            icon={DollarSign}
            title="Wallet Payout & Earning Alerts"
            description="Notifications when you receive trip payments, bonuses, or payout settlements."
            checked={notificationPreferences.payoutAlerts === true}
            onChange={(checked) => updatePreference('payoutAlerts', checked)}
          />
          <PreferenceToggle
            icon={Mail}
            title="Email Notifications"
            description="Summary digests of monthly earnings, booking confirmations, and tax receipts."
            checked={notificationPreferences.email === true}
            onChange={(checked) => updatePreference('email', checked)}
          />
          <PreferenceToggle
            icon={Smartphone}
            title="SMS Booking Confirmations"
            description="Receive critical trip dispatch instructions via SMS when your internet data is low."
            checked={notificationPreferences.smsAlerts === true}
            onChange={(checked) => updatePreference('smsAlerts', checked)}
          />
          <PreferenceToggle
            icon={Shield}
            title="Security & Account Access Alerts"
            description="Instant alerts for logins from new devices, KYC status changes, and PIN resets."
            checked={notificationPreferences.security === true}
            onChange={(checked) => updatePreference('security', checked)}
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1cd188] to-emerald-400 py-3.5 px-4 text-xs font-black text-slate-950 shadow-lg shadow-[#1cd188]/25 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Preferences…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Save Notification Preferences</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default NotificationsScreen;
