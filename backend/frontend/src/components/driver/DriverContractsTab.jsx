import React, { useState } from 'react';
import { 
  Briefcase,
  Navigation,
  FileText,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Radio
} from 'lucide-react';
import api from '../../api/axios';
import { useNotifications } from '../NotificationSystem';

const DriverContractsTab = ({ activeContracts = [], refreshJobs, setActiveTab }) => {
  const { addNotification } = useNotifications();
  const [completingId, setCompletingId] = useState(null);

  const contractsList = Array.isArray(activeContracts) 
    ? activeContracts 
    : (activeContracts?.data && Array.isArray(activeContracts.data)) 
      ? activeContracts.data 
      : [];

  const handleComplete = async (jobId) => {
    setCompletingId(jobId);
    try {
      const res = await api.post(`/jobs/${jobId}/complete`);
      if (res.data.success) {
        addNotification('success', 'Mission Complete', 'Deployment marked as completed successfully!');
        if (refreshJobs) refreshJobs();
      } else {
        addNotification('error', 'Failed', res.data.message || 'Could not complete job.');
      }
    } catch (err) {
      addNotification('error', 'Error', err.response?.data?.message || 'Server error.');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white">Active Deployments</h3>
          <p className="text-slate-400 text-sm">Your currently accepted contracts and live runs.</p>
        </div>
        <div className="p-3 bg-brandMint/10 rounded-xl border border-brandMint/20">
          <Briefcase className="w-6 h-6 text-brandMint" />
        </div>
      </div>

      {contractsList.length === 0 ? (
        /* High-Fidelity Mockup Matching Display */
        <div className="space-y-6">
          {/* Main Card Container */}
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
            {/* Circular Radar Sweep Graphic */}
            <div className="relative w-full h-48 bg-[#040810] rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden mb-6">
              {/* Radar Grid Circles */}
              <div className="absolute w-44 h-44 rounded-full border border-brandMint/20 flex items-center justify-center">
                <div className="absolute w-32 h-32 rounded-full border border-brandMint/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-brandMint/40 flex items-center justify-center bg-brandMint/10">
                    <Navigation className="w-5 h-5 text-brandMint" />
                  </div>
                </div>
              </div>

              {/* Glowing Nodes */}
              <div className="absolute top-8 right-20 w-4 h-4 rounded-full bg-brandMint/30 border border-brandMint flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="absolute top-14 left-24 w-4 h-4 rounded-full bg-brandMint/30 border border-brandMint flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase absolute bottom-5">
                NO ACTIVE DEPLOYMENTS
              </span>
            </div>

            {/* Drivers Portal Content */}
            <div className="bg-slate-950 border border-brandMint/30 rounded-2xl p-5 text-center space-y-4 shadow-xl">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-brandMint uppercase block mb-1">
                  DRIVERS PORTAL:
                </span>
                <h4 className="text-xl font-black text-white">
                  Employment & Hire Marketplace
                </h4>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                You are currently on standby. The radar map above shows available runs and employment offers in real-time. Accept proposals from nearby or Offers tab to begin a new run or job.
              </p>

              {/* Dual Action Pill Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('nearby')}
                  className="py-3.5 px-4 bg-brandMint text-corporateNavy rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all flex flex-col items-center justify-center shadow-lg shadow-brandMint/20"
                >
                  <span>FIND EMPLOYMENT</span>
                  <span className="text-[8px] opacity-80">(WAITING DRIVERS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('proposals')}
                  className="py-3.5 px-4 bg-brandMint text-corporateNavy rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all flex flex-col items-center justify-center shadow-lg shadow-brandMint/20"
                >
                  <span>MANAGE HIRE</span>
                  <span className="text-[8px] opacity-80">(OWN-CAR DRIVERS)</span>
                </button>
              </div>
            </div>
          </div>

          {/* EMPLOYMENT INBOX Section */}
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10/80 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">EMPLOYMENT INBOX</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
                STATUS
              </span>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('proposals')}
                className="w-full flex items-center justify-between p-4 bg-slate-950 border border-white/10 hover:border-brandMint/40 rounded-2xl transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brandMint/10 border border-brandMint/30 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-brandMint" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-brandMint transition-colors">
                    Pending Corporate Job Offer (Full-Time)
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('proposals')}
                className="w-full flex items-center justify-between p-4 bg-slate-950 border border-white/10 hover:border-brandMint/40 rounded-2xl transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-brandMint transition-colors">
                    Verified Vehicle Partner Request (Hire)
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Contracts List */
        <div className="space-y-6">
          {contractsList.map(contract => (
            <div key={contract.id} className="bg-corporateNavy border border-brandMint/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(28,209,136,0.05)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandMint to-emerald-500"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                  <div>
                    <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full border border-red-500/30 uppercase tracking-widest inline-flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      In Flight
                    </span>
                    <h4 className="font-black text-2xl text-white">{contract.title || contract.client_name || contract.hirer?.user?.name || 'Enterprise Client'}</h4>
                    <p className="text-sm font-mono text-slate-400 mt-1">ID: RUN-{contract.id.toString().padStart(5, '0')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Total Compensation</p>
                    <p className="text-2xl font-black text-brandMint">₦{parseFloat(contract.amount || contract.salary_agreed || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-4">
                    <h5 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-brandMint" /> Mission Details
                    </h5>
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Pickup Location</p>
                          <p className="text-sm font-bold text-white">{contract.pickup_location || 'Not Specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Dropoff Location</p>
                          <p className="text-sm font-bold text-white">{contract.dropoff_location || 'Not Specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Pickup Time</p>
                          <p className="text-sm font-bold text-white">{contract.pickup_time ? new Date(contract.pickup_time).toLocaleString() : 'Not Specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Vehicle Type</p>
                          <p className="text-sm font-bold text-white uppercase">{contract.vehicle_type?.replace('_', ' ') || 'Standard'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-brandMint" /> Client Protocol
                    </h5>
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-4 h-full">
                      <p className="text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Operational Notes
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        {contract.description || contract.notes || "No specific operational notes provided by the client. Follow standard protocol."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => handleComplete(contract.id)}
                    disabled={completingId === contract.id}
                    className="flex-1 bg-brandMint text-corporateNavy font-black py-3 rounded-xl hover:bg-emerald-400 transition-all text-sm uppercase tracking-wider disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {completingId === contract.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Mark Mission Complete
                  </button>
                  <button className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 border border-slate-700 transition-all text-sm flex justify-center items-center gap-2">
                    <FileText className="w-4 h-4" /> View Full Contract
                  </button>
                  <button onClick={() => window.open(`geo:${contract.lat},${contract.lng}?q=${contract.lat},${contract.lng}`, '_blank')} className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-400 transition-all text-sm flex justify-center items-center gap-2">
                    <Navigation className="w-4 h-4" /> Navigate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverContractsTab;
