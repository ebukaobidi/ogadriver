import React from 'react';
import { 
  LogOut,
  Briefcase,
  Inbox,
  FileCheck,
  Star,
  Activity,
  CreditCard,
  Gamepad2,
  User,
  Calendar,
  EyeOff
} from 'lucide-react';
import { NotificationBell } from '../NotificationSystem';
import { MessagingButton, MessagingPanel } from '../MessagingSystem';
import ThemeToggle from '../ThemeToggle';

const DriverSidebar = ({ 
  user, 
  driver, 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  proposals, 
  activeContracts, 
  subscriptionStatus, 
  handleLogout 
}) => {
  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
      <div className="pt-3 pb-3 px-6 border-b border-slate-800 flex flex-col items-center justify-center gap-0 bg-slate-950/30">
        <img src="/logo.svg" alt="OgaDriver" className="h-14 w-auto -mt-3 -mb-1" />
        <p className="text-[10px] font-mono text-brandMint tracking-widest uppercase shadow-brandMint drop-shadow-md">Operative Terminal</p>
      </div>

      <div className="p-6 border-b border-slate-800 flex flex-col items-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brandMint/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative w-24 h-24 rounded-full border-2 border-brandMint bg-slate-800 mb-4 shadow-[0_0_20px_rgba(28,209,136,0.15)] group transition-transform hover:scale-105 duration-300">
            {user && user.avatar ? (
              <img 
                src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar}`} 
                alt="Driver" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="w-full h-full rounded-full flex items-center justify-center text-3xl font-black text-slate-600">${user && user.name ? user.name.charAt(0) : 'O'}</div>`;
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-black text-slate-600">
                {user && user.name ? user.name.charAt(0) : 'O'}
              </div>
            )}
            {driver && driver.is_engaged && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1.5 border-2 border-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.5)]" title="Hidden from Directory">
                <EyeOff className="w-4 h-4 text-white animate-pulse" />
              </div>
            )}
        </div>
        <h2 className="font-black text-lg text-center leading-tight tracking-wide text-white">{user && user.nickname ? user.nickname : user && user.name ? user.name : 'Operative'}</h2>
        <div className="flex items-center gap-1 mt-2 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
          <Star className="w-3 h-3 fill-amber-400" />
          <span className="text-xs font-bold">{driver && driver.rating ? driver.rating : 'New'}</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <button 
          onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Activity className={`w-5 h-5 ${activeTab === 'dashboard' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Command Dashboard
        </button>

        <button 
          onClick={() => { setActiveTab('proposals'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'proposals' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Inbox className={`w-5 h-5 ${activeTab === 'proposals' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Incoming Proposals
          {proposals && proposals.length > 0 && (
            <span className="ml-auto bg-amber-500 text-corporateNavy text-xs font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-bounce">{proposals.length}</span>
          )}
        </button>
        
        <button 
          onClick={() => { setActiveTab('active'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'active' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Briefcase className={`w-5 h-5 ${activeTab === 'active' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Active Contract
          {activeContracts && activeContracts.length > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">1</span>
          )}
        </button>

        <button 
          onClick={() => { setActiveTab('compliance'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'compliance' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <FileCheck className={`w-5 h-5 ${activeTab === 'compliance' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Vetting & Compliance
        </button>
        
        <button 
          onClick={() => { setActiveTab('billing'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'billing' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <CreditCard className={`w-5 h-5 ${activeTab === 'billing' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Subscriptions & Billing
          {subscriptionStatus === 'expired' && (
            <span className="ml-auto w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
          )}
        </button>

        <button 
          onClick={() => { setActiveTab('availability'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'availability' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'availability' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Availability Calendar
        </button>

        <button 
          onClick={() => { setActiveTab('simulator'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'simulator' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Gamepad2 className={`w-5 h-5 ${activeTab === 'simulator' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Simulator Training
        </button>

        <button 
          onClick={() => { setActiveTab('ratings'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'ratings' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Star className={`w-5 h-5 ${activeTab === 'ratings' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Ratings Ledger
        </button>
        
        <button 
          onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'profile' ? 'bg-brandMint text-corporateNavy shadow-[0_0_20px_rgba(28,209,136,0.2)] scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? '' : 'group-hover:text-brandMint transition-colors'}`} /> Profile Details
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-3">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-xs text-slate-500">Theme</span>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" /> Disconnect System
        </button>
      </div>
    </aside>
  );
};

export default DriverSidebar;
