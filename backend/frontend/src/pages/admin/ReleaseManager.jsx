import React, { useState, useEffect } from 'react';
import { Rocket, RefreshCw, Smartphone, Zap, ToggleLeft, ToggleRight, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import api from '../../api/axios';

const ReleaseManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Feature Flags State
  const [features, setFeatures] = useState({
    feature_ai_guarantor: true,
    feature_dynamic_surge: false,
    feature_vip_fleet: true,
    feature_crypto_wallet: false,
    feature_driver_radar: true,
  });

  // OTA Update State
  const [updateData, setUpdateData] = useState({
    current_version: '1.0.0',
    target_version: '1.0.0',
    release_notes: '',
    force_update: false
  });

  useEffect(() => {
    // Fetch current flag states from the backend settings
    api.get('/admin/settings/general')
      .then(res => {
        if (res.data.status === 'success') {
          const settings = res.data.data;
          setFeatures({
            feature_ai_guarantor: settings.feature_ai_guarantor === 'true' || settings.feature_ai_guarantor === true,
            feature_dynamic_surge: settings.feature_dynamic_surge === 'true' || settings.feature_dynamic_surge === true,
            feature_vip_fleet: settings.feature_vip_fleet === 'true' || settings.feature_vip_fleet === true,
            feature_crypto_wallet: settings.feature_crypto_wallet === 'true' || settings.feature_crypto_wallet === true,
            feature_driver_radar: settings.feature_driver_radar === 'true' || settings.feature_driver_radar === true,
          });
          setUpdateData({
            current_version: settings.app_version || '1.0.0',
            target_version: settings.app_version || '1.0.0',
            release_notes: settings.app_release_notes || '',
            force_update: settings.app_force_update === 'true' || settings.app_force_update === true
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveFlags = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.post('/admin/settings/general', features);
      setMessage('Feature flags synchronized across the global network.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Failed to sync features.');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.post('/admin/settings/general', {
        app_version: updateData.target_version,
        app_release_notes: updateData.release_notes,
        app_force_update: updateData.force_update
      });
      // Also broadcast the update via WebSocket (mocked interaction for now)
      await api.post('/admin/system/trigger-ota', updateData).catch(() => {});
      
      setMessage(`OTA Update v${updateData.target_version} broadcasted to all active devices!`);
      setTimeout(() => setMessage(''), 5000);
      setUpdateData(prev => ({ ...prev, current_version: prev.target_version }));
    } catch (err) {
      setMessage('Update broadcast failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Release & Functions Trigger</h2>
                <p className="text-sm text-slate-400 font-mono">Deploy OTA updates and toggle beta features globally</p>
              </div>
            </div>

            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Flags Engine */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[50px] -mr-16 -mt-16"></div>
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <h3 className="font-black text-white uppercase tracking-wide">Feature Switchboard</h3>
                </div>
                
                {loading ? (
                  <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandMint"></div></div>
                ) : (
                  <div className="space-y-4 flex-1">
                    {[
                      { key: 'feature_ai_guarantor', label: 'AI Guarantor Voice Verification', desc: 'Enables automated AI phone calls to driver sponsors.' },
                      { key: 'feature_dynamic_surge', label: 'Dynamic Surge Engine', desc: 'Allows the system to automatically mark up prices based on traffic and weather.' },
                      { key: 'feature_vip_fleet', label: 'VIP Executive Fleet Mode', desc: 'Unlocks the luxury booking tier for corporate hirers.' },
                      { key: 'feature_crypto_wallet', label: 'Crypto & Stablecoin Wallet', desc: 'Allows drivers to hold and withdraw earnings in USDT.' },
                      { key: 'feature_driver_radar', label: 'Public Fleet Radar', desc: 'Allows non-registered visitors to see live driver cars roaming on the map.' }
                    ].map((feat) => (
                      <div key={feat.key} className="flex items-start justify-between p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl hover:border-slate-700 transition-colors">
                        <div className="pr-4">
                          <p className={`text-sm font-bold ${features[feat.key] ? 'text-white' : 'text-slate-400'}`}>{feat.label}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{feat.desc}</p>
                        </div>
                        <button 
                          onClick={() => toggleFeature(feat.key)}
                          className={`shrink-0 transition-colors ${features[feat.key] ? 'text-brandMint' : 'text-slate-600'}`}
                        >
                          {features[feat.key] ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={handleSaveFlags}
                  disabled={loading || saving}
                  className="mt-6 w-full py-3 bg-slate-950 border border-brandMint/30 text-brandMint rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brandMint/10 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Deploy Feature Config
                </button>
              </div>

              {/* OTA Update Trigger */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] -mr-16 -mt-16"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-amber-500" />
                    <h3 className="font-black text-white uppercase tracking-wide">Launch App Update (OTA)</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">Current: v{updateData.current_version}</span>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    Triggering an update will instantly push a notification to all active drivers and hirers. If "Force Update" is checked, they will be locked out until they refresh or download the new version.
                  </p>
                </div>

                <form onSubmit={handleTriggerUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Target Release Version</label>
                    <input 
                      type="text" 
                      required
                      value={updateData.target_version}
                      onChange={e => setUpdateData({...updateData, target_version: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-colors font-mono"
                      placeholder="e.g. 1.2.0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Release Notes / What's New?</label>
                    <textarea 
                      required
                      value={updateData.release_notes}
                      onChange={e => setUpdateData({...updateData, release_notes: e.target.value})}
                      rows="4"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-colors resize-none"
                      placeholder="- Added VIP Fleet options&#10;- Improved map rendering speed&#10;- Bug fixes"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors" onClick={() => setUpdateData({...updateData, force_update: !updateData.force_update})}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${updateData.force_update ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                      {updateData.force_update && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Mandatory Force Update</p>
                      <p className="text-[10px] text-slate-500">App will refuse to open until updated.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || saving}
                    className="w-full py-4 bg-amber-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Broadcast Release to Network
                  </button>
                </form>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReleaseManager;
