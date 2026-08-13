import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Menu,
  Radio,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Activity,
  Maximize2
} from 'lucide-react';
import { adminService } from '../../api/admin';

function TelemetryLive() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveNodes, setLiveNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTelemetry();
    
    // Simulate real-time pings
    const interval = setInterval(() => {
      setLiveNodes(prev => prev.map(node => ({
        ...node,
        latency: Math.floor(Math.random() * 80) + 20, // Random latency 20-100ms
        lastPing: 'Just now'
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadTelemetry = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTelemetry();
      if (response.status === 'success') {
        setLiveNodes(response.data.liveNodes);
      }
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500">
        <Radio className="animate-ping w-12 h-12 mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Establishing Satellite Uplink...</p>
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
              <Radio className="text-blue-500 animate-pulse" size={20} /> Telemetry Link
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Live GPS Radar
              </h1>
              <p className="text-slate-400 mt-1">Real-time geographical tracking for all deployed Operatives.</p>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
              <Maximize2 size={16} /> Expand Map
            </button>
          </div>

          {/* Live Map UI */}
          <div className="w-full h-96 bg-slate-900 border border-slate-800 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center">
            {/* Grid Overlay */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              opacity: 0.3
            }}></div>
            
            <div className="relative z-10 text-center">
              <MapPin className="text-blue-500 mx-auto mb-3" size={48} />
              <p className="font-mono text-blue-500 uppercase tracking-widest font-bold">Encrypted Map Feed Active</p>
              <p className="text-xs text-slate-500 mt-2">Displaying {liveNodes.length} active nodes</p>
            </div>
            
            {/* Scanning radar line effect */}
            <div className="absolute inset-0 border-t border-blue-500/20 shadow-[0_-10px_20px_rgba(59,130,246,0.1)] animate-[spin_4s_linear_infinite]" style={{ transformOrigin: 'center' }}></div>
          </div>

          {/* Telemetry Nodes */}
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Node Diagnostics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveNodes.map((node) => (
              <div key={node.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <span className="font-mono font-bold text-white">{node.id}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{node.operative}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    node.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    node.status === 'Degraded' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {node.status === 'Active' ? <Wifi size={12} className="animate-pulse" /> : 
                     node.status === 'Degraded' ? <Activity size={12} /> : <WifiOff size={12} />}
                    {node.status}
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800/50">
                    <span className="text-xs text-slate-500 font-bold uppercase">Contract</span>
                    <span className="text-sm text-brandMint font-mono font-bold">{node.contract}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MapPin size={14} className="text-slate-500" />
                    <span className="truncate">{node.location}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/50 flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Velocity</span>
                      <span className="font-mono text-sm text-white">{node.speed}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/50 flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex justify-between">
                        Ping 
                        <Clock size={10} className={node.status === 'Active' ? 'text-blue-500' : 'text-slate-500'} />
                      </span>
                      <span className={`font-mono text-sm ${node.latency > 200 ? 'text-amber-500' : 'text-blue-400'}`}>
                        {node.latency === 0 ? '---' : `${node.latency}ms`}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Background glow */}
                {node.status === 'Active' && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                )}
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}

export default TelemetryLive;
