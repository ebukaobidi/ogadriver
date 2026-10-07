import { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Save,
  Globe,
  Mail,
  MapPin,
  Clock,
  Building,
  CheckCircle,
  Settings,
  Menu,
  ShieldCheck,
  Briefcase,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';
import { adminService } from '../../api/admin';
import { useEffect } from 'react';

function GeneralSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'OgaDriver',
    siteUrl: 'https://ogadriver.ng',
    siteDescription: 'Nigeria\'s premier peer-to-peer operative directory and matchmaking platform.',
    contactEmail: 'command@ogadriver.ng',
    supportEmail: 'sos@ogadriver.ng',
    contactPhone: '+234 800 123 4567',
    address: 'HQ, Lagos Island, Lagos, Nigeria',
    timezone: 'Africa/Lagos',
    currency: 'NGN',
    currencySymbol: '₦',
    language: 'en',
    companyRegistration: 'RC1234567',
    taxId: 'TAX-987654321',
    baseAccessFee: 10000,
    disputeResolutionSLA: '48 hours',
    tawktoPropertyId: '',
    whatsappNumber: '',
    whatsappMessage: '',
    fuelPricePerLiter: 950,
    baselineFuelPrice: 700,
    defaultRatePerKm: 250,
    defaultRatePerMin: 30,
    minimumFare: 1000,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [clearingCache, setClearingCache] = useState(null);
  const [cacheMessage, setCacheMessage] = useState(null);

  useEffect(() => {
    loadSettings();
    loadCacheStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminService.getGeneralSettings();
      if (response.status === 'success') {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await adminService.updateGeneralSettings(settings);
      if (response.status === 'success') {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCacheStatus = async () => {
    try {
      const response = await adminService.getCacheStatus();
      if (response.status === 'success') {
        setCacheStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to load cache status:', err);
    }
  };

  const handleClearCache = async (cacheType) => {
    if (!window.confirm(`Are you sure you want to clear ${cacheType} cache? This will force users to refresh their data.`)) {
      return;
    }

    setClearingCache(cacheType);
    setCacheMessage(null);
    
    try {
      const response = await adminService.clearCache(cacheType);
      if (response.status === 'success') {
        setCacheMessage({
          type: 'success',
          text: `Successfully cleared: ${response.data.cleared_caches.join(', ')}`
        });
        await loadCacheStatus();
        setTimeout(() => setCacheMessage(null), 5000);
      }
    } catch (err) {
      setCacheMessage({
        type: 'error',
        text: 'Failed to clear cache: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setClearingCache(null);
    }
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
              <Settings className="text-slate-400" size={20} /> System Settings
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Globe className="text-brandMint" /> Global Configuration
              </h1>
              <p className="text-slate-400 mt-1">Manage core platform variables, taxonomy, and operational SLAs.</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-brandMint text-corporateNavy hover:bg-emerald-400 px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-corporateNavy"></div>
              ) : (
                <>
                  <Save size={16} /> Deploy Changes
                </>
              )}
            </button>
          </div>

          {saved && (
            <div className="mb-6 bg-brandMint/10 border border-brandMint/30 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-brandMint" />
              <span className="text-brandMint font-bold uppercase tracking-wider text-sm">Configuration Deployed Successfully</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Identity Array */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Globe size={18} className="text-blue-400" /> Platform Identity Matrix
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Platform Designation</label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Root Domain URL</label>
                  <input
                    type="url"
                    name="siteUrl"
                    value={settings.siteUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Operational Protocol (Description)</label>
                  <textarea
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brandMint mb-2">Platform Font Style</label>
                  <select
                    name="primaryFont"
                    value={settings.primaryFont || 'Inter'}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors font-bold"
                  >
                    <option value="Inter">Inter (Default)</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Changes apply globally to Web and Mobile Apps.</p>
                </div>
              </div>
            </div>

            {/* Comm Vectors */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Mail size={18} className="text-brandMint" /> Communication Vectors
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Primary Relay Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-brandMint font-mono focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Emergency/SOS Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-red-400 font-mono focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Secure Line (Phone)</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={settings.contactPhone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Customer Care Number 1 (Chat)</label>
                  <input
                    type="tel"
                    value={settings.customerCareNumbers?.[0] || ''}
                    onChange={(e) => {
                      const newNums = [...(settings.customerCareNumbers || ['', ''])];
                      newNums[0] = e.target.value;
                      setSettings(prev => ({ ...prev, customerCareNumbers: newNums }));
                    }}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Customer Care Number 2</label>
                  <input
                    type="tel"
                    value={settings.customerCareNumbers?.[1] || ''}
                    onChange={(e) => {
                      const newNums = [...(settings.customerCareNumbers || ['', ''])];
                      newNums[1] = e.target.value;
                      setSettings(prev => ({ ...prev, customerCareNumbers: newNums }));
                    }}
                    placeholder="+234 800 000 0001"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">HQ Coordinates</label>
                  <textarea
                    name="address"
                    value={settings.address || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
            
            {/* Support & Chat Configuration */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Settings size={18} className="text-emerald-400" /> Support & Chat Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">WhatsApp Number (Direct Chat)</label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={settings.whatsappNumber || ''}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">WhatsApp Welcome Message</label>
                  <input
                    type="text"
                    name="whatsappMessage"
                    value={settings.whatsappMessage || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tawk.to Property ID</label>
                  <input
                    type="text"
                    name="tawktoPropertyId"
                    value={settings.tawktoPropertyId || ''}
                    onChange={handleChange}
                    placeholder="65xxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors font-mono text-sm"
                  />
                  <p className="mt-1 text-[10px] text-slate-500 italic">Leaves this blank to disable Tawk.to live chat.</p>
                </div>
              </div>
            </div>

            {/* P2P Matchmaking Config */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <ShieldCheck size={18} className="text-amber-500" /> Peer-to-Peer Matchmaking Params
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Base Access Fee (₦)</label>
                  <input
                    type="number"
                    name="baseAccessFee"
                    value={settings.baseAccessFee}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-500 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Dispute SLA</label>
                  <input
                    type="text"
                    name="disputeResolutionSLA"
                    value={settings.disputeResolutionSLA}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Fuel / Gas & Dynamic Ride Pricing Engine */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Zap size={18} className="text-brandMint" /> Fuel / Gas & Dynamic Ride Fare Engine
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Real-world fuel prices and base rates dynamically scale on-demand ride fares across Nigeria to protect driver earnings (0% commission).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Live PMS Fuel / Gas Price (₦/Litre)</label>
                  <input
                    type="number"
                    name="fuelPricePerLiter"
                    value={settings.fuelPricePerLiter || 950}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-brandMint font-mono font-bold focus:outline-none focus:border-brandMint transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Updating this instantly adjusts all ride fare calculations live.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Baseline Fuel Price (₦/Litre)</label>
                  <input
                    type="number"
                    name="baselineFuelPrice"
                    value={settings.baselineFuelPrice || 700}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-brandMint transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Standard baseline (₦700/L). Fares scale when current fuel &gt; baseline.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Minimum Ride Fare (₦)</label>
                  <input
                    type="number"
                    name="minimumFare"
                    value={settings.minimumFare || 1000}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Default Rate per KM (₦)</label>
                  <input
                    type="number"
                    name="defaultRatePerKm"
                    value={settings.defaultRatePerKm || 250}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Default Rate per Minute (₦)</label>
                  <input
                    type="number"
                    name="defaultRatePerMin"
                    value={settings.defaultRatePerMin || 30}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <MapPin size={18} className="text-purple-400" /> Regional Overrides
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Timezone</label>
                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Entity */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Building size={18} className="text-blue-500" /> Entity Registration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Corporate Reg Number (CAC)</label>
                  <input
                    type="text"
                    name="companyRegistration"
                    value={settings.companyRegistration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-brandMint"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">TIN (Tax ID)</label>
                  <input
                    type="text"
                    name="taxId"
                    value={settings.taxId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-brandMint"
                  />
                </div>
              </div>
            </div>

            {/* Cache Management */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <RefreshCw size={18} className="text-brandMint" /> Cache Management
              </h3>

              {cacheMessage && (
                <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                  cacheMessage.type === 'success' 
                    ? 'bg-brandMint/10 border border-brandMint/30 text-brandMint' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {cacheMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  <span className="font-bold text-sm">{cacheMessage.text}</span>
                </div>
              )}

              <div className="mb-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Cache Status</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Driver:</span>
                    <span className="text-white font-mono ml-2">{cacheStatus?.cache_driver || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tag Support:</span>
                    <span className={`font-mono ml-2 ${cacheStatus?.supports_tags ? 'text-brandMint' : 'text-amber-400'}`}>
                      {cacheStatus?.supports_tags ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cacheStatus?.cache_types && Object.entries(cacheStatus.cache_types).map(([key, description]) => (
                  <button
                    key={key}
                    onClick={() => handleClearCache(key)}
                    disabled={clearingCache === key}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-brandMint/50 hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {clearingCache === key ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brandMint"></div>
                    ) : (
                      <Trash2 size={18} className="text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-slate-300 uppercase">{key}</span>
                    <span className="text-[10px] text-slate-500 text-center leading-tight">{description}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200">
                  Clearing cache will force all users to refresh their data from the server. Use this when deploying critical updates or when users are experiencing stale data issues.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default GeneralSettings;
