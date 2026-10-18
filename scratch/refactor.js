const fs = require('fs');
const path = require('path');

const applyReplacements = () => {
    // 1. DriverSettingsTab.jsx
    let filePath = 'c:\\xampp\\htdocs\\ogadriver.ng\\frontend\\src\\components\\driver\\DriverSettingsTab.jsx';
    let content = fs.readFileSync(filePath, 'utf-8');

    if (!content.includes('useNavigate')) {
        content = content.replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState } from 'react';\nimport { useNavigate } from 'react-router-dom';");
    }
    if (!content.includes('ChevronRight')) {
        content = content.replace('Car,', 'Car,\n  ChevronRight,');
    }
    if (!content.includes('const navigate = useNavigate();')) {
        content = content.replace('const [savedPlaces, setSavedPlaces] = useState(null);', 'const navigate = useNavigate();\n  const [savedPlaces, setSavedPlaces] = useState(null);');
    }

    const quickLinks = `<section className="space-y-3 mb-6">
        <button type="button" onClick={() => navigate('/driver/status')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1cd188] transition w-full">
          <div className="flex items-center gap-3"><Car className="h-5 w-5 text-[#1cd188]" /><span className="font-bold text-white">Driver Status & Mode</span></div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
        <button type="button" onClick={() => navigate('/driver/availability')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1cd188] transition w-full">
          <div className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-[#1cd188]" /><span className="font-bold text-white">Work Availability</span></div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
        <button type="button" onClick={() => navigate('/driver/notifications')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-[#1cd188] transition w-full">
          <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-[#1cd188]" /><span className="font-bold text-white">Notifications</span></div>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
      </section>`;

    content = content.replace(/<section className=\{cardClass\} aria-labelledby="driver-status-title">[\s\S]*?<\/section>/, quickLinks);
    content = content.replace(/<section className=\{cardClass\}>\s*<h2 className="mb-4 border-b border-white\/10 pb-3 text-lg font-black">Work Availability<\/h2>[\s\S]*?<\/section>/, '');
    content = content.replace(/<section className=\{cardClass\}>\s*<h2 className="mb-4 flex items-center gap-2 border-b border-white\/10 pb-3 text-lg font-black"><Shield className="h-5 w-5 text-\[#1cd188\]" \/> Notifications<\/h2>[\s\S]*?<\/section>/, '');

    fs.writeFileSync(filePath, content, 'utf-8');

    // 2. DriverComplianceTab.jsx
    filePath = 'c:\\xampp\\htdocs\\ogadriver.ng\\frontend\\src\\components\\driver\\DriverComplianceTab.jsx';
    content = fs.readFileSync(filePath, 'utf-8');

    if (!content.includes('useNavigate')) {
        content = content.replace("import { authService }", "import { useNavigate } from 'react-router-dom';\nimport { authService }");
    }
    if (!content.includes('const navigate = useNavigate();')) {
        content = content.replace('const [isCameraOpen, setIsCameraOpen]', 'const navigate = useNavigate();\n  const [isCameraOpen, setIsCameraOpen]');
    }

    const badgeLink = `<div className="space-y-6">
          <button type="button" onClick={() => navigate('/driver/badge')} className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl p-5 shadow-lg flex items-center justify-between hover:border-brandMint transition w-full">
            <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-brandMint" /><span className="font-bold text-white">Universal Identity Badge</span></div>
            <ChevronRight className="h-5 w-5 text-slate-500" />
          </button>
        </div>`;

    content = content.replace(/\{\/\* Dynamic Digital ID Panel Card \*\/\}[\s\S]*?<\/div>\s*<\/div>/, '{/* Dynamic Digital ID Panel Card */}\n        ' + badgeLink);

    fs.writeFileSync(filePath, content, 'utf-8');

    // 3. DriverPortal.jsx
    filePath = 'c:\\xampp\\htdocs\\ogadriver.ng\\frontend\\src\\pages\\DriverPortal.jsx';
    content = fs.readFileSync(filePath, 'utf-8');

    const importsToAdd = `import DriverStatusScreen from '../components/driver/DriverStatusScreen';
import WorkAvailabilityScreen from '../components/driver/WorkAvailabilityScreen';
import NotificationsScreen from '../components/driver/NotificationsScreen';
import IdentityBadgeScreen from '../components/driver/IdentityBadgeScreen';
`;

    if (!content.includes('DriverStatusScreen')) {
        content = content.replace('import IncomingRideOverlay', importsToAdd + 'import IncomingRideOverlay');
    }

    const routesToAdd = `<Route path="status" element={<DriverStatusScreen driver={driver} setDriver={setDriver} serviceMode={profileHook.serviceMode} setServiceMode={profileHook.setServiceMode} />} />
            <Route path="availability" element={<WorkAvailabilityScreen employmentTypes={profileHook.employmentTypes} setEmploymentTypes={profileHook.setEmploymentTypes} />} />
            <Route path="notifications" element={<NotificationsScreen driver={driver} />} />
            <Route path="badge" element={<IdentityBadgeScreen driver={driver} user={user} isIndependent={driver?.has_vehicle === true} guarantorAUnlocked={driver?.guarantor_a_status === 'verified'} guarantorBUnlocked={driver?.guarantor_b_status === 'verified'} uploadedFiles={uploadedFiles} />} />`;

    if (!content.includes('path="status"')) {
        content = content.replace('<Route path="compliance" element=', routesToAdd + '\n            <Route path="compliance" element=');
    }

    fs.writeFileSync(filePath, content, 'utf-8');
};

applyReplacements();
