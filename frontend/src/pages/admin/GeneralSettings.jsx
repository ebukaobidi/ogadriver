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
  Briefcase
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
    disputeResolutionSLA: '48 hours'
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
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
                    value={settings.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">HQ Coordinates</label>
                  <textarea
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brandMint transition-colors resize-none"
                  />
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

          </div>
        </main>
      </div>
    </div>
  );
}

export default GeneralSettings;
