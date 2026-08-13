import React from 'react';
import { 
  Briefcase,
  Navigation,
  FileText,
  User,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const DriverContractsTab = ({ activeContracts }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white">Active Deployments</h3>
          <p className="text-slate-400 text-sm">Your currently accepted contracts and live runs.</p>
        </div>
        <div className="p-3 bg-brandMint/10 rounded-xl border border-brandMint/20">
          <Briefcase className="w-6 h-6 text-brandMint" />
        </div>
      </div>

      {activeContracts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
          <Briefcase className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h4 className="font-bold text-xl text-white">No Active Runs</h4>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto">
            You are currently on standby. Accept proposals from the incoming tab to begin a deployment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeContracts.map(contract => (
            <div key={contract.id} className="bg-corporateNavy border border-brandMint/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(28,209,136,0.05)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandMint to-emerald-500"></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                  <div>
                    <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full border border-red-500/30 uppercase tracking-widest inline-flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      In Flight
                    </span>
                    <h4 className="font-black text-2xl text-white">{contract.client_name || contract.hirer?.user?.name || 'Enterprise Client'}</h4>
                    <p className="text-sm font-mono text-slate-400 mt-1">ID: RUN-{contract.id.toString().padStart(5, '0')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Total Compensation</p>
                    <p className="text-2xl font-black text-brandMint">₦{contract.salary_agreed ? parseFloat(contract.salary_agreed).toLocaleString() : '0'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-4">
                    <h5 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-brandMint" /> Mission Details
                    </h5>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Location / Route</p>
                          <p className="text-sm font-bold text-white">{contract.location || contract.pickup_location || 'Not Specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Duration</p>
                          <p className="text-sm font-bold text-white">{contract.duration || 'Not Specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Job Type</p>
                          <p className="text-sm font-bold text-white">{contract.job_type || 'Standard Contract'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-brandMint" /> Client Protocol
                    </h5>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
                      <p className="text-[10px] font-mono text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Operational Notes
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        {contract.notes || "No specific operational notes provided by the client. Follow standard protocol."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-800">
                  <button className="flex-1 bg-brandMint text-corporateNavy font-black py-3 rounded-xl hover:bg-emerald-400 transition-all text-sm uppercase tracking-wider">
                    Mark Mission Complete
                  </button>
                  <button className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 border border-slate-700 transition-all text-sm flex justify-center items-center gap-2">
                    <FileText className="w-4 h-4" /> View Full Contract
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
