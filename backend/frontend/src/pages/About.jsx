import React from 'react';
import Navbar from '../components/Navbar';
import StatsFooter from '../components/StatsFooter';

const About = () => {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Corporate Profile & Governance
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">About <span className="text-emerald-400">OgaDriver</span></h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Revolutionizing driver recruitment, corporate fleet management, and chauffeur services across Nigeria.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 mb-8 space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">Corporate Ownership</h2>
          <p className="text-slate-300 leading-relaxed text-sm">
            <strong className="text-white">OgaDriver (ogadriver.ng)</strong> is a proprietary commercial technology platform and software product wholly owned, developed, and operated by <strong className="text-emerald-400">Cejmart Island Int'l Ltd</strong>, a registered corporate entity under the Corporate Affairs Commission (CAC) of the Federal Republic of Nigeria.
          </p>
          <p className="text-slate-300 leading-relaxed text-sm">
            Cejmart Island Int'l Ltd established OgaDriver to address key logistical, security, and verification challenges in the Nigerian transportation ecosystem by providing automated background checks, professional vetting, and on-demand mobility matching for private individuals, VIP executives, and corporate organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Registered Corporate Office</h3>
            <p className="text-sm font-semibold text-emerald-400 mb-1">Cejmart Island Int'l Ltd</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              No. 14, Dutsen Street, Gbazango Extension, Kubwa, Abuja-FCT, Nigeria.
            </p>
            <p className="text-xs text-slate-400">
              Jurisdiction: Federal Republic of Nigeria
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Official Communications</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p><span className="text-slate-500 font-semibold">General Inquiries:</span> support@ogadriver.ng</p>
              <p><span className="text-slate-500 font-semibold">Corporate Relations:</span> info@ogadriver.ng</p>
              <p><span className="text-slate-500 font-semibold">Telephone:</span> +234 805 404 4980 / +234 812 729 0420</p>
              <p><span className="text-slate-500 font-semibold">Website:</span> https://ogadriver.ng</p>
            </div>
          </div>
        </div>
      </main>
      <StatsFooter />
    </div>
  );
};

export default About;
