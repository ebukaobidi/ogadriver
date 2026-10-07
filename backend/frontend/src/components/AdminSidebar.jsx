import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/auth';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard,
  Users,
  Car,
  Briefcase,
  DollarSign,
  CreditCard,
  Settings,
  Shield,
  FileText,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Radio,
  User,
  ChevronUp,
  Scale,
  Activity,
  Lock,
  MessageSquare,
  HeartPulse,
  Building2,
  Smartphone,
  Globe
} from 'lucide-react';

function AdminSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const user = authService.getUser() || { name: 'Super Admin', email: 'admin@ogadriver.ng' };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard',
      section: 'main'
    },
    {
      title: 'Regional Operations',
      icon: <Globe size={20} />,
      section: 'regional',
      submenu: [
        { title: 'Regional Command Center', path: '/admin/regional-command' },
        { title: 'Location & Routes Activation', path: '/admin/regional-command' },
      ]
    },
    {
      title: 'User Management',
      icon: <Users size={20} />,
      section: 'users',
      submenu: [
        { title: 'All Users', path: '/admin/users' },
        { title: 'Employers / Hirers', path: '/admin/hirers' },
        { title: 'Admins Management', path: '/admin/admins' },
        { title: 'AI Guarantor Call Monitor', path: '/admin/guarantor-calls' },
      ]
    },
    {
      title: 'Driver Verification',
      icon: <Car size={20} />,
      section: 'drivers',
      submenu: [
        { title: 'Directory Overview', path: '/admin/drivers/list' },
        { title: 'Pending Vetting', path: '/admin/drivers/verification' },
        { title: 'Driver Performance', path: '/admin/drivers/performance' },
        { title: 'Clearance Revoked', path: '/admin/drivers/blacklist' },
      ]
    },
    {
      title: 'Matchmaking & Jobs',
      icon: <Briefcase size={20} />,
      section: 'matchmaking',
      submenu: [
        { title: 'Active Contracts', path: '/admin/jobs/active' },
        { title: 'Match History', path: '/admin/jobs/completed' },
        { title: 'Disputes / SOS', path: '/admin/jobs/disputes' },
        { title: 'Dispute Resolution', path: '/admin/disputes' },
      ]
    },
    {
      title: 'Financials & Settlement',
      icon: <DollarSign size={20} />,
      section: 'financials',
      submenu: [
        { title: 'Revenue Overview', path: '/admin/financials' },
        { title: 'Batch Payout Approvals', path: '/admin/financials/batch-payouts' },
        { title: 'Financial Forecasting & MRR', path: '/admin/financials/forecasting' },
        { title: 'Gateway Logs', path: '/admin/financials/transactions' },
      ]
    },
    {
      title: 'Subscriptions',
      icon: <CreditCard size={20} />,
      section: 'subscriptions',
      submenu: [
        { title: 'Active Plans', path: '/admin/subscriptions' },
        { title: 'Plan Configurations', path: '/admin/subscriptions/plans' },
        { title: 'Payment History', path: '/admin/subscriptions/payments' },
      ]
    },
    {
      title: 'Telemetry & Safety',
      icon: <Radio size={20} />,
      section: 'telemetry',
      submenu: [
        { title: 'Live Fleet Radar Map', path: '/admin/telemetry/radar' },
        { title: 'Live Tracking Feed', path: '/admin/telemetry/live' },
        { title: 'Incident Reports', path: '/admin/telemetry/incidents' },
      ]
    },
    {
      title: 'System & Operations',
      icon: <HeartPulse size={20} />,
      section: 'health',
      submenu: [
        { title: 'System Health Metrics', path: '/admin/system-health' },
        { title: 'Server Control Terminal', path: '/admin/system-health/terminal' },
        { title: 'Advanced Analytics', path: '/admin/analytics' },
        { title: 'System Audit Log', path: '/admin/audit' },
      ]
    },
    {
      title: 'Security & Compliance',
      icon: <Lock size={20} />,
      section: 'security',
      submenu: [
        { title: 'Security Settings', path: '/admin/settings/security' },
        { title: 'Blacklist Management', path: '/admin/security/blacklist' },
        { title: 'Audit Logs', path: '/admin/security/audit' },
      ]
    },
    {
      title: 'Content & Directories',
      icon: <Building2 size={20} />,
      section: 'directories',
      submenu: [
        { title: 'Driving Schools', path: '/admin/directories/driving-schools' },
        { title: 'VIP Fleet Directory', path: '/admin/directories/car-hires' },
        { title: 'Public Site Content', path: '/admin/content/site' },
        { title: 'Blog & Articles', path: '/admin/content/blog' },
        { title: 'Communication Center', path: '/admin/communications' },
      ]
    },
    {
      title: 'Mobile App Controls',
      icon: <Smartphone size={20} />,
      path: '/admin/mobile',
      section: 'mobile'
    },
    {
      title: 'System Settings',
      icon: <Settings size={20} />,
      section: 'settings',
      submenu: [
        { title: 'General Settings', path: '/admin/settings/general' },
        { title: 'Regional Command & Activations', path: '/admin/regional-command' },
        { title: 'Releases & OTA Triggers', path: '/admin/settings/releases' },
        { title: 'API Configuration', path: '/admin/settings/api' },
        { title: 'Notification Settings', path: '/admin/settings/notifications' },
      ]
    }
  ];

  const toggleMenu = (section) => {
    setExpandedMenus(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-0 flex flex-col`}
        style={{ width: '280px' }}
      >
        {/* Logo / Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brandMint rounded flex items-center justify-center shadow-[0_0_15px_rgba(28,209,136,0.2)]">
              <ShieldCheck className="text-corporateNavy w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">OgaDriver</h1>
              <p className="text-[10px] font-mono text-brandMint uppercase tracking-widest mt-1">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.section}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.section)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold text-sm ${
                        isActive(item.submenu[0]?.path)
                          ? 'bg-slate-900 text-brandMint'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                      {expandedMenus[item.section] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {expandedMenus[item.section] && (
                      <ul className="ml-5 mt-1 space-y-1 border-l border-slate-800 pl-2">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <button
                              onClick={() => handleNavigation(subItem.path)}
                              className={`w-full text-left p-2 rounded-lg text-sm font-medium transition-all ${
                                isActive(subItem.path)
                                  ? 'text-brandMint bg-brandMint/5'
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                              }`}
                            >
                              {subItem.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${
                      isActive(item.path)
                        ? 'bg-slate-900 text-brandMint'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 relative">
          <div className="flex items-center gap-2 mb-3">
            <ThemeToggle />
            <span className="text-xs text-slate-500">Theme</span>
          </div>
          <button 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white max-w-[120px] truncate">{user.name}</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
            </div>
            {profileMenuOpen ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronUp size={16} className="text-slate-500" />}
          </button>
          
          {profileMenuOpen && (
             <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50">
                 <button onClick={() => handleNavigation('/admin/profile')} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-3 transition-colors">
                   <User size={16} /> Edit Profile
                 </button>
                 <div className="border-t border-slate-800"></div>
                 <button 
                   onClick={() => {
                     authService.logout();
                   }} 
                   className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                 >
                   <LogOut size={16} /> Secure Logout
                 </button>
             </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
