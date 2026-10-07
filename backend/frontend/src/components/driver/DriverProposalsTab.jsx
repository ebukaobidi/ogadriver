import React, { useEffect, useState } from 'react';
import { MapPin, Loader2, CheckCircle2, Briefcase } from 'lucide-react';
import api from '../../api/axios';

const safeArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.data && Array.isArray(val.data)) return val.data;
  if (val.data && val.data.data && Array.isArray(val.data.data)) return val.data.data;
  return [];
};

export default function DriverProposalsTab({ proposals = [], driver }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(() => safeArray(proposals));
  const [processingId, setProcessingId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState('market');

  const proposalsList = safeArray(data);
  
  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/drivers/${driver?.id || 'me'}/proposals`);
        const list = safeArray(res.data);
        setData(list);
        setUnreadCount(list.filter(p => !p.read_at).length);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [driver]);

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/proposals/${id}/accept`);
      setData(proposalsList.map(p => p.id === id ? { ...p, status: 'accepted' } : p));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm('Are you sure you want to decline this job offer?')) return;
    setProcessingId(id);
    try {
      await api.post(`/proposals/${id}/decline`);
      setData(proposalsList.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const displayedProposals = proposalsList.filter(p => activeSubTab === 'pending' ? p.status === 'pending' : p.status === 'accepted');

  return (
    <div className="bg-[#0f172a] min-h-screen text-white px-4 pt-4 pb-24">
      <h2 className="text-xl font-bold mb-4">Employment & Jobs</h2>
      
      {/* Pill tabs */}
      <div className="flex bg-slate-900/60 backdrop-blur-2xl rounded-xl p-1 mb-4">
        <button onClick={() => setActiveSubTab('market')}
          className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
            activeSubTab === 'market' ? 'bg-blue-600 text-white' : 'text-slate-500'
          }`}>
          Job Market
        </button>
        <button onClick={() => setActiveSubTab('pending')}
          className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
            activeSubTab === 'pending' ? 'bg-[#0f172a] text-white' : 'text-slate-500'
          }`}>
          Direct Offers
        </button>
        <button onClick={() => setActiveSubTab('accepted')}
          className={`flex-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all ${
            activeSubTab === 'accepted' ? 'bg-brandMint text-[#0f172a]' : 'text-slate-500'
          }`}>
          My Contracts
        </button>
      </div>

      {activeSubTab === 'market' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-600/10 border border-blue-500/20 rounded-2xl p-5 mb-2">
            <h3 className="font-black text-blue-400 mb-1">The Employment Hub</h3>
            <p className="text-xs text-blue-200/60 leading-relaxed">Browse available fleet vehicles for hire or apply for corporate driving contracts. Verified operatives only.</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="w-12 h-12 text-blue-500/20 mb-4" />
              <p className="text-white font-bold text-lg mb-2">No Open Opportunities</p>
              <p className="text-slate-400 text-xs max-w-[250px]">
                There are currently no fleet vehicles or corporate contracts available in your region. Check back later.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab !== 'market' && (
        <>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#1cd188] w-8 h-8" /></div>
          ) : displayedProposals.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <p className="text-[#1cd188] text-xs font-bold uppercase tracking-widest mb-1">INBOX EMPTY:</p>
              <p className="text-white font-bold text-lg mb-2">No Direct Offers Yet</p>
              <p className="text-slate-400 text-xs text-center mb-6 px-4">
                You have no direct job offers. Head over to the Job Market to browse open contracts and fleet vehicles.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayedProposals.map(offer => (
                <div key={offer.id} className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-5 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{offer.hirer_name || offer.client_name || 'Hirer'}</h3>
                      <p className="text-slate-400 text-sm">{offer.job_title || 'Standard Run'}</p>
                    </div>
                    {offer.status === 'accepted' ? (
                      <span className="bg-[#1cd188]/20 text-[#1cd188] px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 size={12} /> Accepted
                      </span>
                    ) : offer.status === 'rejected' ? (
                      <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Declined</span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 mb-4">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300 text-sm truncate">{offer.pickup_location || 'Lagos'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10/50">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Amount</p>
                      <span className="text-xl font-black text-[#1cd188]">₦{Number(offer.salary_offered || offer.amount || 0).toLocaleString()}</span>
                    </div>
                    {offer.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDecline(offer.id)} disabled={processingId === offer.id} className="bg-slate-800 text-red-400 font-bold text-xs px-4 py-2 rounded-xl transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50">
                          Decline
                        </button>
                        <button onClick={() => handleAccept(offer.id)} disabled={processingId === offer.id} className="bg-[#1cd188] text-[#0f172a] font-bold text-xs px-6 py-2 rounded-xl transition-all hover:brightness-110 active:scale-95 flex items-center justify-center min-w-[100px] disabled:opacity-50">
                          {processingId === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept Offer'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}