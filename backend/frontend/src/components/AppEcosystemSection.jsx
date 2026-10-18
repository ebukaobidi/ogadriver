import React, { useState } from 'react';
import { 
  Smartphone, 
  Calendar, 
  Clock, 
  Repeat, 
  Car, 
  ShieldAlert, 
  Zap, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  UserCheck,
  Crown,
  DollarSign,
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppEcosystemSection() {
  const [activeTab, setActiveTab] = useState('hirer');
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brandMint/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono text-brandMint uppercase tracking-widest border border-brandMint/30 rounded-full px-4 py-1.5 bg-brandMint/10">
            NEXT-GEN MOBILITY & DRIVER ECOSYSTEM
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight leading-none">
            Two Specialized Apps. <br />
            <span className="text-brandMint">One Unified Mobility Network.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience our newly upgraded platform with dedicated standalone mobile apps for drivers and hirers, automated commute subscriptions, real-time fare bidding, and VIP fleet booking.
          </p>
        </div>

        {/* App Switcher Pills */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex gap-2 max-w-md w-full">
            <button
              onClick={() => setActiveTab('hirer')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'hirer'
                  ? 'bg-brandMint text-corporateNavy shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>OgaDriver Hire & Ride</span>
            </button>

            <button
              onClick={() => setActiveTab('driver')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'driver'
                  ? 'bg-brandMint text-corporateNavy shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>OgaDriver Partner</span>
            </button>
          </div>
        </div>

        {/* Dynamic App Content Grid */}
        {activeTab === 'hirer' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Card */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/80 rounded-full px-3 py-1 text-xs text-brandMint font-semibold">
                <Crown className="w-3.5 h-3.5" /> For Passengers, Employers & Corporate Fleets
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                Ride Now, Schedule Trips, or Subscribe to Commutes
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Whether you need an instant ride across town, a dedicated driver for office or school commute subscriptions, or full-time executive driver recruitment, the <strong>OgaDriver Hire & Ride</strong> app delivers verified drivers on demand.
              </p>

              {/* Feature Bullet Points */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-brandMint/10 border border-brandMint/30 flex items-center justify-center shrink-0 text-brandMint">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Recurring Commute Subscriptions</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Automate weekday office runs or daily school pickups with Pause & Resume control.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Interactive Fare Bidding Engine</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Set counter-offers (₦2,500, ₦3,000, ₦3,500) and broadcast trip requests to drivers instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">VIP Fleet & Executive Chauffeur Service</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Book luxury vehicles with trained security drivers for high-profile executive travel.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-brandMint hover:bg-emerald-400 text-corporateNavy font-black text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-brandGlow"
                >
                  <span>Book or Hire Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/hirer')}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all"
                >
                  Open Hirer Web App
                </button>
              </div>
            </div>

            {/* Right Interactive Mockup Container */}
            <div className="lg:col-span-6 relative">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-brandMint animate-ping"></div>
                    <span className="text-white font-extrabold text-sm uppercase tracking-wider">OgaDriver Hire & Ride App</span>
                  </div>
                  <span className="text-[10px] font-mono bg-brandMint/10 border border-brandMint/30 text-brandMint px-2.5 py-1 rounded-full font-bold">
                    com.ogadriver.hirer
                  </span>
                </div>

                {/* Simulated Mode Selector */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <div className="bg-brandMint text-corporateNavy py-2 text-center rounded-lg font-black text-xs">⚡ Ride Now</div>
                  <div className="text-slate-400 py-2 text-center rounded-lg font-bold text-xs">📅 Schedule</div>
                  <div className="text-slate-400 py-2 text-center rounded-lg font-bold text-xs">🔁 Commute</div>
                </div>

                {/* Simulated Bidding Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Incoming Driver Bids</span>
                    <span className="text-xs font-bold text-brandMint bg-brandMint/10 px-2.5 py-0.5 rounded-full">3 Drivers Online</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-brandMint font-black text-xs flex items-center justify-center">EO</div>
                        <div>
                          <p className="text-white text-xs font-bold">Emeka O.</p>
                          <p className="text-[10px] text-slate-400">Toyota Camry • ⭐ 4.9</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-brandMint font-black text-sm block">₦3,000</span>
                        <span className="text-[9px] text-slate-500">4 mins away</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center">AN</div>
                        <div>
                          <p className="text-white text-xs font-bold">Adaeze N.</p>
                          <p className="text-[10px] text-slate-400">Honda Accord • ⭐ 4.8</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-brandMint font-black text-sm block">₦2,800</span>
                        <span className="text-[9px] text-slate-500">7 mins away</span>
                      </div>
                    </div>
                  </div>

                  {/* Counter Pills */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Quick Offer:</span>
                    <div className="flex gap-2">
                      <span className="bg-slate-900 border border-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">₦2,500</span>
                      <span className="bg-brandMint text-corporateNavy text-[10px] font-black px-2.5 py-1 rounded-lg">₦3,000</span>
                      <span className="bg-slate-900 border border-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">₦3,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Card for Driver App */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/80 rounded-full px-3 py-1 text-xs text-brandMint font-semibold">
                <Car className="w-3.5 h-3.5" /> For Professional & Private Drivers
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                Work on Your Terms. Earn Daily & Weekly.
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                The <strong>OgaDriver Partner</strong> app gives drivers full control over their earnings, job offers, availability calendar, and safety telemetry. Receive instant trip alerts or bid on long-term employer placements.
              </p>

              {/* Feature Bullet Points */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-brandMint/10 border border-brandMint/30 flex items-center justify-center shrink-0 text-brandMint">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Full-Screen incoming Alert Overlay</h4>
                    <p className="text-slate-400 text-xs mt-0.5">High-contrast 15-second alert call with giant fare display and 1-tap accept button for phone mounts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Interactive Availability Calendar</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Block off off-duty days or highlight open availability for prospective employers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Road Safety Simulator & Certification</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Complete defensive driving modules to earn priority verification badges and higher payout rates.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-brandMint hover:bg-emerald-400 text-corporateNavy font-black text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-brandGlow"
                >
                  <span>Register as Driver Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/driver')}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all"
                >
                  Open Driver Portal
                </button>
              </div>
            </div>

            {/* Right Interactive Mockup Container for Driver */}
            <div className="lg:col-span-6 relative">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-brandMint animate-ping"></div>
                    <span className="text-white font-extrabold text-sm uppercase tracking-wider">OgaDriver Partner App</span>
                  </div>
                  <span className="text-[10px] font-mono bg-brandMint/10 border border-brandMint/30 text-brandMint px-2.5 py-1 rounded-full font-bold">
                    com.ogadriver.partner
                  </span>
                </div>

                {/* Simulated Driver Dashboard Dials */}
                <div className="grid grid-cols-4 gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <div>
                    <p className="text-brandMint font-black text-sm">₦145k</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tight mt-0.5">Total Earned</p>
                  </div>
                  <div>
                    <p className="text-blue-400 font-black text-sm">₦42k</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tight mt-0.5">This Week</p>
                  </div>
                  <div>
                    <p className="text-purple-400 font-black text-sm">28</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tight mt-0.5">Completed</p>
                  </div>
                  <div>
                    <p className="text-amber-400 font-black text-sm">14</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-tight mt-0.5">Job Offers</p>
                  </div>
                </div>

                {/* Simulated Driver Incoming Call Overlay Card */}
                <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">⚡ INCOMING BROADCAST</span>
                    <span className="text-xs font-mono text-slate-400">⏱️ 0:12</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-white text-xs font-semibold">Ikeja GRA → Victoria Island</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Distance: 14.2 km • Economy Ride</p>
                    </div>
                    <span className="text-2xl font-black text-brandMint font-mono">₦4,500</span>
                  </div>

                  <button className="w-full bg-brandMint text-corporateNavy font-black py-3 rounded-xl text-xs uppercase tracking-widest">
                    ACCEPT TRIP (1-TAP)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
