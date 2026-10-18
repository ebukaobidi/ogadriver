import React, { useState } from 'react';
import { 
  Car, 
  DollarSign, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Info
} from 'lucide-react';
import { driverService } from '../../api/drivers';

const fieldClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#1cd188] focus:outline-none transition';
const cardClass = 'rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl p-5 shadow-lg sm:p-6';

const Field = ({ label, className = '', children, hint }) => (
  <label className={`block space-y-1.5 ${className}`}>
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
    {children}
    {hint && <span className="block text-[10px] text-slate-500">{hint}</span>}
  </label>
);

const VehicleAndRatesScreen = ({
  driver,
  setDriver,
  serviceMode,
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
  dailyRate,
  setDailyRate,
  monthlyRate,
  setMonthlyRate,
  onNavigateToDocs,
  onClose
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isVehicleRequired = serviceMode === 'driver_with_vehicle' || serviceMode === 'both';

  const handleSave = async (shouldNavigateToDocs = false) => {
    if (!driver?.id) {
      setError('Driver ID not available. Please sign in again.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_year: vehicleYear,
        vehicle_color: vehicleColor,
        license_plate: licensePlate,
        expected_daily_rate: dailyRate,
        expected_monthly_rate: monthlyRate,
        daily_rate: dailyRate,
        monthly_rate: monthlyRate
      };

      await driverService.updateProfile(driver.id, payload);

      if (setDriver) {
        setDriver(prev => ({
          ...prev,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear,
          vehicle_color: vehicleColor,
          license_plate: licensePlate,
          expected_daily_rate: dailyRate,
          expected_monthly_rate: monthlyRate
        }));
      }

      setSuccess('Vehicle specifications & expected rates saved successfully!');

      if (shouldNavigateToDocs && onNavigateToDocs) {
        setTimeout(() => {
          onNavigateToDocs('compliance');
        }, 300);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save vehicle and rates.');
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

      {/* Vehicle Specification Form */}
      <section className={cardClass}>
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Car className="h-5 w-5 text-[#1cd188]" />
              Vehicle Specifications & Registration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isVehicleRequired 
                ? 'Provide accurate vehicle information for dispatch, insurance matching, and passenger trust.' 
                : 'You are currently set as Fleet Operative. You can still set your expected earnings rates below.'}
            </p>
          </div>
          {isVehicleRequired && (
            <span className="text-[10px] font-bold text-[#1cd188] bg-[#1cd188]/10 px-3 py-1 rounded-full border border-[#1cd188]/20">
              Vehicle Track Active
            </span>
          )}
        </div>

        {isVehicleRequired ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vehicle Make" hint="e.g. Toyota, Honda, Hyundai">
                <input 
                  className={fieldClass} 
                  value={vehicleMake || ''} 
                  onChange={(e) => setVehicleMake(e.target.value)} 
                  placeholder="Toyota"
                />
              </Field>
              <Field label="Vehicle Model" hint="e.g. Corolla, Camry, Elantra">
                <input 
                  className={fieldClass} 
                  value={vehicleModel || ''} 
                  onChange={(e) => setVehicleModel(e.target.value)} 
                  placeholder="Corolla"
                />
              </Field>
              <Field label="Manufacturing Year" hint="e.g. 2018">
                <input 
                  className={fieldClass} 
                  type="number" 
                  min="2000" 
                  max="2027" 
                  value={vehicleYear || ''} 
                  onChange={(e) => setVehicleYear(e.target.value)} 
                  placeholder="2018"
                />
              </Field>
              <Field label="Vehicle Exterior Color">
                <input 
                  className={fieldClass} 
                  value={vehicleColor || ''} 
                  onChange={(e) => setVehicleColor(e.target.value)} 
                  placeholder="Silver / Black / White"
                />
              </Field>
              <Field label="License Plate Number" className="sm:col-span-2" hint="Official state registration number">
                <input 
                  className={`${fieldClass} font-mono uppercase`} 
                  value={licensePlate || ''} 
                  onChange={(e) => setLicensePlate(e.target.value)} 
                  placeholder="LAG-123-XY"
                />
              </Field>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-4 mb-4 flex items-center gap-3 text-slate-400 text-xs">
            <Info className="h-5 w-5 text-blue-400 shrink-0" />
            <span>Vehicle specifications are optional for Fleet Operatives since your vehicle is provided by the employer.</span>
          </div>
        )}

        {/* Expected Earnings Rates */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-[#1cd188]" />
            Expected Hire Rates (Negotiation Benchmark)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Expected Daily Rate (₦)" hint="Daily hire / short-term contracts">
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">₦</span>
                <input 
                  className={`${fieldClass} pl-8`} 
                  type="number" 
                  min="1000" 
                  step="500" 
                  value={dailyRate ?? ''} 
                  onChange={(e) => setDailyRate(e.target.value)} 
                  placeholder="15,000"
                />
              </div>
            </Field>
            <Field label="Expected Monthly Rate (₦)" hint="Full-time / monthly private chauffeur contracts">
              <div className="relative">
                <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">₦</span>
                <input 
                  className={`${fieldClass} pl-8`} 
                  type="number" 
                  min="10000" 
                  step="5000" 
                  value={monthlyRate ?? ''} 
                  onChange={(e) => setMonthlyRate(e.target.value)} 
                  placeholder="150,000"
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 py-3.5 px-4 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Details…</span>
              </>
            ) : (
              <span>Save Vehicle & Rates</span>
            )}
          </button>

          {isVehicleRequired && (
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1cd188] to-emerald-400 py-3.5 px-4 text-xs font-black text-slate-950 shadow-lg shadow-[#1cd188]/25 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Vehicle Papers & Inspection</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* Vehicle Documents & Inspection Card */}
      {isVehicleRequired && (
        <section className={cardClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Vehicle Verification & Inspection Documents
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                To start receiving high-value rides, upload your Vehicle License, Insurance Certificate, MOT Inspection, and Photos in the Compliance hub.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onNavigateToDocs) onNavigateToDocs('compliance');
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 py-3 text-xs font-bold text-white transition"
          >
            <Upload className="h-4 w-4 text-[#1cd188]" />
            <span>Open Compliance Document Upload Screen</span>
          </button>
        </section>
      )}
    </div>
  );
};

export default VehicleAndRatesScreen;
