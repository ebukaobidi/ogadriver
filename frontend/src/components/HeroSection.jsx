import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Smile, FileSignature, Activity, ArrowRight, ChevronLeft, ChevronRight, Briefcase, Users, MapPin, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ content }) => {
    const operators = [
        {
            image: "/images/hero/nigerian_chauffeur_1784366918845.png",
            name: "Emeka Okonkwo",
            role: "Executive Chauffeur",
            experience: "8 years",
            license: "Class E",
            location: "Lagos",
            rating: "4.9",
            verified: true,
            specializations: ["VIP Transport", "Security", "Long Distance"]
        },
        {
            image: "/images/hero/female_driver_1784366932413.png",
            name: "Adaeze Nwosu",
            role: "Security Driver",
            experience: "5 years",
            license: "Class D",
            location: "Abuja",
            rating: "4.8",
            verified: true,
            specializations: ["Corporate Security", "Female Clients", "Night Operations"]
        },
        {
            image: "/images/hero/security_drivers_1784366991985.png",
            name: "Chinedu Okafor",
            role: "Fleet Security Lead",
            experience: "12 years",
            license: "Class E",
            location: "Port Harcourt",
            rating: "5.0",
            verified: true,
            specializations: ["Fleet Management", "Security Coordination", "Emergency Response"]
        },
        {
            image: "/images/hero/driver_hands_1784366967477.png",
            name: "Ibrahim Yusuf",
            role: "Defensive Driving Instructor",
            experience: "15 years",
            license: "Class E",
            location: "Kano",
            rating: "4.9",
            verified: true,
            specializations: ["Driver Training", "Safety Audits", "Risk Assessment"]
        },
        {
            image: "/images/hero/nigerian_chauffeur_1784366918845.png",
            name: "Grace Adebayo",
            role: "Corporate Transport",
            experience: "6 years",
            license: "Class C",
            location: "Ibadan",
            rating: "4.7",
            verified: true,
            specializations: ["Corporate Events", "Airport Transfers", "Executive Travel"]
        },
        {
            image: "/images/hero/female_driver_1784366932413.png",
            name: "Oluwaseun Adeleke",
            role: "High-Security Escort",
            experience: "10 years",
            license: "Class E",
            location: "Lagos",
            rating: "4.9",
            verified: true,
            specializations: ["VIP Protection", "Convoy Operations", "Threat Assessment"]
        }
    ];
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % operators.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [operators.length]);

    const titleHTML = content?.hero?.title || 'Verified Drivers <br/>that drive <br/><span class="text-brandMint">Your Security Forward!</span>';
    const subtitleText = content?.hero?.subtitle || 'Airtight FRSC licensing verification, NIMC biometric liveness checks, and guarantor indemnity bonds mapped natively at source.';

    return (
        <section className="relative bg-corporateNavy py-12 lg:py-20 overflow-hidden border-b border-slate-800 flex flex-col justify-center">
            {/* Ambient Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1cd18805_1px,transparent_1px),linear-gradient(to_bottom,#1cd18805_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-[1]"></div>
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column: Operator Preview */}
                    <div className="lg:col-span-6 relative">
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-brandMint/30 to-transparent blur opacity-60"></div>
                        <div className="relative h-[576px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
                            {selectedOperator ? (
                                // Operator Preview Modal
                                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-20 p-6 flex flex-col">
                                    <button 
                                        onClick={() => setSelectedOperator(null)}
                                        className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-brandMint/30 mb-6 shadow-2xl">
                                            <img 
                                                src={selectedOperator.image} 
                                                alt={selectedOperator.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        
                                        <h2 className="text-3xl font-black text-white mb-2">{selectedOperator.name}</h2>
                                        <p className="text-brandMint font-bold text-lg mb-4">{selectedOperator.role}</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
                                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                                                <p className="text-white font-bold">{selectedOperator.experience}</p>
                                            </div>
                                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">License</p>
                                                <p className="text-white font-bold">{selectedOperator.license}</p>
                                            </div>
                                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                                <p className="text-white font-bold">{selectedOperator.location}</p>
                                            </div>
                                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rating</p>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                                                    <p className="text-white font-bold">{selectedOperator.rating}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full max-w-md">
                                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Specializations</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedOperator.specializations.map((spec, idx) => (
                                                    <span key={idx} className="bg-brandMint/10 border border-brandMint/30 text-brandMint px-3 py-1.5 rounded-lg text-sm font-medium">
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {selectedOperator.verified && (
                                            <div className="mt-6 flex items-center gap-2 bg-brandMint/10 border border-brandMint/30 rounded-xl px-4 py-3">
                                                <ShieldCheck className="w-5 h-5 text-brandMint" />
                                                <span className="text-brandMint font-bold text-sm">Verified Operative</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // Operator Slider
                                <>
                                    <img 
                                        src={operators[currentSlide].image} 
                                        alt="Verified Executive Driver on Duty" 
                                        className="w-full h-full object-cover transition-all duration-700 ease-in-out filter contrast-115 brightness-95 cursor-pointer hover:scale-105"
                                        onClick={() => setSelectedOperator(operators[currentSlide])}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                                    
                                    <div className="absolute top-4 left-4 bg-corporateNavy/90 backdrop-blur-md border border-brandMint/30 rounded px-3 py-1.5 flex items-center gap-1.5">
                                        <span className="flex h-2 w-2 rounded-full bg-brandMint animate-ping"></span>
                                        <span className="text-[10px] font-bold text-white font-mono uppercase tracking-wider">SECURE_UNIT_LIVE</span>
                                    </div>

                                    {/* Operator Info Overlay */}
                                    <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 p-4 cursor-pointer hover:bg-slate-950/90 transition-all"
                                         onClick={() => setSelectedOperator(operators[currentSlide])}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-brandMint/30">
                                                <img 
                                                    src={operators[currentSlide].image} 
                                                    alt={operators[currentSlide].name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-bold text-lg">{operators[currentSlide].name}</h3>
                                                <p className="text-brandMint text-sm">{operators[currentSlide].role}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-400">{operators[currentSlide].experience}</span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-400">{operators[currentSlide].location}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-6 h-6 text-brandMint" />
                                        </div>
                                    </div>

                                    {/* Logo Watermark Overlay */}
                                    <div className="absolute bottom-6 right-6 p-2.5 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transition-all hover:bg-slate-950/60">
                                        <img src="/logo.svg" alt="OgaDriver Logo" className="h-10 w-auto opacity-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Text & Features */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900 bg-emerald-950/60 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-brandMint">
                            <ShieldCheck className="w-4 h-4 text-brandMint" />
                            Federal Verification Sync Active (FRSC & NIMC Databases)
                        </div>

                        <div className="min-h-[160px] transition-all duration-300">
                            <div className="carousel-slide space-y-4">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none uppercase" 
                                    dangerouslySetInnerHTML={{ __html: titleHTML }}>
                                </h1>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gradient-to-r from-brandMint/50 via-slate-800 to-transparent"></div>

                        <p className="text-base lg:text-lg text-slate-300 max-w-xl leading-relaxed font-medium">
                            {subtitleText}
                        </p>

                        {/* 4 Feature Columns */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-brandMint">
                                    <Database className="w-5 h-5 shrink-0" />
                                    <span className="text-xs font-black tracking-wider uppercase font-sans">REGISTRY SYNC</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">Federal NIN database match</p>
                            </div>
                            <div className="space-y-1 border-l border-slate-850 pl-3">
                                <div className="flex items-center gap-2 text-brandMint">
                                    <Smile className="w-5 h-5 shrink-0" />
                                    <span className="text-xs font-black tracking-wider uppercase font-sans">LIVENESS OK</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">Biometric facial mapping</p>
                            </div>
                            <div className="space-y-1 border-l border-slate-850 pl-3">
                                <div className="flex items-center gap-2 text-brandMint">
                                    <FileSignature className="w-5 h-5 shrink-0" />
                                    <span className="text-xs font-black tracking-wider uppercase font-sans">BOND TRUST</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">Double guarantor verification</p>
                            </div>
                            <div className="space-y-1 border-l border-slate-850 pl-3">
                                <div className="flex items-center gap-2 text-brandMint">
                                    <Activity className="w-5 h-5 shrink-0" />
                                    <span className="text-xs font-black tracking-wider uppercase font-sans">ACTIVE HUD</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">Anti-spoofing telemetry</p>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap items-center gap-6 pt-4">
                            <button onClick={() => navigate('/register')} className="rounded-lg bg-gradient-to-r from-brandMint to-emerald-500 hover:from-emerald-400 hover:to-brandMint px-8 py-4 text-sm font-black text-corporateNavy transition-all flex items-center gap-2 shadow-lg hover:shadow-brandGlow transform hover:-translate-y-0.5">
                                <span>RECRUIT ELITE DRIVERS NOW</span>
                                <ArrowRight className="w-5 h-5 text-corporateNavy" />
                            </button>

                            <div className="flex gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-lg p-1.5">
                                <button onClick={() => setCurrentSlide((prev) => (prev - 1 + operators.length) % operators.length)} className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => setCurrentSlide((prev) => (prev + 1) % operators.length)} className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Dots */}
                            <div className="flex gap-1.5 items-center">
                                {operators.map((_, idx) => (
                                    <span key={idx} onClick={() => setCurrentSlide(idx)} className={`dot-indicator h-2 rounded-full cursor-pointer transition-all ${currentSlide === idx ? 'w-8 bg-brandMint' : 'w-2.5 bg-slate-700 hover:bg-slate-500'}`}></span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Footer in Hero */}
                <div className="mt-16 bg-slate-950/85 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 lg:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-brandMint/10 border border-brandMint/20 text-brandMint shrink-0">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">{content?.stats?.active_placements || '12,402+'}</p>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Placements</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 md:border-l border-slate-900 md:pl-6">
                        <div className="p-3 rounded-xl bg-brandMint/10 border border-brandMint/20 text-brandMint shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">{content?.stats?.happy_employers || '5,000+'}</p>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Happy Employers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 md:border-l border-slate-900 md:pl-6">
                        <div className="p-3 rounded-xl bg-brandMint/10 border border-brandMint/20 text-brandMint shrink-0">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">36/36</p>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">States Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 md:border-l border-slate-900 md:pl-6">
                        <div className="p-3 rounded-xl bg-brandMint/10 border border-brandMint/20 text-brandMint shrink-0">
                            <Star className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">4.9/5</p>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Vetting rating</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
