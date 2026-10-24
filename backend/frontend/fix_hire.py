# -*- coding: utf-8 -*-
import re

try:
    with open('frontend/src/components/hirer/MobileHireDirectory.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update filters state
    old_filters = r'const \[filters, setFilters\] = useState\(\{[\s\S]*?\}\);'
    new_filters = '''const [filters, setFilters] = useState({
    employment_type: '',
    vehicle_required: false,
    min_rating: 0,
    sort_by: 'distance', // 'distance' | 'rating' | 'rate'
    merit_tier: 'all', // 'tier1', 'tier2', 'all'
    suv_only: false,
    armed_guard: false
  });'''
    content = re.sub(old_filters, new_filters, content, count=1)

    # 2. Update hireForm state
    old_hireform = r'const \[hireForm, setHireForm\] = useState\(\{[\s\S]*?notes: \'\'\n  \}\);'
    new_hireform = '''const [hireForm, setHireForm] = useState({
    hiring_for: 'corporate',
    contract_type: 'monthly', // 'daily' | 'monthly' | 'one_time' | 'hourly'
    duration_value: 1,
    pickup_location: '',
    dropoff_location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    rate: '150000',
    vehicle_required: false,
    accommodation_required: false,
    notes: ''
  });'''
    content = re.sub(old_hireform, new_hireform, content, count=1)

    # 3. Add filter logic inside useMemo
    filter_injection_point = r'if \(filters\.vehicle_required && !driver\.has_vehicle\) return false;\s*return true;'
    new_filter_logic = '''if (filters.vehicle_required && !driver.has_vehicle) return false;
      
      // Merit tier filter
      if (filters.merit_tier === 'tier1' && parseFloat(driver.rating || 0) < 4.8) return false;
      if (filters.merit_tier === 'tier2' && parseFloat(driver.rating || 0) < 4.2) return false;

      // SUV filter
      if (filters.suv_only && !driver.has_suv && driver.vehicle_type?.toLowerCase() !== 'suv') return false;
      
      // Armed guard filter
      if (filters.armed_guard && !driver.has_armed_guard && !driver.security_certified) return false;
      
      return true;'''
    content = re.sub(filter_injection_point, new_filter_logic, content)

    # 4. Advanced Filter UI in MODAL 1
    ui_injection = r'\{/\* 6\. Filter Actions \*/\}'
    new_ui = '''{/* 5.5 Advanced Filtering */}
            <div className="bg-[#1e293b] p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advanced Filtering</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">SUVs Only</span>
                  <span className="text-[10px] text-slate-400">Drivers with SUV vehicles</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setFilters({ ...filters, suv_only: !filters.suv_only })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${filters.suv_only ? 'bg-[#1cd188]' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${filters.suv_only ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">Armed Escort / Guard</span>
                  <span className="text-[10px] text-slate-400">Security certified drivers</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setFilters({ ...filters, armed_guard: !filters.armed_guard })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${filters.armed_guard ? 'bg-[#1cd188]' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${filters.armed_guard ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">Merit Tier</span>
                <div className="flex gap-2">
                  {['all', 'tier1', 'tier2'].map(tier => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setFilters({ ...filters, merit_tier: tier })}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                        filters.merit_tier === tier
                          ? 'bg-[#1cd188] text-[#0f172a] border-[#1cd188]'
                          : 'bg-[#0f172a] text-slate-400 border-slate-800'
                      }`}
                    >
                      {tier === 'all' ? 'Any Tier' : tier === 'tier1' ? 'Tier 1 Elite' : 'Tier 2+'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Filter Actions */}'''
    content = re.sub(ui_injection, new_ui, content)

    # 5. Reset advanced filters in RotateCcw button
    old_reset = r'onClick=\{.*?setFilters\(\{[\s\S]*?\}\).*?\}'
    new_reset = '''onClick={() => setFilters({
                    employment_type: '',
                    vehicle_required: false,
                    min_rating: 0,
                    sort_by: 'distance',
                    merit_tier: 'all',
                    suv_only: false,
                    armed_guard: false
                  })}'''
    content = re.sub(old_reset, new_reset, content, count=1)

    # 6. Contract Negotiation UI
    old_contract_ui = r'\{/\* 5\. Offered Amount \*/\}[\s\S]*?</div>\s*</div>\s*</div>'
    new_contract_ui = '''{/* 5. Custom Duration & Contract Negotiation UI */}
              <div className="bg-[#1e293b] p-3.5 rounded-2xl border border-[#1cd188]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#1cd188] mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Contract Negotiation</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Duration ({hireForm.contract_type === 'hourly' ? 'Hours' : hireForm.contract_type === 'daily' ? 'Days' : hireForm.contract_type === 'one_time' ? 'Trips' : 'Months'})
                    </label>
                    <div className="flex items-center bg-[#0f172a] border border-slate-800 rounded-xl px-2 h-10">
                      <button type="button" onClick={() => setHireForm({...hireForm, duration_value: Math.max(1, (hireForm.duration_value||1) - 1)})} className="p-1 text-slate-400 hover:text-[#1cd188]"><Minus className="w-3.5 h-3.5" /></button>
                      <input 
                        type="number"
                        min="1"
                        value={hireForm.duration_value || 1}
                        onChange={e => setHireForm({...hireForm, duration_value: Number(e.target.value)})}
                        className="w-full text-center bg-transparent text-white text-sm font-bold focus:outline-none"
                      />
                      <button type="button" onClick={() => setHireForm({...hireForm, duration_value: (hireForm.duration_value||1) + 1})} className="p-1 text-slate-400 hover:text-[#1cd188]"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Custom Offer Rate (₦)
                    </label>
                    <div className="relative h-10">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1cd188] font-bold text-sm">₦</span>
                      <input 
                        type="number" 
                        required
                        min="1000"
                        placeholder="Offer" 
                        value={hireForm.rate} 
                        onChange={e => setHireForm({...hireForm, rate: e.target.value})} 
                        className="w-full h-full pl-6 pr-2 py-2 bg-[#0f172a] border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-[#1cd188] text-sm" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 mt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Est. Total Proposal:</span>
                  <span className="text-sm font-black text-white">₦{((Number(hireForm.rate) || 0) * (Number(hireForm.duration_value) || 1)).toLocaleString()}</span>
                </div>
              </div>'''
    content = re.sub(old_contract_ui, new_contract_ui, content, count=1)

    # 7. Calendar and Submit Button
    old_submit_btn = r'<button\s*type="submit"\s*disabled=\{hiring\}[\s\S]*?Send Offer to.*?</button>'
    new_submit_btn = '''<div className="flex gap-2 items-center">
                <button 
                  type="button"
                  className="bg-[#0f172a] border border-slate-700 text-slate-300 hover:text-white hover:border-[#1cd188] p-3.5 rounded-2xl flex items-center justify-center transition-colors shadow-sm"
                  title="Schedule Calendar"
                >
                  <Calendar className="w-5 h-5" />
                </button>
                <button 
                  type="submit"
                  disabled={hiring}
                  className="flex-1 bg-[#1cd188] text-[#0f172a] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm disabled:opacity-70 active:scale-[0.98] transition-transform"
                >
                  {hiring ? (
                    <div className="w-5 h-5 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Offer to {selectedDriver.user?.name?.split(' ')[0] || selectedDriver.name?.split(' ')[0] || 'Driver'}
                    </>
                  )}
                </button>
              </div>'''
    content = re.sub(old_submit_btn, new_submit_btn, content, count=1)

    with open('frontend/src/components/hirer/MobileHireDirectory.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
except Exception as e:
    print(e)
