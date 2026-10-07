import React from 'react';
import { Activity, ShieldAlert, Fingerprint, RefreshCcw } from 'lucide-react';

const SecurityArchitecture = () => {
    return (
        <section id="security" className="py-24 bg-corporateNavy relative overflow-hidden border-b border-slate-900">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c2340_1px,transparent_1px),linear-gradient(to_bottom,#0c2340_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-[1]"></div>
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-red-500/10 border border-red-500/20 rounded-2xl mb-2">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                        Tactical Defense <span className="text-red-500">Architecture</span>
                    </h2>
                    <p className="text-sm text-slate-300 max-w-xl mx-auto">
                        Because transit across Africa requires more than trust. It requires cryptographic, indisputable verification checkpoints and emergency protocols.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/50 transition-colors group">
                        <Fingerprint className="w-8 h-8 text-slate-500 group-hover:text-brandMint mb-4 transition-colors" />
                        <h4 className="text-white font-bold mb-2">Biometric Shifts</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Every shift start triggers a localized liveness check against the mapped driver database. Anti-spoofing logic drops attempts from unregistered faces.
                        </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-brandMint/50 transition-colors group">
                        <RefreshCcw className="w-8 h-8 text-slate-500 group-hover:text-brandMint mb-4 transition-colors" />
                        <h4 className="text-white font-bold mb-2">Pre-Drive Handover</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Asset condition is verified via a dual-handshake before the engine starts. Both employer and driver must cryptographically sign the vehicle state.
                        </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-red-500/50 transition-colors group">
                        <Activity className="w-8 h-8 text-slate-500 group-hover:text-red-500 mb-4 transition-colors" />
                        <h4 className="text-white font-bold mb-2">Culture Breach Intercept</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Sudden G-force anomalies or aggressive driving patterns trigger automatic culture breach logs delivered directly to the corporate dashboard.
                        </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-red-500/50 transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <ShieldAlert className="w-24 h-24 text-red-500" />
                        </div>
                        <ShieldAlert className="w-8 h-8 text-red-500 mb-4" />
                        <h4 className="text-white font-bold mb-2">Reverse SOS</h4>
                        <p className="text-xs text-slate-400 leading-relaxed relative z-10">
                            Covert distress trigger for drivers facing extortion or hostile interception on transit routes. Silently alerts employers and pre-configured rapid response units.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SecurityArchitecture;
