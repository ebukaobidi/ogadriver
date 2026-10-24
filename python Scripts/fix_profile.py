# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the toggle logic
old_toggle_func = """  const handleVehicleOwnershipToggle = async () => {
    const nextVal = !prefs.has_vehicle;
    setPrefs(p => ({ ...p, has_vehicle: nextVal }));
    
    // Auto-save to backend
    if (driver?.id) {
      try {
        await api.put(`/drivers/${driver.id}`, { has_vehicle: nextVal });
        alert(`Driver Status Saved: ${nextVal ? 'Independent Operator' : 'Fleet Operative'}`);
      } catch(e) {}
    }

    if (nextVal) {
      const hasCarInfo = !!(driver?.vehicle_make || driver?.vehicle_model || driver?.license_plate);
      if (!hasCarInfo) {
        setShowVehicleMissingModal(true);
      }
    } else {
      // If switching to Fleet, automatically open employment section or notify
      setOpenSection('employment');
    }
  };"""

new_toggle_func = """  const setDriverStatus = async (isIndependent) => {
    if (prefs.has_vehicle === isIndependent) return; // No change
    
    setPrefs(p => ({ ...p, has_vehicle: isIndependent }));
    
    // Auto-save to backend
    if (driver?.id) {
      try {
        await api.put(`/drivers/${driver.id}`, { has_vehicle: isIndependent });
        // Don't alert on every click to avoid annoying popups, maybe just a silent save or toast.
        // We'll use a small alert for now since we don't have a toast component.
      } catch(e) {
         console.error('Failed to save status');
      }
    }

    if (isIndependent) {
      const hasCarInfo = !!(driver?.vehicle_make || driver?.vehicle_model || driver?.license_plate);
      if (!hasCarInfo) {
        setShowVehicleMissingModal(true);
      }
    }
  };"""

text = text.replace(old_toggle_func, new_toggle_func)

# Fix the Independent button onClick
old_ind_btn = """              <button 
                onClick={handleVehicleOwnershipToggle}"""
new_ind_btn = """              <button 
                onClick={() => setDriverStatus(true)}"""
text = text.replace(old_ind_btn, new_ind_btn)

# Fix the Fleet button onClick
old_fleet_btn = """              <button onClick={async () => {
                setPrefs(p => ({ ...p, has_vehicle: false }));
                if (driver?.id) {
                  try {
                    await api.put(`/drivers/${driver.id}`, { has_vehicle: false });
                    alert('Driver Status Saved: Fleet Operative');
                  } catch(e) {}
                }
                setOpenSection('employment');
              }}"""
new_fleet_btn = """              <button onClick={() => setDriverStatus(false)}"""
text = text.replace(old_fleet_btn, new_fleet_btn)

# Add Logout and Support section at the bottom
end_pattern = r"\s*<InstantCashoutModal.*?</InstantCashoutModal>\s*</div>\s*\);\s*};\s*export default DriverProfileTab;"
new_end = """
        {/* Settings & Support */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 mb-8 shadow-lg flex flex-col gap-2">
          <button onClick={() => alert('Support module coming soon')} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <HelpCircle size={16} />
              </div>
              <span className="font-bold text-sm">Help & Support</span>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </button>

          <button onClick={doLogout} className="w-full flex items-center justify-between p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all mt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <Lock size={16} />
              </div>
              <span className="font-bold text-sm">Sign Out</span>
            </div>
            <ChevronRight size={16} className="opacity-50" />
          </button>
        </div>

        <InstantCashoutModal 
        isOpen={showCashoutModal} 
        onClose={() => setShowCashoutModal(false)} 
        walletBalance={walletBalance}
        onCashoutSuccess={() => {}}
      />
    </div>
  );
};

export default DriverProfileTab;
"""
text = re.sub(end_pattern, new_end, text, flags=re.DOTALL)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

