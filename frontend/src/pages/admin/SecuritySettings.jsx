import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Save,
  Shield,
  Key,
  Lock,
  EyeOff,
  UserCheck,
  Globe,
  Menu,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Clock,
  LogOut
} from 'lucide-react';
import { adminService } from '../../api/admin';

function SecuritySettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    requireTwoFactor: true,
    passwordExpirationDays: 90,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    sessionTimeoutMinutes: 60,
    requireEmailVerification: true,
    requirePhoneVerification: true,
    allowedIps: '192.168.1.1\n10.0.0.1',
    blockSuspiciousIps: true,
    dataEncryptionStandard: 'AES-256'
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminService.getSecuritySettings();
      if (response.status === 'success') {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to load security settings:', err);
    }
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
      await adminService.updateSecuritySettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save security settings:', err);
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
              <ShieldAlert className="text-red-500" size={20} /> Security & Protocols
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Shield className="text-red-500" /> Platform Security Parameters
              </h1>
              <p className="text-slate-400 mt-1">Configure authentication thresholds, network whitelists, and session limits.</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={16} /> Enforce Protocols
                </>
              )}
            </button>
          </div>

          {saved && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-red-500" />
              <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Security Protocols Enforced</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Auth & Access Control */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Key size={18} className="text-blue-400" /> Authentication Control
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Require 2FA (Super Admins)</span>
                    <span className="text-xs text-slate-500">Enforce Authenticator app usage for all admin-level accounts.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="requireTwoFactor" checked={settings.requireTwoFactor} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brandMint"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Email Verification (Operatives)</span>
                    <span className="text-xs text-slate-500">Require confirmed email before directory listing.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="requireEmailVerification" checked={settings.requireEmailVerification} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brandMint"></div>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                   <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password Expiration (Days)</label>
                    <input
                      type="number"
                      name="passwordExpirationDays"
                      value={settings.passwordExpirationDays}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Encryption Standard</label>
                    <select
                      name="dataEncryptionStandard"
                      value={settings.dataEncryptionStandard}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="AES-256">AES-256 (Military Grade)</option>
                      <option value="ChaCha20">ChaCha20-Poly1305</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Security */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Globe size={18} className="text-amber-500" /> Network Defense
              </h3>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="font-bold text-white block flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500"/> Block Suspicious Nodes</span>
                    <span className="text-xs text-slate-500">Auto-ban IPs with rapid failed auth attempts.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="blockSuspiciousIps" checked={settings.blockSuspiciousIps} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      name="maxLoginAttempts"
                      value={settings.maxLoginAttempts}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Lockout Duration (Mins)</label>
                    <input
                      type="number"
                      name="lockoutDurationMinutes"
                      value={settings.lockoutDurationMinutes}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Command Center IP Whitelist</label>
                  <textarea
                    name="allowedIps"
                    value={settings.allowedIps}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter one IP address per line"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-brandMint font-mono text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Leave blank to allow access from any IP.</p>
                </div>
              </div>
            </div>

            {/* Session Management */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-800/50">
                <Lock size={18} className="text-purple-400" /> Session Lifespan Parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Idle Timeout (Minutes)</span>
                    <span className="text-xs text-slate-500">Auto-kill session after inactivity.</span>
                  </div>
                  <input
                    type="number"
                    name="sessionTimeoutMinutes"
                    value={settings.sessionTimeoutMinutes}
                    onChange={handleChange}
                    className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center focus:outline-none focus:border-red-500"
                  />
                </div>
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                   <div>
                    <span className="font-bold text-white block">Force Session Kill</span>
                    <span className="text-xs text-slate-500">Terminate all active user sessions globally.</span>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                    Execute Purge
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default SecuritySettings;
