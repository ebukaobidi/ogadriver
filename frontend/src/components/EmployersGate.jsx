import React, { useState } from 'react';
import { Search, Users, ChevronDown, X, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployersGate = ({ content }) => {
    const [calcOpen, setCalcOpen] = useState(false);
    const [credits, setCredits] = useState(1);
    const navigate = useNavigate();

    const toggleCalculator = () => setCalcOpen(!calcOpen);

    const cost = credits * 2500;
    const formattedCost = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(cost);

    return (
        <section id="employers" className="py-20 bg-corporateNavy relative overflow-hidden border-b border-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#1cd1880d,transparent_50%)]"></div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <span className="text-xs font-mono text-brandMint uppercase tracking-widest border border-brandMint/30 rounded-full px-4 py-1 bg-brandMint/5">
                        SELECT YOUR TRANSIT GATEWAY
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                        Connect with the <span className="text-brandMint">Sovereign Grid</span>
                    </h2>
                    <p className="text-sm text-slate-300 max-w-xl mx-auto">
                        Whether you are an elite pilot looking for validated placements, or an enterprise fleet manager scaling up logistics operations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
                    
                    {/* Left Card: Drivers */}
                    <div 
                        onClick={() => navigate('/register')}
                        className="cursor-pointer relative group rounded-3xl overflow-hidden min-h-[460px] flex flex-col justify-between p-10 border border-slate-800 shadow-xl transition-all duration-500 hover:border-brandMint/50 hover:shadow-mintGlow/10 transform hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/gate/job_seeker_driver.png')" }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-corporateNavy via-corporateBlue/90 to-corporateNavy/75 transition-opacity duration-500 group-hover:opacity-95"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center mt-12">
                            <div className="w-20 h-20 rounded-full border-2 border-brandMint/30 flex items-center justify-center bg-corporateNavy/40 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Search className="w-10 h-10 text-brandMint" />
                            </div>
                            <span className="text-brandMint text-lg font-semibold tracking-wide block mb-2 font-mono">Drivers</span>
                            <h3 className="text-white text-3xl sm:text-4xl font-black tracking-tight leading-none">
                                LOOKING <br/>FOR A JOB?
                            </h3>
                        </div>

                        <div className="relative z-10 text-center">
                            <button className="inline-flex items-center gap-2 text-white font-bold text-sm bg-corporateBlue/80 hover:bg-brandMint hover:text-corporateNavy border border-slate-700 hover:border-brandMint rounded-full px-6 py-3 transition-all duration-300">
                                <span>Explore Placements</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Card: Clients */}
                    <div 
                        onClick={() => navigate('/register')}
                        className="cursor-pointer relative group rounded-3xl overflow-hidden min-h-[460px] flex flex-col justify-between p-10 border border-brandMint/20 shadow-xl transition-all duration-500 hover:border-brandMint/80 hover:shadow-mintGlow/25 transform hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/gate/client_looking_driver.png')" }}></div>
                        <div className="absolute inset-0 bg-brandMint/90 mix-blend-multiply transition-colors duration-500 group-hover:bg-brandMint/85"></div>
                        <div className="absolute inset-0 bg-brandMint/85 opacity-90"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center mt-12">
                            <div className="w-20 h-20 rounded-full border-2 border-corporateNavy/30 flex items-center justify-center bg-brandMint/30 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Users className="w-10 h-10 text-corporateNavy" />
                            </div>
                            <span className="text-corporateNavy text-lg font-black tracking-wide block mb-2 font-mono">Clients</span>
                            <h3 className="text-corporateNavy text-3xl sm:text-4xl font-black tracking-tight leading-none">
                                LOOKING <br/>FOR DRIVERS?
                            </h3>
                        </div>

                        <div className="relative z-10 text-center">
                            <button className="inline-flex items-center gap-2 text-white font-bold text-sm bg-corporateNavy hover:bg-slate-900 rounded-full px-6 py-3 transition-all duration-300 shadow-md">
                                <span>Acquire Fleet Access</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calculator Drawer */}
                {calcOpen && (
                    <div className="mt-16 max-w-5xl mx-auto transition-all duration-500 animate-fade-in">
                        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 lg:p-12 shadow-2xl relative">
                            <div className="absolute top-4 right-4">
                                <button onClick={toggleCalculator} className="text-slate-500 hover:text-white p-2">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                                <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                                            <span className="text-xs font-mono text-brandMint uppercase tracking-widest">Interactive Calculator</span>
                                            <span className="text-xs bg-brandMint/10 text-brandMint border border-brandMint/20 px-2.5 py-1 rounded font-bold">1 Access Credit = ₦2,500</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-bold text-white">Slide to set profile unlocks needed:</label>
                                                <span className="text-2xl font-black text-brandMint font-mono">{credits}</span>
                                            </div>
                                            <input type="range" min="1" max="100" value={credits} onChange={(e) => setCredits(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brandMint" />
                                            <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                                <span>1 Profile (Basic Trial)</span>
                                                <span>100 Profiles (Scale Recruitment)</span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-corporateBlue/50 border border-slate-850 p-5 space-y-2">
                                            <div className="text-[10px] font-mono text-brandMint tracking-wider">BEST FIT RECOMMENDATION:</div>
                                            <div className="text-base font-extrabold text-white">Pay-Per-Unlock (Access Credits)</div>
                                            <p className="text-xs text-slate-300 leading-relaxed">Perfect for employers recruiting single drivers on demand. Unmask driver details and send immediate live proposals instantly.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-900">
                                        <div>
                                            <div className="text-[10px] font-mono text-slate-500 uppercase">Estimated Access Fee</div>
                                            <div className="text-3xl font-black text-white font-mono">{formattedCost}</div>
                                        </div>
                                        <button onClick={() => navigate('/register')} className="bg-brandMint hover:bg-emerald-400 text-corporateNavy px-6 py-3.5 rounded-lg text-sm font-black transition-all shadow-lg active:scale-95">
                                            Secure Recruiter Access
                                        </button>
                                    </div>
                                </div>

                                <div className="lg:col-span-5 bg-slate-900/30 rounded-2xl border border-slate-900 p-6 shadow-xl flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <span className="text-xs font-mono text-slate-400 tracking-wider block uppercase border-b border-slate-900 pb-2">Unlocked Features & Bounds</span>
                                        
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-slate-900/50">
                                                <span className="text-xs text-slate-300">Limited Profile Views</span>
                                                <Check className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-900/50">
                                                <span className="text-xs text-slate-300">Masked Personal Data</span>
                                                <Check className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-900/50">
                                                <span className="text-xs text-slate-300">Max Active Proposals</span>
                                                <span className="text-xs font-bold text-slate-300 font-mono">3 Active</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-900/50">
                                                <span className="text-xs text-slate-300">Dedicated HR Sub-Accounts</span>
                                                <X className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-xs text-slate-300">Headless API Telemetry Keys</span>
                                                <X className="w-4 h-4 text-slate-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 bg-slate-950 rounded-xl p-4 border border-slate-900">
                                        <div className="flex items-center gap-3">
                                            <Info className="w-5 h-5 text-brandMint shrink-0" />
                                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                                Unlocking profiles requires multi-factor syncs. Every connection transaction is permanently mapped onto secure logs to avoid malicious data harvesting.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default EmployersGate;
