import re

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'  const setDriverStatus = async \(hasVehicle\) => \{.*?  \};', re.DOTALL)

new_str = '''  const handleServiceModeChange = async (mode) => {
    if (driver?.service_mode === mode) return;

    const updatedDriver = await updateDriver({ service_mode: mode });
    if (!updatedDriver) return;

    if ((mode === 'driver_with_vehicle' || mode === 'both') && !(driver?.vehicle_make || driver?.vehicle_model || driver?.license_plate || driver?.vehicle)) {
      setShowVehicleMissingModal(true);
    }
    
    if ((mode === 'driver_without_vehicle' || mode === 'both') && !(driver?.guarantor_a_name || driver?.guarantor_b_name)) {
      alert("Please ensure you update your Guarantors and Police Clearance in the Documents section to be fully active as a Fleet Operative.");
    }
  };'''

content = pattern.sub(new_str, content)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
