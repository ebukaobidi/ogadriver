# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fuel Advance Qualification
old_fuel = """<button 
              onClick={() => {
                if (window.confirm(`Request an Instant Fuel Advance of ${formatCurrency(10000, user?.country_code)}?\\n\\nThis will be deducted from your next payout.`)) {
                  alert(`Success! ${formatCurrency(10000, user?.country_code)} Fuel Advance has been credited to your wallet.`);
                  setWalletBalance(prev => prev + 10000);
                }
              }}
              className="mt-4 w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-transform"
            >"""

new_fuel = """<button 
              onClick={() => {
                const trips = driver?.total_trips || 0;
                const rating = parseFloat(driver?.rating || 0);
                if (trips < 100 || rating < 4.7) {
                  alert(`Not Qualified for Fuel Advance.\\n\\nCriteria:\\n- Minimum 100 lifetime trips (You have ${trips})\\n- Minimum 4.70 rating (You have ${rating.toFixed(2)})`);
                  return;
                }
                if (window.confirm(`Request an Instant Fuel Advance of ${formatCurrency(10000, user?.country_code)}?\\n\\nThis will be deducted from your next payout.`)) {
                  alert(`Success! ${formatCurrency(10000, user?.country_code)} Fuel Advance has been credited to your wallet.`);
                  setWalletBalance(prev => prev + 10000);
                }
              }}
              className="mt-4 w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-transform"
            >"""

text = text.replace(old_fuel, new_fuel)

# 2. handleVehicleOwnershipToggle Save Logic
old_vehicle_toggle = """const handleVehicleOwnershipToggle = () => {
    const nextVal = !prefs.has_vehicle;
    setPrefs(p => ({ ...p, has_vehicle: nextVal }));
    if (nextVal) {
      const hasCarInfo = !!(driver?.vehicle_make || driver?.vehicle_model || driver?.license_plate);
      if (!hasCarInfo) {
        setShowVehicleMissingModal(true);
      }
    }
  };"""

new_vehicle_toggle = """const handleVehicleOwnershipToggle = async () => {
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

text = text.replace(old_vehicle_toggle, new_vehicle_toggle)

# 3. Track B Fleet Operative auto-save logic
old_fleet_click = """onClick={() => {
                setPrefs(p => ({ ...p, has_vehicle: false }));
              }}"""

new_fleet_click = """onClick={async () => {
                setPrefs(p => ({ ...p, has_vehicle: false }));
                if (driver?.id) {
                  try {
                    await api.put(`/drivers/${driver.id}`, { has_vehicle: false });
                    alert('Driver Status Saved: Fleet Operative');
                  } catch(e) {}
                }
                setOpenSection('employment');
              }}"""

text = text.replace(old_fleet_click, new_fleet_click)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

