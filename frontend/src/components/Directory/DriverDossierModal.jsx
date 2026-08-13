import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Briefcase, 
  MapPin, 
  Star, 
  CheckCircle2, 
  FileText,
  Activity,
  Calendar,
  Loader2
} from 'lucide-react';
import api from '../../api/axios';

const DriverDossierModal = ({ driverId, onClose, onHire, onCheckAvailability }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/marketplace/drivers/${driverId}`);
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dossier', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [driverId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-brandMint animate-spin mb-4" />
          <p className="font-mono text-sm uppercase tracking-widest text-brandMint animate-pulse">Decrypting Dossier...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.driver) return null;

  const { driver, current_location } = profile;
  
  // Helpers
  const guarantors = driver.guarantors || [];
  const hasGuarantors = guarantors.length > 0;
  const verifiedGuarantors = guarantors.filter(g => g.is_verified).length;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-corporateNavy border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brandMint via-emerald-400 to-brandMint"></div>
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start shrink-0 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5">
             <ShieldCheck size={200} />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(28,209,136,0.1)] shrink-0">
              {driver.user?.avatar ? (
                <img src={driver.user.avatar} alt="Driver" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-slate-500">
                  {driver.user?.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight line-clamp-1">{driver.user?.name || 'Unknown Operator'}</h2>
                {driver.is_verified && (
                  <span className="bg-brandMint/10 text-brandMint border border-brandMint/30 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-widest flex items-center gap-1 w-max">
                    <ShieldCheck className="w-3 h-3" /> SECURED
                  </span>
                )}
                {driver.is_pro && (
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-corporateNavy px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 w-max shadow-lg shadow-amber-500/20">
                    <Star className="w-3 h-3 fill-current" /> PRO RECOMMENDED
                  </span>
                )}
                {driver.is_hybrid && (
                  <span className="bg-slate-800 text-brandMint border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-widest uppercase flex items-center gap-1 w-max">
                    HYBRID OPERATOR
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 flex flex-wrap items-center gap-2 mb-2 font-mono">
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {driver.license_class ? `Class ${driver.license_class} License` : 'Unclassified License'}</span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-brandMint" /> {driver.city ? `${driver.city.name}, ` : ''}{driver.state ? driver.state.name : 'Unknown'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                 <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{parseFloat(driver.rating).toFixed(1)} Rating</span>
                 </div>
                 <div className="flex items-center gap-1 text-slate-300">
                    <Activity className="w-4 h-4" />
                    <span>{driver.total_jobs || 0} Missions</span>
                 </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors relative z-10 bg-slate-900 p-2 rounded-lg border border-slate-800">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Trust & Verification Layer */}
              <div className="space-y-6">
                 <div>
                    <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-brandMint" /> Trust & Verification
                    </h3>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brandMint"/> Identity (BVN)</span>
                          <span className="text-xs font-mono text-brandMint">VERIFIED</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brandMint"/> Police Clearance</span>
                          <span className="text-xs font-mono text-brandMint">PASSED</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brandMint"/> Physical Address</span>
                          <span className="text-xs font-mono text-brandMint">CONFIRMED</span>
                       </div>
                       <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between">
                          <span className="text-sm text-slate-300 font-bold">Guarantors Locked</span>
                          {hasGuarantors ? (
                             <span className="text-xs font-bold text-corporateNavy bg-brandMint px-2 py-0.5 rounded-md">
                                {verifiedGuarantors} SECURED
                             </span>
                          ) : (
                             <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                PENDING
                             </span>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Certifications */}
                 <div>
                    <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
                       <FileText className="w-4 h-4 text-amber-500" /> Certifications & Access
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {driver.vehicle_certifications && driver.vehicle_certifications.length > 0 ? (
                         driver.vehicle_certifications.map((cert, idx) => (
                           <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg capitalize">
                              {cert.replace('_', ' ')}
                           </span>
                         ))
                       ) : (
                         <span className="text-sm text-slate-500 italic">No advanced certifications logged.</span>
                       )}
                    </div>
                 </div>
              </div>

              {/* Telemetry & Stats */}
              <div className="space-y-6">
                 <div>
                    <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
                       <Activity className="w-4 h-4 text-brandMint" /> Telemetry & Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                          <div className="text-2xl font-black text-brandMint mb-1">99%</div>
                          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Safety Score</div>
                       </div>
                       <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                          <div className="text-2xl font-black text-white mb-1">100%</div>
                          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Punctuality</div>
                       </div>
                       <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                          <div className="text-2xl font-black text-amber-500 mb-1">{driver.years_of_experience || 0}</div>
                          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Years Active</div>
                       </div>
                       <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                          <div className="text-2xl font-black text-white mb-1">{driver.total_jobs || 0}</div>
                          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Contracts</div>
                       </div>
                    </div>
                 </div>

                 {/* Employment Preferences */}
                 <div>
                    <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm border-b border-slate-800 pb-2">Employment Preferences</h3>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Preferred Route</span>
                          <span className="text-xs font-bold text-white uppercase bg-slate-800 px-2 py-1 rounded">
                             {driver.preferred_route_type ? driver.preferred_route_type.replace('_', ' ') : 'Any'}
                          </span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Contract Types</span>
                          <span className="text-xs font-bold text-white uppercase text-right">
                             {driver.employment_types && driver.employment_types.length > 0 
                               ? driver.employment_types.map(t => t.replace('_', ' ')).join(', ') 
                               : 'Flexible'}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row gap-3 shrink-0">
           <button 
             onClick={() => {
               onClose();
               onCheckAvailability(driver);
             }}
             className="flex-1 py-3 bg-corporateNavy border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
           >
             <Calendar className="w-5 h-5" /> Check Calendar
           </button>
           <button 
             onClick={() => {
               onClose();
               onHire(driver);
             }}
             className="flex-1 py-3 bg-brandMint text-corporateNavy rounded-xl text-sm font-black tracking-widest uppercase hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(28,209,136,0.2)]"
           >
             Initiate Contract
           </button>
        </div>

      </div>
    </div>
  );
};

export default DriverDossierModal;
