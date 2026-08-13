import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Menu,
  Key,
  Shield,
  Brain,
  CreditCard,
  Cloud,
  Phone,
  Save,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';
import api from '../../api/axios';

const ApiSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [source, setSource] = useState('cache');
  const [expandedCategory, setExpandedCategory] = useState('ai');

  const settingCategories = {
    ai: {
      name: 'AI Services',
      icon: <Brain size={20} />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      settings: [
        { key: 'aiServiceProvider', label: 'AI Service Provider', type: 'select', options: ['google', 'aws', 'custom'], description: 'Provider for AI verification services' },
        { key: 'googleCloudProjectId', label: 'Google Cloud Project ID', type: 'text', description: 'Google Cloud project identifier' },
        { key: 'googleSpeechApiKey', label: 'Google Speech API Key', type: 'password', description: 'API key for Speech-to-Text service' },
        { key: 'googleMapsApiKey', label: 'Google Maps API Key', type: 'password', description: 'API key for location verification' },
        { key: 'twilioAccountSid', label: 'Twilio Account SID', type: 'password', description: 'Twilio account identifier' },
        { key: 'twilioAuthToken', label: 'Twilio Auth Token', type: 'password', description: 'Twilio authentication token' },
        { key: 'twilioPhoneNumber', label: 'Twilio Phone Number', type: 'text', description: 'Twilio phone number for calls' },
      ]
    },
    payment: {
      name: 'Payment Gateway',
      icon: <CreditCard size={20} />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      settings: [
        { key: 'paystackPublicKey', label: 'Paystack Public Key', type: 'text', description: 'Paystack public key for payments' },
        { key: 'paystackSecretKey', label: 'Paystack Secret Key', type: 'password', description: 'Paystack secret key for transactions' },
      ]
    },
    aws: {
      name: 'AWS Services',
      icon: <Cloud size={20} />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      settings: [
        { key: 'awsAccessKeyId', label: 'AWS Access Key ID', type: 'text', description: 'AWS access key identifier' },
        { key: 'awsSecretAccessKey', label: 'AWS Secret Access Key', type: 'password', description: 'AWS secret access key' },
        { key: 'awsDefaultRegion', label: 'AWS Default Region', type: 'text', description: 'AWS region for services' },
        { key: 'awsBucket', label: 'AWS S3 Bucket', type: 'text', description: 'S3 bucket for file storage' },
      ]
    },
    general: {
      name: 'General API',
      icon: <Key size={20} />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      settings: [
        { key: 'googleMapsKey', label: 'Google Maps Key', type: 'password', description: 'Google Maps API key for mapping' },
        { key: 'pushNotificationKey', label: 'Push Notification Key', type: 'password', description: 'Key for push notifications' },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', description: 'Secret for webhook validation' },
      ]
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings/api');
      setSettings(response.data.data || {});
      setSource(response.data.source || 'cache');
    } catch (error) {
      console.error('Failed to load API settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (key) => {
    setVisibleKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const settingsArray = [];
      Object.entries(settings).forEach(([key, value]) => {
        let category = 'general';
        let isEncrypted = key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('token');
        let description = null;

        // Find category and description from setting definitions
        for (const [catName, catData] of Object.entries(settingCategories)) {
          const settingDef = catData.settings.find(s => s.key === key);
          if (settingDef) {
            category = catName;
            description = settingDef.description;
            break;
          }
        }

        settingsArray.push({
          key,
          value: value || '',
          category,
          is_encrypted: isEncrypted,
          description
        });
      });

      await api.post('/admin/settings/api', { settings: settingsArray });
      
      alert('API settings saved successfully');
      loadSettings();
    } catch (error) {
      console.error('Failed to save API settings:', error);
      alert('Failed to save API settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const maskValue = (value) => {
    if (!value) return '';
    return '•'.repeat(Math.min(value.length, 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brandMint animate-spin" />
      </div>
    );
  }


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
              <Settings size={20} className="text-brandMint" /> API Settings
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brandMint animate-pulse"></span>
            <span className="text-xs font-mono text-brandMint uppercase tracking-widest hidden sm:block">System Settings</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-brandMint/10 rounded-xl">
                  <Settings size={24} className="text-brandMint" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">API Settings</h1>
                  <p className="text-slate-400 mt-1">Manage API keys and service configurations</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                {source === 'cache' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <AlertTriangle size={18} className="text-amber-400" />
                    <span className="text-sm text-amber-400">Using Cache (Run migration to enable database)</span>
                  </div>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    onClick={loadSettings}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
                    title="Refresh settings"
                  >
                    <RefreshCw size={18} className="text-slate-400" />
                    <span className="text-slate-300">Refresh</span>
                  </button>
                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="px-6 py-3 bg-brandMint text-corporateNavy font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save All Settings'}
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Categories */}
            <div className="space-y-4">
              {Object.entries(settingCategories).map(([categoryKey, category]) => (
                <div key={categoryKey} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 ${category.bgColor} rounded-xl`}>
                        <span className={category.color}>{category.icon}</span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white">{category.name}</h3>
                        <p className="text-sm text-slate-400">
                          {category.settings.length} {category.settings.length === 1 ? 'setting' : 'settings'}
                        </p>
                      </div>
                    </div>
                    {expandedCategory === categoryKey ? (
                      <ChevronDown size={20} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                  </button>

                  {/* Category Settings */}
                  {expandedCategory === categoryKey && (
                    <div className="border-t border-slate-800 p-6 space-y-4">
                      {category.settings.map((setting) => (
                        <div key={setting.key} className="bg-slate-950 rounded-xl p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-white mb-1">
                                {setting.label}
                              </label>
                              <p className="text-xs text-slate-500">{setting.description}</p>
                            </div>
                            {setting.type === 'password' && (
                              <button
                                onClick={() => toggleVisibility(setting.key)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                {visibleKeys[setting.key] ? (
                                  <EyeOff size={16} className="text-slate-400" />
                                ) : (
                                  <Eye size={16} className="text-slate-400" />
                                )}
                              </button>
                            )}
                          </div>

                          {setting.type === 'select' ? (
                            <select
                              value={settings[setting.key] || ''}
                              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none"
                            >
                              {setting.options.map((option) => (
                                <option key={option} value={option}>
                                  {option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="relative">
                              <input
                                type={setting.type === 'password' && !visibleKeys[setting.key] ? 'password' : 'text'}
                                value={settings[setting.key] || ''}
                                onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                placeholder={`Enter ${setting.label.toLowerCase()}`}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none pr-12"
                              />
                              {settings[setting.key] && setting.type === 'password' && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  {visibleKeys[setting.key] ? (
                                    <Unlock size={16} className="text-brandMint" />
                                  ) : (
                                    <Lock size={16} className="text-slate-500" />
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl shrink-0">
                  <Shield size={20} className="text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Security Notice</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• All sensitive keys are encrypted in the database</li>
                    <li>• Keys are never exposed in client-side responses</li>
                    <li>• Regularly rotate your API keys for better security</li>
                    <li>• Use environment-specific keys for development and production</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApiSettings;

