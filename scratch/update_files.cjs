const fs = require('fs');
let p = 'c:/xampp/htdocs/ogadriver.ng/frontend/src/components/driver/DriverSettingsTab.jsx';
let content = fs.readFileSync(p, 'utf8');
const link = `<button type="button" onClick={() => navigate('/driver/vehicle-rates')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1cd188] transition w-full">
          <div className="flex items-center gap-3"><Car className="h-5 w-5 text-[#1cd188]" /><span className="font-bold text-white">Vehicle & Rates</span></div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
      </section>`;
content = content.replace(/<\/button>\s*<\/section>/, '</button>\n        ' + link);
content = content.replace(/<section className=\{cardClass\}>\s*<h2 className="mb-4 border-b border-white\/10 pb-3 text-lg font-black">Vehicle & Rates<\/h2>[\s\S]*?<\/section>/, '');
fs.writeFileSync(p, content, 'utf8');

let p2 = 'c:/xampp/htdocs/ogadriver.ng/frontend/src/pages/DriverPortal.jsx';
let c2 = fs.readFileSync(p2, 'utf8');
if (!c2.includes('VehicleAndRatesScreen')) {
    c2 = c2.replace('import IdentityBadgeScreen', "import VehicleAndRatesScreen from '../components/driver/VehicleAndRatesScreen';\nimport IdentityBadgeScreen");
    c2 = c2.replace('<Route path="status"', '<Route path="vehicle-rates" element={<VehicleAndRatesScreen driver={driver} serviceMode={profileHook.serviceMode} vehicleMake={profileHook.vehicleMake} setVehicleMake={profileHook.setVehicleMake} vehicleModel={profileHook.vehicleModel} setVehicleModel={profileHook.setVehicleModel} vehicleYear={profileHook.vehicleYear} setVehicleYear={profileHook.setVehicleYear} vehicleColor={profileHook.vehicleColor} setVehicleColor={profileHook.setVehicleColor} licensePlate={profileHook.licensePlate} setLicensePlate={profileHook.setLicensePlate} dailyRate={profileHook.dailyRate} setDailyRate={profileHook.setDailyRate} monthlyRate={profileHook.monthlyRate} setMonthlyRate={profileHook.setMonthlyRate} />} />\n            <Route path="status"');
    fs.writeFileSync(p2, c2, 'utf8');
}
