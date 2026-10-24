# -*- coding: utf-8 -*-
import re

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
state_injection = '''  const [bankName, setBankName] = useState(driver?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(driver?.account_number || '');
  const [emergencyName, setEmergencyName] = useState(driver?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(driver?.emergency_contact_phone || '');
  const [weeklyGoal, setWeeklyGoal] = useState(driver?.weekly_goal || 50000);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
'''
content = content.replace("const [interStateEnabled, setInterStateEnabled] = useState(driver?.inter_state_enabled || false);", "const [interStateEnabled, setInterStateEnabled] = useState(driver?.inter_state_enabled || false);\n" + state_injection)

# 2. Add Tier and Goal
# Tier in Hero section
tier_logic = '''
  const driverTier = driver?.total_jobs > 500 ? 'Merit' : driver?.total_jobs > 100 ? 'Gold' : driver?.total_jobs > 20 ? 'Silver' : 'Standard';
  const tierColor = driverTier === 'Merit' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : driverTier === 'Gold' ? 'bg-amber-500 text-amber-950' : driverTier === 'Silver' ? 'bg-slate-300 text-slate-900' : 'bg-slate-700 text-slate-300';
'''
content = content.replace("const systemId = profileUser?.system_id || driver?.system_id || '—';", tier_logic + "\n  const systemId = profileUser?.system_id || driver?.system_id || '—';")

tier_ui = '''
                  <div className={mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg }>
                    {driverTier} Tier
                  </div>
'''
content = content.replace('<h1 className="mt-2 text-2xl font-black leading-none">Profile</h1>', '<h1 className="mt-2 text-2xl font-black leading-none">Profile</h1>' + tier_ui)

# 3. Add Weekly Goal section
goal_ui = '''
      <section className="px-6 mt-4">
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center mb-3 relative z-10">
            <h3 className="text-white font-black text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Weekly Goal
            </h3>
            <button onClick={() => setShowGoalModal(true)} className="text-amber-400 text-xs font-bold hover:text-amber-300">Edit</button>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400">Progress</span>
              <span className="text-white">{currencySymbol}{Number(earningsSummary?.month_earnings || 0).toLocaleString()} / {currencySymbol}{Number(weeklyGoal).toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" style={{ width: ${Math.min(100, ((earningsSummary?.month_earnings || 0) / (weeklyGoal || 1)) * 100)}% }}></div>
            </div>
          </div>
        </div>
      </section>
'''
content = content.replace('</section>\n\n      <section className="mt-6 px-6" aria-labelledby="driver-status-heading">', '</section>\n' + goal_ui + '\n      <section className="mt-6 px-6" aria-labelledby="driver-status-heading">')

# 4. Add Vehicle Details & Bank & Emergency Contacts
sections_ui = '''
      <section className="px-6 mt-6">
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-black text-lg flex items-center gap-2">
              <Car className="w-5 h-5 text-[#1cd188]" /> Active Vehicle
            </h3>
            <button onClick={() => window.location.href='/driver/settings'} className="text-[#1cd188] text-sm font-bold hover:text-emerald-400">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Make & Model</p>
              <p className="text-sm font-medium text-white">{driver?.vehicle_make || '—'} {driver?.vehicle_model || ''}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">License Plate</p>
              <p className="text-sm font-medium text-white">{driver?.license_plate || '—'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-black text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Payout Method
              </h3>
              <button onClick={() => setShowBankModal(true)} className="text-blue-400 text-xs font-bold hover:text-blue-300">Edit</button>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Bank Name</p>
            <p className="text-sm font-medium text-white mb-3">{driver?.bank_name || 'Not Set'}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Account Number</p>
            <p className="text-sm font-medium text-white">{driver?.account_number || 'Not Set'}</p>
          </div>

          <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-black text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-rose-400" /> SOS Contact
              </h3>
              <button onClick={() => setShowEmergencyModal(true)} className="text-rose-400 text-xs font-bold hover:text-rose-300">Edit</button>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Contact Name</p>
            <p className="text-sm font-medium text-white mb-3">{driver?.emergency_contact_name || 'Not Set'}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
            <p className="text-sm font-medium text-white">{driver?.emergency_contact_phone || 'Not Set'}</p>
          </div>
        </div>
      </section>
'''
content = content.replace('<h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">\n            <Briefcase className="w-5 h-5 text-[#1cd188]" /> Professional Details', sections_ui + '\n          <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">\n            <Briefcase className="w-5 h-5 text-[#1cd188]" /> Professional Details')

# 5. Add Modals at the bottom
modals_ui = '''
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#1e293b] p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Payout Method</h3>
            <p className="mb-6 text-sm text-slate-400">Enter your bank details for withdrawals.</p>
            <div className="space-y-4 mb-6">
              <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
              <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowBankModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
              <button type="button" onClick={async () => { await updateDriver({ bank_name: bankName, account_number: accountNumber }); setShowBankModal(false); }} className="flex-1 rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-400">Save</button>
            </div>
          </div>
        </div>
      )}

      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#1e293b] p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Emergency Contact</h3>
            <p className="mb-6 text-sm text-slate-400">Set up a trusted contact for emergencies.</p>
            <div className="space-y-4 mb-6">
              <input type="text" placeholder="Contact Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500" />
              <input type="text" placeholder="Phone Number" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowEmergencyModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
              <button type="button" onClick={async () => { await updateDriver({ emergency_contact_name: emergencyName, emergency_contact_phone: emergencyPhone }); setShowEmergencyModal(false); }} className="flex-1 rounded-xl bg-rose-500 py-3 font-bold text-white hover:bg-rose-400">Save</button>
            </div>
          </div>
        </div>
      )}

      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#1e293b] p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Weekly Goal</h3>
            <p className="mb-6 text-sm text-slate-400">Set a personal earnings target to stay motivated.</p>
            <div className="space-y-4 mb-6">
              <input type="number" placeholder="Target Amount" value={weeklyGoal} onChange={(e) => setWeeklyGoal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
              <button type="button" onClick={async () => { await updateDriver({ weekly_goal: weeklyGoal }); setShowGoalModal(false); }} className="flex-1 rounded-xl bg-amber-500 py-3 font-bold text-white hover:bg-amber-400">Set Goal</button>
            </div>
          </div>
        </div>
      )}
'''
content = content.replace('{showDestinationModal && (', modals_ui + '\n      {showDestinationModal && (')

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
