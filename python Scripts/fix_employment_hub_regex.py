import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern1 = re.compile(r'\{\/\* 3\. Performance Stats Dials \(Moved to Profile\) \*\/\}.*?<div className="bg-\[\#1e293b\] border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg">', re.DOTALL)

new_ui = '''{/* NEW UI: Employment Status Track Selection */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
                <ShieldCheck size={12} /> Employment Track
              </p>
              <h3 className="text-white font-black text-lg">Driver Status</h3>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Track A: Independent Operator */}
            <button 
              onClick={handleVehicleOwnershipToggle}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                prefs.has_vehicle 
                ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                : 'bg-[#0f172a] border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prefs.has_vehicle ? 'bg-emerald-500 text-[#0f172a]' : 'bg-slate-800 text-slate-400'}`}>
                    <Car size={18} />
                  </div>
                  <div>
                    <h4 className={`font-black text-sm ${prefs.has_vehicle ? 'text-white' : 'text-slate-300'}`}>Independent Operator (Has Car)</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5 w-4/5">I have my own vehicle. I want to access the Surge Map, Ride Bids, and Corporate Hires.</p>
                  </div>
                </div>
                {prefs.has_vehicle && <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />}
              </div>

              {prefs.has_vehicle && (
                <div className="mt-4 pt-3 border-t border-emerald-500/20">
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2">Required Documents for Approval:</p>
                  <ul className="text-slate-300 text-xs space-y-1">
                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-slate-600" /> Vehicle License & Registration</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-slate-600" /> Comprehensive Insurance</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-slate-600" /> MOT / Road Worthiness</li>
                  </ul>
                  <p className="text-amber-400 text-[10px] font-bold mt-2 flex items-center gap-1 bg-amber-500/10 p-2 rounded-lg">
                    <AlertTriangle size={12} /> Pending Admin Verification. Surge Map Disabled.
                  </p>
                </div>
              )}
            </button>

            {/* Track B: Fleet Operative */}
            <button 
              onClick={() => {
                setPrefs(p => ({ ...p, has_vehicle: false }));
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                !prefs.has_vehicle 
                ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                : 'bg-[#0f172a] border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!prefs.has_vehicle ? 'bg-blue-500 text-[#0f172a]' : 'bg-slate-800 text-slate-400'}`}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className={`font-black text-sm ${!prefs.has_vehicle ? 'text-white' : 'text-slate-300'}`}>Fleet Operative (Needs Car)</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5 w-4/5">I do not have a car. I am looking for employment from a Fleet Owner.</p>
                  </div>
                </div>
                {!prefs.has_vehicle && <CheckCircle2 size={20} className="text-blue-500 flex-shrink-0" />}
              </div>

              {!prefs.has_vehicle && (
                <div className="mt-4 pt-3 border-t border-blue-500/20">
                  <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Required Documents for Job Board:</p>
                  <ul className="text-slate-300 text-xs space-y-1">
                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-slate-600" /> Police Clearance Certificate</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-slate-600" /> 2 Verified Digital Guarantors</li>
                  </ul>
                  <p className="text-amber-400 text-[10px] font-bold mt-2 flex items-center gap-1 bg-amber-500/10 p-2 rounded-lg">
                    <AlertTriangle size={12} /> Pending Guarantor Verification. Profile Hidden from Fleets.
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 3. Performance Stats Dials (Moved to Profile) */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg">'''

text = pattern1.sub(new_ui, text)

# Now remove old vehicle ownership toggle
pattern2 = re.compile(r'\{\/\* Vehicle Ownership toggle \*\/\}.*?<\/button>\s*<\/div>', re.DOTALL)
text = pattern2.sub('', text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
