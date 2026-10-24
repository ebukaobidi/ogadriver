import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add the new UI right after {/* NEW UI: Profile Completion Bar */}'s closing div.
# We will find the {/* 3. Performance Stats Dials (Moved to Profile) */} block and inject our new card above it.

target = '''        {/* 3. Performance Stats Dials (Moved to Profile) */}'''

new_ui = '''        {/* NEW UI: Employment Status Track Selection */}
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
              className={p-4 rounded-xl border text-left transition-all relative }
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className={w-10 h-10 rounded-full flex items-center justify-center }>
                    <Car size={18} />
                  </div>
                  <div>
                    <h4 className={ont-black text-sm }>Independent Operator (Has Car)</h4>
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
                const nextVal = !prefs.has_vehicle;
                setPrefs(p => ({ ...p, has_vehicle: false }));
              }}
              className={p-4 rounded-xl border text-left transition-all relative }
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className={w-10 h-10 rounded-full flex items-center justify-center }>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className={ont-black text-sm }>Fleet Operative (Needs Car)</h4>
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

        {/* 3. Performance Stats Dials (Moved to Profile) */}'''

text = text.replace(target, new_ui)

# Now we need to completely remove the old "Vehicle Ownership toggle" in Accordion 2.
old_toggle = '''                  {/* Vehicle Ownership toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <Car size={18} className="text-[#1cd188]" />
                      <div>
                        <p className="text-white text-xs font-semibold">Vehicle Ownership</p>
                        <p className="text-slate-500 text-[10px]">Active vehicle available</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleVehicleOwnershipToggle}
                      className={w-12 h-6 rounded-full transition-colors flex items-center px-1 }>
                      <div className="w-4 h-4 rounded-full bg-white" />
                    </button>
                  </div>'''

text = text.replace(old_toggle, '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
