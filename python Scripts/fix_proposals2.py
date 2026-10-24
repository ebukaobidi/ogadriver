# -*- coding: utf-8 -*-
import io

path = 'frontend/src/components/driver/DriverProposalsTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# I will find the return statement and replace it entirely with a clean syntax.
import re
pattern = re.compile(r'return \(\s*<div className="bg-\[\#0f172a\] min-h-screen text-white px-4 pt-4 pb-24">.*?\);\s*\}', re.DOTALL)

new_return = """return (
    <div className="bg-[#0f172a] min-h-screen text-white px-4 pt-4 pb-24">
      <h2 className="text-xl font-bold mb-4">Employment & Jobs</h2>
      
      {/* Pill tabs */}
      <div className="flex bg-[#1e293b] rounded-xl p-1 mb-4">
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
            {/* Mock Job 1: Fleet Car */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl text-white">Fleet Vehicle</div>
              <h4 className="text-lg font-black text-white pr-20">2021 Toyota Corolla LE</h4>
              <p className="text-xs text-slate-400 font-mono mb-4">Lagos Island &bull; Fleet Owner: Oga Transport Ltd</p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Rental Cost</p>
                  <p className="text-brandMint font-black">₦35,000<span className="text-xs font-normal text-slate-400">/day</span></p>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Req. Guarantee</p>
                  <p className="text-white font-black">Level 2</p>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all">
                Apply for Vehicle
              </button>
            </div>

            {/* Mock Job 2: Corporate Contract */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl text-slate-900">Corporate Contract</div>
              <h4 className="text-lg font-black text-white pr-24">Executive Bank Driver</h4>
              <p className="text-xs text-slate-400 font-mono mb-4">Victoria Island &bull; Zenith Holdings</p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Monthly Salary</p>
                  <p className="text-amber-400 font-black">₦180,000<span className="text-xs font-normal text-slate-400">/mo</span></p>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Req. Status</p>
                  <p className="text-white font-black">Has Own Car</p>
                </div>
              </div>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all border border-slate-700">
                Apply for Contract
              </button>
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
                <div key={offer.id} className="bg-[#1e293b] rounded-2xl p-5 border border-slate-800">
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
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-800/50">
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
}"""

text = pattern.sub(new_return, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

