import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Save,
  Server,
  Key,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  Menu,
  Activity,
  CreditCard,
  Fingerprint
} from 'lucide-react';
import { adminService } from '../../api/admin';

function APIConfiguration() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showKeys, setShowKeys] = useState({});
  const [settings, setSettings] = useState({
    googleMapsKey: '',
    pushNotificationKey: '',
    opaySecretKey: '',
    opayPublicKey: '',
    moniepointSecretKey: '',
    nimcApiKey: '',
    bvnValidationKey: '',
    webhookSecret: '',
    enableWebhooks: false
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setInitialLoading(true);
    try {
      const response = await adminService.getApiSettings();
      if (response && (response.status === 'success' || response.data)) {
        setSettings(response.data || response);
      }
    } catch (err) {
      console.error('Failed to load API settings:', err);
      // Keep default settings if API fails
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleKeyVisibility = (keyName) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await adminService.updateApiSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save API settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewSecret = (e, keyName) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      [keyName]: `whsec_${Math.random().toString(36).substr(2, 24)}`
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block flex items-center gap-2">
              <Server className="text-purple-500" size={20} /> API Vault
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          {initialLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading API configuration...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Third-Party Integrations
              </h1>
              <p className="text-slate-400 mt-1">Manage API keys for Payment Gateways, Identity Verification, and Telemetry.</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={16} /> Seal Vault
                </>
              )}
            </button>
          </div>

          {saved && (
            <div className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-purple-500" />
              <span className="text-purple-500 font-bold uppercase tracking-wider text-sm">Vault Configurations Saved & Encrypted</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Payment Gateways (OPay, Moniepoint) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center justify-between pb-4 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-brandMint" /> Payment Gateways
                </div>
                <span className="flex items-center gap-1 text-[10px] bg-brandMint/10 text-brandMint px-2 py-0.5 rounded border border-brandMint/20">
                  <Activity size={10} className="animate-pulse" /> LIVE
                </span>
              </h3>
              
              <div className="space-y-4">
                {/* OPay */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">OPay Integration</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Public Key</label>
                      <input
                        type="text"
                        name="opayPublicKey"
                        value={settings.opayPublicKey}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Secret Key</label>
                      <div className="relative">
                        <input
                          type={showKeys['opaySecretKey'] ? 'text' : 'password'}
                          name="opaySecretKey"
                          value={settings.opaySecretKey}
                          onChange={handleChange}
                          className="w-full pl-3 pr-10 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-brandMint font-mono text-sm focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility('opaySecretKey')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showKeys['opaySecretKey'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Moniepoint */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Moniepoint Integration</h4>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Secret Key</label>
                    <div className="relative">
                      <input
                        type={showKeys['moniepointSecretKey'] ? 'text' : 'password'}
                        name="moniepointSecretKey"
                        value={settings.moniepointSecretKey}
                        onChange={handleChange}
                        className="w-full pl-3 pr-10 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-brandMint font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility('moniepointSecretKey')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showKeys['moniepointSecretKey'] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Verification (NIMC/BVN) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center justify-between pb-4 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <Fingerprint size={18} className="text-blue-500" /> Identity APIs
                </div>
              </h3>
              
              <div className="space-y-4">
                {/* NIMC */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">NIMC (National ID) API</h4>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Access Token</label>
                    <div className="relative">
                      <input
                        type={showKeys['nimcApiKey'] ? 'text' : 'password'}
                        name="nimcApiKey"
                        value={settings.nimcApiKey}
                        onChange={handleChange}
                        className="w-full pl-3 pr-10 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-blue-400 font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility('nimcApiKey')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showKeys['nimcApiKey'] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* BVN */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">NIBSS BVN Validation</h4>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">API Key</label>
                    <div className="relative">
                      <input
                        type={showKeys['bvnValidationKey'] ? 'text' : 'password'}
                        name="bvnValidationKey"
                        value={settings.bvnValidationKey}
                        onChange={handleChange}
                        className="w-full pl-3 pr-10 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-blue-400 font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility('bvnValidationKey')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showKeys['bvnValidationKey'] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Infrastructure */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Database size={18} className="text-amber-500" /> Core Infrastructure & Telemetry
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Google Maps API (Telemetry Feed)</label>
                  <div className="relative">
                    <input
                      type={showKeys['googleMapsKey'] ? 'text' : 'password'}
                      name="googleMapsKey"
                      value={settings.googleMapsKey}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-500 font-mono text-sm focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility('googleMapsKey')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showKeys['googleMapsKey'] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Required for Live Operative Radar mapping.</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Global Webhook Secret</label>
                    <button
                      onClick={(e) => generateNewSecret(e, 'webhookSecret')}
                      className="text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <RefreshCw size={10} /> Rotate Secret
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys['webhookSecret'] ? 'text' : 'password'}
                      name="webhookSecret"
                      value={settings.webhookSecret}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-purple-400 font-mono text-sm focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility('webhookSecret')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showKeys['webhookSecret'] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Used to sign payloads sent to external listeners.</p>
                </div>
              </div>
            </div>
          </div>
          </>
        )}
      </main>
    </div>
  </div>
);
}

export default APIConfiguration;
