import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Briefcase, 
  Calendar, 
  Moon, 
  Building2,
  Sparkles
} from 'lucide-react';
import { driverService } from '../../api/drivers';

const WorkAvailabilityScreen = ({ 
  driver, 
  setDriver, 
  employmentTypes, 
  setEmploymentTypes, 
  onClose 
}) => {
  const [selectedTypes, setSelectedTypes] = useState(
    Array.isArray(employmentTypes) ? employmentTypes : (driver?.employment_types || [])
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cardClass = 'rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-5 shadow-lg sm:p-6';

  const OPTIONS = [
    { 
      value: 'full_time', 
      label: 'Full-Time Employment', 
      description: 'Available for daily dedicated 8-hour to 12-hour chauffeur positions.',
      icon: Briefcase 
    },
    { 
      value: 'part_time', 
      label: 'Part-Time / Shift Work', 
      description: 'Available for flexible part-time hours, morning or afternoon shifts.',
      icon: Clock 
    },
    { 
      value: 'weekend', 
      label: 'Weekend Exclusive', 
      description: 'Available on Saturdays and Sundays for event, church, and leisure driving.',
      icon: Calendar 
    },
    { 
      value: 'corporate_contract', 
      label: 'Corporate / Fleet Contract', 
      description: 'Available for long-term corporate enterprise contracts and VIP clients.',
      icon: Building2 
    },
    { 
      value: 'interstate', 
      label: 'Interstate / Long-Haul Trips', 
      description: 'Available for travel across state boundaries and multi-day travel.',
      icon: Sparkles 
    },
    { 
      value: 'night_shift', 
      label: 'Night Shift / Late Night', 
      description: 'Available for evening, airport overnight runs, and night shifts.',
      icon: Moon 
    },
  ];

  const handleToggle = (value) => {
    setSelectedTypes(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      if (setEmploymentTypes) setEmploymentTypes(updated);
      return updated;
    });
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
        employment_types: selectedTypes,
        available_for_interstate: selectedTypes.includes('interstate')
      });

      if (setDriver) {
        setDriver(prev => ({
          ...prev,
          employment_types: selectedTypes,
          available_for_interstate: selectedTypes.includes('interstate')
        }));
      }

      setSuccess('Work availability preferences saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save availability.');
    } finally {
      setSaving(false);
    }
  };

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
            <Clock className="h-5 w-5 text-[#1cd188]" />
            Work Availability & Schedule Preferences
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Select the contract types and working hours you are open to. Hirers will see these availability badges on your public directory profile.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 mb-6">
          {OPTIONS.map((option) => {
            const isSelected = selectedTypes.includes(option.value);
            const Icon = option.icon;
            return (
              <label 
                key={option.value} 
                onClick={() => handleToggle(option.value)}
                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150 active:scale-[0.99] ${
                  isSelected 
                    ? 'border-[#1cd188] bg-[#1cd188]/15 shadow-lg shadow-[#1cd188]/10' 
                    : 'border-white/10 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-[#1cd188] text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{option.label}</span>
                    <div className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${isSelected ? 'bg-[#1cd188]' : 'bg-slate-700'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isSelected ? 'translate-x-4' : 'translate-x-1'}`} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{option.description}</p>
                </div>
              </label>
            );
          })}
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
                <span>Save Availability Preferences</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default WorkAvailabilityScreen;
