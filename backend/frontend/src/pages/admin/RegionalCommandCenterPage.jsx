import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Globe,
  MapPin,
  Menu,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  Car,
  Award,
  Zap,
  Sliders,
  Search,
  Building2,
  ChevronRight
} from 'lucide-react';
import RegionalCommandCenter from '../../components/admin/RegionalCommandCenter';
import LocationActivationManager from '../../components/admin/LocationActivationManager';
import TerritoryFranchiseManager from '../../components/admin/TerritoryFranchiseManager';
import api from '../../api/axios';

function RegionalCommandCenterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('command'); // 'command' | 'activation'
  const [overviewMetrics, setOverviewMetrics] = useState({
    totalActivatedCities: 0,
    rideActiveCities: 0,
    hireActiveCities: 0,
    totalDrivers: 0,
    loading: true
  });

  const loadOverviewMetrics = async () => {
    try {
      const res = await api.get('/admin/launch-zones/report');
      if (res.data?.success) {
        const stats = res.data.data?.stats || {};
        const cities = res.data.data?.locations || [];
        setOverviewMetrics({
          totalActivatedCities: stats.active_cities || cities.filter(c => c.is_ride_active || c.is_hire_active).length,
          rideActiveCities: stats.ride_active || cities.filter(c => c.is_ride_active).length,
          hireActiveCities: stats.hire_active || cities.filter(c => c.is_hire_active).length,
          totalDrivers: stats.total_drivers || 0,
          loading: false
        });
      }
    } catch (e) {
      console.error('Failed to load launch zone overview', e);
      setOverviewMetrics(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadOverviewMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brandMint/10 border border-brandMint/30 flex items-center justify-center">
                <Globe className="text-brandMint w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white leading-tight">Regional Command & Location Activation</h1>
                <p className="text-[10px] text-slate-400 font-mono">State Operations, City Driver Density & Territory Launch Engine</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadOverviewMetrics}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brandMint" /> Sync Live Territory Data
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Sub-Navigation Tabs */}
          <div className="flex gap-4 border-b border-slate-800 mb-6 pb-2">
            <button
              onClick={() => setActiveTab('command')}
              className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'command' ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Territory Radar
              {activeTab === 'command' && <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-brandMint"></div>}
            </button>
            <button
              onClick={() => setActiveTab('activation')}
              className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'activation' ? 'text-brandMint' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Zone Activations
              {activeTab === 'activation' && <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-brandMint"></div>}
            </button>
            <button
              onClick={() => setActiveTab('franchise')}
              className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors relative flex items-center gap-2 ${activeTab === 'franchise' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Award size={14}/> Franchise Override
              {activeTab === 'franchise' && <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-amber-400"></div>}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'command' && (
            <>
              {/* Top KPI Metrics Overview Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Activated Cities</p>
                <p className="text-xl font-black text-white">{overviewMetrics.totalActivatedCities}</p>
                <p className="text-[10px] text-slate-500">Live for operations</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-brandMint/10 border border-brandMint/30 flex items-center justify-center text-brandMint shrink-0">
                <Car size={22} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Ride Active Zones</p>
                <p className="text-xl font-black text-white">{overviewMetrics.rideActiveCities}</p>
                <p className="text-[10px] text-slate-500">On-demand ride hailing</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Award size={22} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Hire Active Zones</p>
                <p className="text-xl font-black text-white">{overviewMetrics.hireActiveCities}</p>
                <p className="text-[10px] text-slate-500">Private driver recruitment</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Users size={22} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Registered Drivers</p>
                <p className="text-xl font-black text-white">{overviewMetrics.totalDrivers}</p>
                <p className="text-[10px] text-slate-500">Across active states</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl mb-6 max-w-md">
            <button
              onClick={() => setActiveTab('command')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'command'
                  ? 'bg-brandMint text-corporateNavy shadow-lg shadow-brandMint/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Globe size={16} /> Regional Command Center
            </button>
            <button
              onClick={() => setActiveTab('activation')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'activation'
                  ? 'bg-brandMint text-corporateNavy shadow-lg shadow-brandMint/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sliders size={16} /> Location & Routes Activation
            </button>
          </div>

          {/* Active View */}
          {activeTab === 'command' && (
            <div className="space-y-6">
              <RegionalCommandCenter />
            </div>
          )}

          {activeTab === 'activation' && (
            <div className="space-y-6">
              <LocationActivationManager />
            </div>
          )}
          </>
          )}

          {activeTab === 'activation' && (
             <LocationActivationManager />
          )}

          {activeTab === 'franchise' && (
             <TerritoryFranchiseManager />
          )}
        </main>
      </div>
    </div>
  );
}

export default RegionalCommandCenterPage;
