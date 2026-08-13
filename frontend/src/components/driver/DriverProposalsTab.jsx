import React from 'react';
import { 
  Inbox,
  CheckCircle,
  MapPin,
  Calendar,
  Briefcase
} from 'lucide-react';

const DriverProposalsTab = ({ proposals, handleAcceptProposal }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white">Incoming Deployments</h3>
          <p className="text-slate-400 text-sm">Review match requests from clients and employers.</p>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <Inbox className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-700 rounded-2xl bg-slate-900/50">
          <Inbox className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h4 className="font-bold text-xl text-white">No Pending Proposals</h4>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto">
            You currently have no incoming job requests. Make sure your availability calendar is updated.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => (
            <div key={proposal.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/50 transition-colors shadow-lg">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between md:justify-start gap-4">
                    <h4 className="font-black text-xl text-white">{proposal.client_name || proposal.hirer?.user?.name || 'Private Client'}</h4>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/30 uppercase tracking-widest">
                      New
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Route / Area</p>
                        <p className="text-sm font-bold text-slate-300">{proposal.location || proposal.pickup_location || 'Not Specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Contract Type</p>
                        <p className="text-sm font-bold text-slate-300">{proposal.job_type || 'Standard Run'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Duration</p>
                        <p className="text-sm font-bold text-slate-300">{proposal.duration || 'Flexible'}</p>
                      </div>
                    </div>
                  </div>

                  {proposal.notes && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Operational Brief</p>
                      <p className="text-sm text-slate-300 italic">"{proposal.notes}"</p>
                    </div>
                  )}
                </div>

                <div className="md:w-48 shrink-0 flex flex-col justify-center space-y-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                  <div className="mb-2 text-center md:text-left">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Offered Rate</p>
                    <p className="text-xl font-black text-white">₦{proposal.salary_offered ? parseFloat(proposal.salary_offered).toLocaleString() : 'Negotiable'}</p>
                  </div>
                  <button 
                    onClick={() => handleAcceptProposal(proposal.id)}
                    className="w-full bg-brandMint text-corporateNavy font-black py-3 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(28,209,136,0.2)]"
                  >
                    <CheckCircle className="w-5 h-5" /> Accept Duty
                  </button>
                  <button className="w-full bg-slate-950 text-slate-400 font-bold py-3 rounded-xl hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition-all text-sm">
                    Decline
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

export default DriverProposalsTab;
