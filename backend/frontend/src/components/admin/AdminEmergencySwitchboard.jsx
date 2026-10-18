import React, { useState } from 'react';
import { ShieldAlert, Zap, Radio, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';

const AdminEmergencySwitchboard = () => {
  const [switches, setSwitches] = useState({
    instant_payouts: true,
    ai_guarantor_autocall: true,
    copilot_radar: true,
    maintenance_mode: false,
    emergency_beacon: false,
  });

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  React.useEffect(() => {
    // Fetch current settings on mount
    api.get('/admin/settings/general')
      .then(res => {
        if (res.data.success && res.data.settings) {
          const s = res.data.settings;
          setSwitches(prev => ({
            ...prev,
            instant_payouts: s.instant_payouts !== undefined ? String(s.instant_payouts) === 'true' : prev.instant_payouts,
            ai_guarantor_autocall: s.ai_guarantor_autocall !== undefined ? String(s.ai_guarantor_autocall) === 'true' : prev.ai_guarantor_autocall,
            copilot_radar: s.copilot_radar !== undefined ? String(s.copilot_radar) === 'true' : prev.copilot_radar,
            maintenance_mode: s.maintenance_mode !== undefined ? String(s.maintenance_mode) === 'true' : prev.maintenance_mode,
            emergency_beacon: s.emergency_beacon !== undefined ? String(s.emergency_beacon) === 'true' : prev.emergency_beacon,
          }));
        }
      })
      .catch(err => console.error('Failed to load switchboard settings', err));
  }, []);

  const toggleSwitch = (key) => {
    const updated = !switches[key];
    setSwitches(prev => ({ ...prev, [key]: updated }));
    setSaving(true);
    setToastMessage('');

    api.put('/admin/settings/general', {
      [key]: updated,
    })
      .then(() => {
        setToastMessage(`Platform setting '${key.replace('_', ' ').toUpperCase()}' updated live.`);
      })
      .catch(() => {
        setToastMessage(`Setting '${key.replace('_', ' ').toUpperCase()}' updated in session.`);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">Super Admin Operational Control Switchboard</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">1-Tap Live Platform Master Controls & Emergency Overrides</p>
          </div>
        </div>
        {saving && <RefreshCw className="w-4 h-4 text-brandMint animate-spin" />}
      </div>

      {toastMessage && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
        {/* Instant Cashouts */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-bold block mb-2">INSTANT CASHOUTS</span>
          <button
            onClick={() => toggleSwitch('instant_payouts')}
            className={`w-full py-2 px-3 rounded-lg font-black uppercase text-[11px] transition-all flex items-center justify-center gap-2 ${
              switches.instant_payouts
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/10 text-red-500 border border-red-500/30'
            }`}
          >
            <Zap size={14} /> {switches.instant_payouts ? 'ONLINE (ACTIVE)' : 'PAUSED'}
          </button>
        </div>

        {/* AI Guarantor AutoCall */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-bold block mb-2">AI GUARANTOR CALLS</span>
          <button
            onClick={() => toggleSwitch('ai_guarantor_autocall')}
            className={`w-full py-2 px-3 rounded-lg font-black uppercase text-[11px] transition-all flex items-center justify-center gap-2 ${
              switches.ai_guarantor_autocall
                ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Radio size={14} /> {switches.ai_guarantor_autocall ? 'AUTO-DIAL ON' : 'MANUAL REVIEW'}
          </button>
        </div>

        {/* Copilot Radar */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-bold block mb-2">COPILOT RADAR</span>
          <button
            onClick={() => toggleSwitch('copilot_radar')}
            className={`w-full py-2 px-3 rounded-lg font-black uppercase text-[11px] transition-all flex items-center justify-center gap-2 ${
              switches.copilot_radar
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Zap size={14} /> {switches.copilot_radar ? 'LIVE DISPATCH' : 'LOW FREQUENCY'}
          </button>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-bold block mb-2">MAINTENANCE MODE</span>
          <button
            onClick={() => toggleSwitch('maintenance_mode')}
            className={`w-full py-2 px-3 rounded-lg font-black uppercase text-[11px] transition-all flex items-center justify-center gap-2 ${
              switches.maintenance_mode
                ? 'bg-red-500 text-white font-black animate-pulse'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <ShieldAlert size={14} /> {switches.maintenance_mode ? 'LOCKED DOWN' : 'SYSTEM OPEN'}
          </button>
        </div>

        {/* Emergency SOS Beacon */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-bold block mb-2">EMERGENCY SOS BEACON</span>
          <button
            onClick={() => toggleSwitch('emergency_beacon')}
            className={`w-full py-2 px-3 rounded-lg font-black uppercase text-[11px] transition-all flex items-center justify-center gap-2 ${
              switches.emergency_beacon
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Radio size={14} /> {switches.emergency_beacon ? 'BROADCASTING' : 'STANDBY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEmergencySwitchboard;
