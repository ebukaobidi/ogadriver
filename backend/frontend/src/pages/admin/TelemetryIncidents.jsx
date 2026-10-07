import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Menu,
  AlertOctagon,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '../../api/admin';
import api from '../../api/axios';

function TelemetryIncidents() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadIncidents();
  }, [currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else loadIncidents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/telemetry/incidents', {
        params: {
          page: currentPage,
          search: searchTerm
        }
      });
      const data = response.data;
      if (data.status === 'success') {
        setIncidents(data.data.data);
        setTotalPages(data.data.last_page);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-500">
        <AlertOctagon className="animate-pulse w-12 h-12 mb-4" />
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Scanning Incident Logs...</p>
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
              <ShieldAlert className="text-red-500" size={20} /> Incident Logs
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Automated Safety Triggers
              </h1>
              <p className="text-slate-400 mt-1">Audit log of system-generated SOS alerts, geo-fence breaches, and telemetry failures.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search by Incident ID, Operative, or Trigger Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {incidents.map((incident) => (
              <div key={incident.id} className={`border-l-4 border-t border-b border-r rounded-r-2xl p-6 relative overflow-hidden ${
                incident.severity === 'Critical' ? 'bg-red-500/5 border-l-red-500 border-slate-800' :
                incident.severity === 'High' ? 'bg-amber-500/5 border-l-amber-500 border-slate-800' :
                'bg-slate-900 border-l-blue-500 border-slate-800'
              }`}>
                
                {/* Background glow for active critical */}
                {incident.severity === 'Critical' && incident.status !== 'Resolved' && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                )}
                
                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                  
                  {/* Left Col: Metadata */}
                  <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-bold text-white text-lg">{incident.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                        incident.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        incident.status === 'Investigating' ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' :
                        'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {incident.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Operative:</span>
                        <span className="text-sm text-white font-bold">{incident.operative}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Employer:</span>
                        <span className="text-sm text-slate-300 font-bold">{incident.employer}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Contract:</span>
                        <span className="text-sm text-brandMint font-mono font-bold">{incident.contract}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Details & Actions */}
                  <div className="lg:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-bold uppercase tracking-wider text-sm flex items-center gap-2 ${
                          incident.severity === 'Critical' ? 'text-red-500' : 
                          incident.severity === 'High' ? 'text-amber-500' : 'text-blue-400'
                        }`}>
                          {incident.severity === 'Critical' ? <AlertOctagon size={16} /> : 
                           incident.severity === 'High' ? <AlertTriangle size={16} /> : <ShieldAlert size={16} />}
                          {incident.type}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {incident.time}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 w-max">
                        <MapPin size={12} className="text-slate-500" />
                        {incident.location}
                      </div>
                      
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {incident.details}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-800/50">
                      {incident.status !== 'Resolved' ? (
                        <>
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider">
                            <Eye size={14} /> View Map Log
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-brandMint/30 hover:border-brandMint/50 text-brandMint hover:text-emerald-400 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={14} /> Mark False Alarm
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-red-500/30 hover:border-red-500/50 text-red-500 hover:text-red-400 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wider">
                            <XCircle size={14} /> Escalate to Police
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest bg-slate-800 text-slate-400">
                          Incident Resolved & Archived
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
            
            {incidents.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-mono border border-slate-800 border-dashed rounded-2xl">
                No telemetry incidents found.
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900/50 flex items-center justify-between">
                <p className="text-sm font-mono text-slate-500">
                  PAGE {currentPage} OF {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default TelemetryIncidents;
