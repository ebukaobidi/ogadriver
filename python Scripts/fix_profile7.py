# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverProfileTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Fuel Advance Button
pattern_fuel = r"onClick=\{\(\) => \{\s*if \(window\.confirm.*?\}\s*\}\s*className"
new_fuel = """onClick={() => {
                const trips = parseInt(driver?.total_trips || 0);
                const rating = parseFloat(driver?.rating || 4.0);
                if (trips < 100 || rating < 4.7) {
                  alert(`Not Qualified for Fuel Advance.\\n\\nCriteria:\\n- Minimum 100 lifetime trips (You have ${trips})\\n- Minimum 4.70 rating (You have ${rating.toFixed(2)})`);
                  return;
                }
                if (window.confirm(`Request an Instant Fuel Advance of ${formatCurrency(10000, user?.country_code)}?\\n\\nThis will be automatically deducted from your next payouts at 0% interest.`)) {
                  setWalletBalance(prev => Number(prev) + 10000);
                  alert(`Success! ${formatCurrency(10000, user?.country_code)} Fuel Advance has been credited to your wallet.`);
                }
              }}
              className"""
text = re.sub(pattern_fuel, new_fuel, text, flags=re.DOTALL)

# 2. Update Vehicle Ownership logic
pattern_toggle = r"const handleVehicleOwnershipToggle = \(\) => \{.*?if \(\!hasCarInfo\) \{\s*setShowVehicleMissingModal\(true\);\s*\}\s*\}\s*\};"
new_toggle = """const handleVehicleOwnershipToggle = async () => {
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
      setOpenSection('employment');
    }
  };"""
text = re.sub(pattern_toggle, new_toggle, text, flags=re.DOTALL)

# 3. Track B Click
pattern_fleet_btn = r"onClick=\{\(\) => \{\s*setPrefs\(p => \(\{ \.\.\.p, has_vehicle: false \}\)\);\s*\}\}"
new_fleet_btn = """onClick={async () => {
                setPrefs(p => ({ ...p, has_vehicle: false }));
                if (driver?.id) {
                  try {
                    await api.put(`/drivers/${driver.id}`, { has_vehicle: false });
                    alert('Driver Status Saved: Fleet Operative');
                  } catch(e) {}
                }
                setOpenSection('employment');
              }}"""
text = re.sub(pattern_fleet_btn, new_fleet_btn, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

