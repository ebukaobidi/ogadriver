import React from 'react';
import { Check, X, Shield, Activity, Fingerprint, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingMatrix = ({ content }) => {
    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-24 bg-slate-950 relative overflow-hidden border-b border-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1cd1880a,transparent_70%)]"></div>
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <span className="text-xs font-mono text-brandMint uppercase tracking-widest border border-brandMint/30 rounded-full px-4 py-1 bg-brandMint/5">
                        SECURITY SUBSCRIPTIONS
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                        Sovereign Access <span className="text-brandMint">Tiers</span>
                    </h2>
                    <p className="text-sm text-slate-300 max-w-xl mx-auto">
                        Transparent, immutable deployment contracts for independent employers and scale-focused enterprise fleets.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
                    
                    {/* Basic Tier */}
                    <div className="bg-corporateNavy/50 border border-slate-800 rounded-3xl p-8 relative shadow-lg">
                        <div className="space-y-6 border-b border-slate-800 pb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Oga Basic</h3>
                                <p className="text-xs text-slate-400">Perfect for single asset owners and independent employers.</p>
                            </div>
                            <div className="flex items-baseline gap-1 text-white">
                                <span className="text-4xl font-black font-mono">₦5,000</span>
                                <span className="text-sm text-slate-400 font-mono">/mo per driver</span>
                            </div>
                            <button onClick={() => navigate('/register')} className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg py-3.5 text-sm font-bold transition-colors">
                                Deploy Basic Protocol
                            </button>
                        </div>
                        
                        <div className="pt-8 space-y-4">
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-300">Basic NIMC & FRSC Profile Verification</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-300">Digital Handover Checklists</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-300">Standard Work Shift Tracking</span>
                            </div>
                            <div className="flex items-start gap-3 opacity-50">
                                <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-500 line-through">Reverse SOS Shield Activation</span>
                            </div>
                            <div className="flex items-start gap-3 opacity-50">
                                <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-500 line-through">Live Extortion Telemetry</span>
                            </div>
                        </div>
                    </div>

                    {/* Elite Premium Tier */}
                    <div className="bg-corporateBlue border border-brandMint/50 rounded-3xl p-8 relative shadow-2xl shadow-brandMint/10 transform md:scale-105">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brandMint via-emerald-400 to-brandMint rounded-t-3xl"></div>
                        <div className="absolute -top-3 right-6 bg-brandMint text-corporateNavy text-[10px] font-black tracking-widest px-3 py-1 rounded shadow-sm">
                            RECOMMENDED
                        </div>

                        <div className="space-y-6 border-b border-slate-700 pb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Elite Premium</h3>
                                <p className="text-xs text-brandMint/80">Full tactical security pipeline for corporate fleets.</p>
                            </div>
                            <div className="flex items-baseline gap-1 text-white">
                                <span className="text-4xl font-black font-mono">₦25,000</span>
                                <span className="text-sm text-slate-400 font-mono">/mo per driver</span>
                            </div>
                            <button onClick={() => navigate('/register')} className="w-full bg-brandMint hover:bg-emerald-400 text-corporateNavy rounded-lg py-3.5 text-sm font-black shadow-lg transition-transform active:scale-95">
                                Initialize Tactical Grid
                            </button>
                        </div>
                        
                        <div className="pt-8 space-y-4">
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                                <span className="text-sm text-white font-medium">Deep Biometric Live-Sync</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                                <span className="text-sm text-white font-medium">Cryptographic Asset Handover Keys</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                                <span className="text-sm text-white font-medium">Reverse SOS Extortion Shield</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                                <span className="text-sm text-white font-medium">Strict Shift Fencing & Geo-drops</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-brandMint shrink-0 mt-0.5" />
                                <span className="text-sm text-brandMint font-bold border-b border-brandMint border-dashed">Direct API Webhook Ingestion</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default PricingMatrix;
