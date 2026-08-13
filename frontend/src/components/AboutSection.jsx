import React from 'react';
import { Fingerprint, FileCheck, Landmark } from 'lucide-react';

const AboutSection = ({ content }) => {
    return (
        <section id="about" className="py-20 bg-slate-950 relative overflow-hidden border-b border-slate-900">
            {/* Localized pattern elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1cd18802_1px,transparent_1px)] bg-[size:3rem_3rem] z-[1]"></div>
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-brandMint/5 rounded-full blur-3xl z-10"></div>
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Details */}
                    <div className="lg:col-span-7 space-y-6">
                        <span className="text-xs font-mono text-brandMint uppercase tracking-widest border border-brandMint/30 rounded-full px-4 py-1 bg-brandMint/5">
                            {content?.about?.tagline || 'LAGOS-BORN, PAN-AFRICAN SECURITY'}
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase leading-none"
                            dangerouslySetInnerHTML={{ __html: content?.about?.title || "Securing Africa's <br/>logistics heartland <br/>from the <span class=\"text-brandMint\">source.</span>" }}>
                        </h2>
                        
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed"
                           dangerouslySetInnerHTML={{ __html: content?.about?.paragraph_1 || 'Ogadriver was founded in the tech corridors of <strong>Yaba, Lagos</strong> with a single urgent mandate: to resolve the critical trust and identity deficits in Nigeria’s commercial transport and corporate fleet industry. Traditional driver verification in West Africa is broken, relying on easily forged physical papers and unverified guarantees.' }}>
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed"
                           dangerouslySetInnerHTML={{ __html: content?.about?.paragraph_2 || 'By deploying our proprietary identity matching pipelines directly connected to the <strong>National Identity Management Commission (NIMC)</strong> and the <strong>Federal Road Safety Corps (FRSC)</strong>, we build an impenetrable digital ledger. From corporate drivers navigating Victoria Island to long-haul haulage pilots traversing the Lagos-Ibadan Expressway, we ensure your vehicles and cargo are operated by high-trust, biometrically authenticated professionals.' }}>
                        </p>

                        {/* Local Icons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                            <div className="p-4 bg-corporateBlue/35 border border-slate-850 rounded-xl flex items-start gap-3">
                                <Fingerprint className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">NIMC Framework</h4>
                                    <p className="text-[10px] text-slate-400">Direct biometric liveness sync preventing identity theft.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-corporateBlue/35 border border-slate-850 rounded-xl flex items-start gap-3">
                                <FileCheck className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">LASDRI Integration</h4>
                                    <p className="text-[10px] text-slate-400">State mandate driving compliance tests synced in Lagos.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-corporateBlue/35 border border-slate-850 rounded-xl flex items-start gap-3">
                                <Landmark className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Guarantor Bond</h4>
                                    <p className="text-[10px] text-slate-400">Legally backed digital indemnity structures.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Details */}
                    <div className="lg:col-span-5 bg-corporateBlue/60 border border-slate-800 rounded-3xl p-8 relative shadow-2xl">
                        <div className="absolute -top-3 -left-3 bg-brandMint text-corporateNavy font-mono text-[10px] font-black tracking-widest px-3 py-1 rounded">
                            HQ: YABA, NIGERIA
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-white uppercase tracking-tight mb-4">Our Operational Geofence</h3>
                        
                        <div className="space-y-4">
                            <p className="text-xs text-slate-300">We secure corporate executive runs and heavy-duty logistics corridors nationwide:</p>
                            
                            <div className="space-y-2 font-mono text-xs text-slate-400">
                                <div className="flex justify-between items-center py-2 border-b border-slate-850">
                                    <span className="flex items-center gap-1.5 text-white">
                                        <span className="w-2 h-2 rounded-full bg-brandMint animate-pulse"></span>
                                        Lagos Coastal Corridors
                                    </span>
                                    <span className="text-brandMint font-bold">100% SECURE</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-850">
                                    <span className="flex items-center gap-1.5 text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        Lagos - Ibadan Transit
                                    </span>
                                    <span className="text-slate-400">Active Patrol</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-850">
                                    <span className="flex items-center gap-1.5 text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        Abuja Federal Capital
                                    </span>
                                    <span className="text-slate-400">Active Patrol</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="flex items-center gap-1.5 text-slate-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        Port Harcourt Port Hubs
                                    </span>
                                    <span className="text-slate-400">Active Patrol</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800/80 bg-slate-950/50 p-4 rounded-xl space-y-2">
                                <p className="text-[11px] italic text-slate-300">
                                    "In Africa, trust isn’t just verified; it’s built by bridging community and sovereign technology. We built Ogadriver to eliminate the vulnerability of transit asset handovers."
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-white font-mono uppercase tracking-wide">The Sovereign Logistics Council</span>
                                    <span className="text-[10px] text-brandMint font-mono font-bold">Lagos, NG</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AboutSection;
