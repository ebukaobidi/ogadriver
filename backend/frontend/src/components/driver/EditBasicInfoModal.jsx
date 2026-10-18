import React from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const fieldClass = 'w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#1cd188] focus:outline-none';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400';

const Field = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);

export default function EditBasicInfoModal({
  isOpen,
  onClose,
  fullName, setFullName,
  nickname, setNickname,
  email, setEmail,
  phone, setPhone,
  gender, setGender,
  dateOfBirth, setDateOfBirth,
  languages, setLanguages,
  residenceStateId, setResidenceStateId,
  dbStates,
  residenceCityId, setResidenceCityId,
  dbCitiesResidence,
  handleSaveProfile,
  emergencyContactName, setEmergencyContactName,
  emergencyContactPhone, setEmergencyContactPhone,
}) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const onSave = async () => {
    setError('');
    setSaving(true);
    try {
      const success = await handleSaveProfile();
      if (success !== false) {
        onClose();
      } else {
        setError('Could not save basic info. Please check fields.');
      }
    } catch (e) {
      setError(e.message || 'Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-slate-900/50">
          <h2 className="text-lg font-black text-white">Basic Information</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Official Full Name (on License/Docs)">
              <input className={fieldClass} value={fullName || ''} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Chukwuemeka Okafor" />
              <p className="text-[10px] text-slate-400 mt-1">Official name as appears on your driver's license.</p>
            </Field>
            <Field label="Nickname / Display Name">
              <input className={fieldClass} value={nickname || ''} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Oga Johnny" />
              <p className="text-[10px] text-slate-400 mt-1">Friendly name shown to hirers and riders.</p>
            </Field>
            <Field label="Email Address">
              <input className={`${fieldClass} opacity-60 cursor-not-allowed`} type="email" value={email || ''} disabled readOnly />
              <p className="text-[10px] text-slate-500 mt-1">Email cannot be changed.</p>
            </Field>
            <Field label="Phone">
              <input className={fieldClass} type="tel" value={phone || ''} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            
            <Field label="Gender">
              <select className={fieldClass} value={gender || ''} onChange={(e) => setGender(e.target.value)}>
                <option value="">Not provided</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Date of birth">
              <input className={fieldClass} type="date" value={(dateOfBirth || '').slice(0, 10)} onChange={(e) => setDateOfBirth(e.target.value)} />
            </Field>
            <Field label="Languages (comma separated)" className="sm:col-span-2">
              <input
                className={fieldClass}
                value={Array.isArray(languages) ? languages.join(', ') : ''}
                onChange={(e) => setLanguages(e.target.value.split(',').map(l => l.trim()).filter(Boolean))}
              />
            </Field>
            <Field label="State">
              <select className={fieldClass} value={residenceStateId || ''} onChange={(e) => setResidenceStateId(e.target.value)}>
                <option value="">Not provided</option>
                {(dbStates || []).map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
              </select>
            </Field>
            <Field label="City">
              <select className={fieldClass} value={residenceCityId || ''} onChange={(e) => setResidenceCityId(e.target.value)}>
                <option value="">Not provided</option>
                {(dbCitiesResidence || []).map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
            </Field>
            
            <div className="sm:col-span-2 mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-black text-white mb-3">SOS Emergency Contact</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact Name">
                  <input className={fieldClass} value={emergencyContactName || ''} onChange={(e) => setEmergencyContactName(e.target.value)} />
                </Field>
                <Field label="Contact Phone">
                  <input className={fieldClass} type="tel" value={emergencyContactPhone || ''} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-5 bg-slate-900/80">
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1cd188] p-4 text-sm font-bold text-[#0f172a] transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
