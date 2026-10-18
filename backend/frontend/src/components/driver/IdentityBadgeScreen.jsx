import React from 'react';
import { ShieldCheck, Lock, ArrowLeft, Award, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IdentityBadgeScreen = ({ driver, user, isIndependent, guarantorAUnlocked, guarantorBUnlocked, uploadedFiles }) => {
  const navigate = useNavigate();

  const isLagos = Boolean(
    driver?.state?.name?.toLowerCase()?.includes('lagos') ||
    driver?.state_name?.toLowerCase()?.includes('lagos') ||
    driver?.residence_state?.toLowerCase()?.includes('lagos') ||
    driver?.state_id === 25 || driver?.state_id === '25' ||
    driver?.operating_state === 'Lagos'
  );

  const stateName = (driver?.state?.name || driver?.state_name || (isLagos ? 'LAGOS' : 'STATE')).toUpperCase();
  const countryCode = (user?.country_code || driver?.country_code || 'NG').toUpperCase();
  const countryName = (user?.country || driver?.country || 'NIGERIA').toUpperCase();

  const isUnlocked = Boolean(
    (isIndependent && uploadedFiles?.licenseFront && uploadedFiles?.vehicleLicense) ||
    (!isIndependent && (guarantorAUnlocked || uploadedFiles?.guaAForm) && uploadedFiles?.licenseFront) ||
    driver?.is_verified
  );

  const systemId = driver?.system_id || user?.driver_id || (user?.id ? `OGD-${countryCode}-${stateName.slice(0,2)}-${user.id.toString(16).toUpperCase().padStart(4, '0')}` : 'OGD-VERIFIED');

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-6 text-white max-w-2xl mx-auto flex flex-col justify-center animate-fade-in pb-24">
      
      {/* Back Button */}
      <div className="mb-4">
        <button 
          onClick={() => navigate('/driver/account')}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold transition hover:bg-slate-800 shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#1cd188]" />
          <span>Back to Driver Hub</span>
        </button>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 w-full shadow-2xl">
        <div>
          <h4 className="font-bold text-sm text-[#1cd188] uppercase tracking-widest font-mono">
            Universal Driver Identity Badge
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Official proof of verification for passenger rides and corporate chauffeur contracts.
          </p>
        </div>

        {isUnlocked ? (
          /* UNLOCKED BADGE PREVIEW */
          <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-[#1cd188]/40 rounded-3xl p-6 sm:p-8 space-y-5 relative overflow-hidden shadow-[0_0_40px_rgba(28,209,136,0.15)] animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1cd188]/10 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="text-left">
                <h5 className="font-mono text-sm font-black text-[#1cd188] tracking-wider">OGADRIVER</h5>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  {countryName} · {stateName} DIVISION
                </span>
              </div>
              <div className="bg-[#1cd188]/20 border border-[#1cd188]/50 text-[#1cd188] rounded-full p-1.5 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Driver Face Shot */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl border-2 border-[#1cd188] overflow-hidden bg-slate-800 relative z-10 shadow-xl shadow-[#1cd188]/10">
              {user && (user.avatar || user.avatar_url) ? (
                <img 
                  src={user.avatar || user.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-[#1cd188] font-black text-3xl bg-slate-800">${user?.name?.charAt(0) || 'D'}</div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1cd188] font-black text-3xl bg-slate-800">
                  {user?.name?.charAt(0) || 'D'}
                </div>
              )}
            </div>

            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-center gap-1.5">
                <h6 className="font-black text-xl text-white">{user?.name || driver?.name || 'Verified Operative'}</h6>
                <CheckCircle2 className="w-4 h-4 text-[#1cd188]" />
              </div>
              <p className="font-mono text-xs text-[#1cd188] uppercase tracking-wider font-bold">
                {driver?.operative_tier || `${driver?.tier || 'Standard'} Tier Driver`}
              </p>
            </div>

            {/* Fixed Identical System ID Pattern */}
            <div className="bg-slate-950 border border-[#1cd188]/30 rounded-xl py-3 px-4 font-mono text-xs text-[#1cd188] tracking-widest font-black relative z-10 text-center shadow-inner">
              {systemId}
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono relative z-10 border-t border-white/10 pt-3">
              <span>STATE: {stateName}</span>
              <span>EXP: {driver?.years_of_experience ? `${driver.years_of_experience} YRS` : 'VERIFIED'}</span>
              <span>REG: {new Date().getFullYear()}</span>
            </div>

          </div>

        ) : (

          /* LOCKED BADGE PREVIEW */
          <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 py-12 flex flex-col items-center justify-center space-y-4 border-dashed relative">
            <div className="p-4 bg-slate-900 border border-white/10 rounded-full text-slate-500">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-slate-300 text-sm">System Identity Badge Locked</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Complete your identity checks and document uploads in the Compliance Portal to forge your universal driver badge.
              </p>
            </div>
            <button 
              onClick={() => navigate('/driver/compliance')}
              className="mt-2 bg-[#1cd188] text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl hover:bg-emerald-400 transition"
            >
              Open Compliance Portal
            </button>
          </div>

        )}

        <div className="text-xs text-slate-500 leading-relaxed text-left border-t border-white/10 pt-4 w-full">
          <span className="font-bold text-slate-400">Audit Protocol:</span> Background verifications and roadworthiness statuses are verified by central security dispatch. Active badge status ensures immediate hiring access across both the Ride & Private Hire networks.
        </div>

      </div>
    </div>
  );
};

export default IdentityBadgeScreen;
