import React, { useState } from 'react';
import { 
  Car, 
  Briefcase, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Upload, 
  FileText, 
  Loader2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { driverService } from '../../api/drivers';

const DriverStatusScreen = ({ 
  driver, 
  setDriver, 
  serviceMode, 
  setServiceMode, 
  onNavigateToDocs, 
  onClose 
}) => {
  const [selectedMode, setSelectedMode] = useState(serviceMode || driver?.service_mode || 'driver_only');
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const [isSavingMode, setIsSavingMode] = useState(false);
  const [formError, setFormError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const isOnline = driver?.is_online === true;

  const toggleOnline = async () => {
    if (!driver?.id || !setDriver) {
      setFormError('Your driver account is unavailable. Please sign in again and retry.');
      return;
    }
    setIsTogglingOnline(true);
    setFormError('');
    try {
      const response = await driverService.toggleOnline(driver.id);
      const updatedStatus = response?.data?.is_online;
      if (typeof updatedStatus !== 'boolean') {
        throw new Error('The server did not return the updated driver status.');
      }
      setDriver((current) => ({ ...current, is_online: updatedStatus }));
      setSaveMessage(updatedStatus ? 'You are now ONLINE and ready to receive ride and job requests.' : 'You are now OFFLINE.');
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || 'Could not update your driver status.');
    } finally {
      setIsTogglingOnline(false);
    }
  };

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
    if (setServiceMode) setServiceMode(mode);
    setSaveMessage('');
    setFormError('');
  };

  const handleSaveMode = async (shouldNavigateToDocs = false) => {
    if (!driver?.id) {
      setFormError('Driver profile ID not found.');
      return;
    }
    setIsSavingMode(true);
    setFormError('');
    setSaveMessage('');

    try {
      const hasVehicle = selectedMode !== 'driver_only';
      const payload = {
        service_mode: selectedMode,
        has_vehicle: hasVehicle
      };

      await driverService.updateProfile(driver.id, payload);
      
      if (setDriver) {
        setDriver(prev => ({
          ...prev,
          service_mode: selectedMode,
          has_vehicle: hasVehicle
        }));
      }
      if (setServiceMode) {
        setServiceMode(selectedMode);
      }

      setSaveMessage('Driver status & employment track updated successfully!');

      if (shouldNavigateToDocs && onNavigateToDocs) {
        setTimeout(() => {
          onNavigateToDocs('compliance');
        }, 300);
      }
    } catch (error) {
      setFormError(error.response?.data?.message || error.message || 'Failed to save driver track.');
    } finally {
      setIsSavingMode(false);
    }
  };

  const cardClass = 'rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-5 shadow-lg sm:p-6';

  const TRACKS = [
    {
      value: 'driver_with_vehicle',
      title: 'Independent Operator',
      subtitle: 'Driver with Own/Leased Vehicle',
      description: 'Operate your own vehicle for private hire, on-demand rides, and scheduled executive runs.',
      icon: Car,
      color: 'emerald',
      badge: 'Vehicle Track',
      docs: [
        'Valid Driver\'s License (Front & Back)',
        'LASDRI Driver Certification Card (Lagos State Only)',
        'Vehicle Registration & License Papers',
        'Comprehensive / Third-Party Insurance',
        'MOT / Roadworthiness Inspection Certificate',
        'Vehicle Photos (Exterior 4-Sides & Interior)'
      ]
    },
    {
      value: 'driver_only',
      title: 'Fleet Operative',
      subtitle: 'Professional Chauffeur / Employer-Assigned Vehicle',
      description: 'Drive employer-provided vehicles, corporate VIP fleets, and full-time executive placements.',
      icon: Briefcase,
      color: 'blue',
      badge: 'Chauffeur Track',
      docs: [
        'Valid Driver\'s License (Front & Back)',
        'LASDRI Driver Certification Card',
        'Police Character Clearance Certificate',
        'Guarantor Form A (Digital Verification)',
        'Guarantor Form B (Executive Reference)',
        'Residential Address & KYC Verification'
      ]
    },
    {
      value: 'both',
      title: 'Hybrid Operator',
      subtitle: 'Ride-Hailing & Corporate Private Chauffeur',
      description: 'Maximum earning versatility: dispatch on-demand rides with your vehicle and take verified executive chauffeur contracts.',
      icon: UserCheck,
      color: 'purple',
      badge: 'Hybrid Dedicated Track',
      docs: [
        'Valid Driver\'s License (Front & Back)',
        'Professional Driving Experience Rating',
        'LASDRI Driver Certification Card (Lagos State Only)',
        'Police Character Clearance Certificate',
        'Vehicle Registration, Insurance & MOT Papers',
        'Apex Guarantor Safety Shield (1 Verified Executive Guarantor)'
      ]
    }
  ];

  const currentTrack = TRACKS.find(t => t.value === selectedMode) || TRACKS[0];

  return (
    <div className="min-h-screen bg-slate-950/80 p-4 sm:p-6 text-white max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {onClose && (
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold transition hover:bg-slate-800 shadow-md active:scale-95"
          >
            <ArrowRight className="w-4 h-4 text-[#1cd188] rotate-180" />
            <span>Back to Driver Hub</span>
          </button>
        </div>
      )}
      
      {/* Live Alerts */}
      {formError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 shadow-lg" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}
      {saveMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#1cd188]/30 bg-[#1cd188]/10 p-4 text-sm text-[#1cd188] shadow-lg" role="status">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1cd188]" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Online / Offline Availability Card */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-[#1cd188] animate-pulse' : 'bg-slate-500'}`} />
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Live Broadcast Status: {isOnline ? 'ONLINE' : 'OFFLINE'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {isOnline 
                ? 'Your location is active on the Naija Driver Market radar. Hirers can dispatch rides to you.' 
                : 'You are currently offline. Go online to start receiving ride requests and contracts.'}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleOnline}
            disabled={isTogglingOnline}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-black tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
              isOnline
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 shadow-rose-500/10'
                : 'bg-[#1cd188] text-slate-950 hover:bg-emerald-400 shadow-[#1cd188]/25'
            }`}
          >
            {isTogglingOnline ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>UPDATING…</span>
              </>
            ) : isOnline ? (
              <span>SWITCH TO OFFLINE</span>
            ) : (
              <span>GO ONLINE NOW</span>
            )}
          </button>
        </div>
      </section>

      {/* Employment / Service Mode Track Selection */}
      <section className={cardClass}>
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#1cd188]" />
            <h2 className="text-lg font-black text-white">Select Your Driver Status & Track</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Choose how you intend to work on OgaDriver. Selecting a track updates the verification checklist and required documents.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {TRACKS.map(({ value, title, subtitle, description, icon: Icon, badge }) => {
            const isSelected = selectedMode === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleSelectMode(value)}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#1cd188] bg-[#1cd188]/15 shadow-xl shadow-[#1cd188]/10 ring-2 ring-[#1cd188]/30'
                    : 'border-white/10 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-[#1cd188] text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-[#1cd188] bg-[#1cd188]/20 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> Selected
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md">
                        {badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white leading-tight">{title}</h3>
                  <p className="text-[11px] font-bold text-[#1cd188] mt-0.5 mb-2">{subtitle}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Required Documents Checklist Card for the selected track */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1cd188]" />
                Required Verification Documents for {currentTrack.title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete and upload these documents to get your badge verified and start working.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              {currentTrack.docs.length} Required Items
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 mb-6">
            {currentTrack.docs.map((docName, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900/80 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1cd188]/10 text-[#1cd188]">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-slate-200">{docName}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons: Save & Upload Documents */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSaveMode(false)}
              disabled={isSavingMode}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 py-3.5 px-4 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {isSavingMode ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Track…</span>
                </>
              ) : (
                <span>Save Track Selection</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSaveMode(true)}
              disabled={isSavingMode}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1cd188] to-emerald-400 py-3.5 px-4 text-xs font-black text-slate-950 shadow-lg shadow-[#1cd188]/25 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {isSavingMode ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>Proceed to Upload Required Documents</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DriverStatusScreen;
