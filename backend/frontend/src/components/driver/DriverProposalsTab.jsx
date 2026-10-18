import React, { useEffect, useState } from 'react';
import { MapPin, Loader2, CheckCircle2, Briefcase, Car, Key, Sparkles, ChevronDown, ChevronRight, Bell } from 'lucide-react';
import api from '../../api/axios';

const safeArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.data && Array.isArray(val.data)) return val.data;
  if (val.data && val.data.data && Array.isArray(val.data.data)) return val.data.data;
  return [];
};

export default function DriverProposalsTab({ proposals = [], driver }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(() => safeArray(proposals));
  const [processingId, setProcessingId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('market'); // 'market' | 'pending' | 'accepted'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'rides' | 'hire'

  // Smart Hire Match Drawer State
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);
  const [preferredSchedule, setPreferredSchedule] = useState('Weekdays, 7am – 6pm');
  const [serviceArea, setServiceArea] = useState('Ikoyi, Lekki, VI');
  const [hireType, setHireType] = useState('any'); // 'any' | 'with_car' | 'driver_only'
  const [hireRequirements, setHireRequirements] = useState(
    'Weekly or longer contracts, at least ₦20,000/day, no night driving'
  );

  // Job Market Items Stream
  const [marketItems, setMarketItems] = useState([]);

  const proposalsList = safeArray(data);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeSubTab === 'market') {
          const [ridesRes, jobsRes] = await Promise.all([
            api.get('/marketplace/open-rides').catch(() => ({ data: [] })),
            api.get('/jobs').catch(() => ({ data: [] }))
          ]);

          const openRides = safeArray(ridesRes.data);
          const nearbyJobs = safeArray(jobsRes.data);

          const combined = [
            ...openRides.map(r => ({
              id: `ride_${r.id}`,
              rawId: r.id,
              type: 'ride',
              categoryLabel: 'Ride',
              title: `${r.pickup_address || r.pickup || 'Location'} → ${r.dropoff_address || r.dropoff || 'Destination'}`,
              subtitle: `${r.distance || '18.4'} km · ${r.duration || '42'} min`,
              price: Number(r.agreed_rate || r.fare || 9800),
              rawItem: r
            })),
            ...nearbyJobs.map(j => ({
              id: `job_${j.id}`,
              rawId: j.id,
              type: j.vehicle_required ? 'hire_with_car' : 'hire_driver_only',
              categoryLabel: j.vehicle_required ? 'Hire · With car' : 'Hire · Driver only',
              title: `${j.location || j.city || 'Lagos'} → ${j.title || 'Contract'}`,
              subtitle: j.schedule || j.work_hours || 'Starts soon',
              price: Number(j.daily_rate || j.monthly_rate || j.offered_salary || 45000),
              rawItem: j
            }))
          ];

          setMarketItems(combined);
        } else {
          const res = await api.get(`/drivers/${driver?.id || 'me'}/proposals`);
          setData(safeArray(res.data));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [driver, activeSubTab]);

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/proposals/${id}/accept`);
      setData(proposalsList.map(p => p.id === id ? { ...p, status: 'accepted' } : p));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm('Are you sure you want to decline this job offer?')) return;
    setProcessingId(id);
    try {
      await api.post(`/proposals/${id}/decline`);
      setData(proposalsList.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const displayedProposals = proposalsList.filter(p => activeSubTab === 'pending' ? p.status === 'pending' : p.status === 'accepted');

  const filteredMarketItems = marketItems.filter(item => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'rides') return item.type === 'ride';
    if (categoryFilter === 'hire') return item.type.startsWith('hire');
    return true;
  });

  return (
    <div className="bg-[#090d16] min-h-screen text-white px-4 pt-4 pb-24 font-sans">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="flex items-baseline mb-0.5">
            <span className="text-amber-400 font-black text-sm tracking-wider uppercase">OGADRIVERS</span>
            <span className="text-white font-black text-sm tracking-wider uppercase ml-1">PARTNERS</span>
          </div>
          <h1 className="text-white font-black text-2xl">Available jobs</h1>
        </div>
        <div className="relative w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex bg-slate-900/90 rounded-2xl p-1.5 mb-5 border border-slate-800">
        <button
          onClick={() => setActiveSubTab('market')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'market' ? 'bg-[#1cd188] text-slate-950' : 'text-slate-400'
          }`}
        >
          Job Market
        </button>
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'pending' ? 'bg-[#1cd188] text-slate-950' : 'text-slate-400'
          }`}
        >
          Direct Offers
        </button>
        <button
          onClick={() => setActiveSubTab('accepted')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'accepted' ? 'bg-[#1cd188] text-slate-950' : 'text-slate-400'
          }`}
        >
          My Contracts
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: JOB MARKET (WITH SMART HIRE MATCH COLLAPSIBLE & REAL API DATA) */}
      {/* ========================================================================= */}
      {activeSubTab === 'market' && (
        <div className="space-y-4">
          {/* Smart Hire Match Collapsible Card */}
          <div className="bg-slate-900/90 border border-amber-400/40 rounded-3xl p-5 shadow-xl transition-all">
            <button
              onClick={() => setSmartMatchOpen(!smartMatchOpen)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Smart hire match</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Tell us your preferences, get matched hires</p>
                </div>
              </div>
              {smartMatchOpen ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
            </button>

            {/* Expanded Fields */}
            {smartMatchOpen && (
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-300">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Preferred schedule</label>
                  <input
                    type="text"
                    value={preferredSchedule}
                    onChange={(e) => setPreferredSchedule(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Weekdays, 7am – 6pm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Service area</label>
                  <input
                    type="text"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Ikoyi, Lekki, VI"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Hire type</label>
                  <div className="flex gap-2">
                    {['any', 'with_car', 'driver_only'].map((typeKey) => (
                      <button
                        key={typeKey}
                        onClick={() => setHireType(typeKey)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          hireType === typeKey ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {typeKey === 'any' ? 'Any' : typeKey === 'with_car' ? 'With my car' : 'Driver only'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Hire requirements</label>
                  <textarea
                    rows={3}
                    value={hireRequirements}
                    onChange={(e) => setHireRequirements(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-800 rounded-2xl p-4 text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Weekly or longer contracts..."
                  />
                </div>

                <button
                  onClick={() => alert(`Preferences saved for ${serviceArea}`)}
                  className="w-full bg-amber-400 text-slate-950 font-black py-3.5 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 hover:brightness-110 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Recommend hires
                </button>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                categoryFilter === 'all' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('rides')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                categoryFilter === 'rides' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              Rides
            </button>
            <button
              onClick={() => setCategoryFilter('hire')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                categoryFilter === 'hire' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              Driver Hire
            </button>
          </div>

          {/* Job Items List */}
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400 w-8 h-8" /></div>
          ) : filteredMarketItems.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-white font-bold text-base mb-1">No Available Jobs</h4>
              <p className="text-slate-400 text-xs">No open rides or driver hires match your criteria. Try adjusting your filter preferences.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMarketItems.map(item => (
                <div key={item.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-lg hover:border-amber-400/40 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      item.type === 'ride' ? 'bg-slate-800' : 'bg-amber-500/20'
                    }`}>
                      {item.type === 'ride' ? <Car className="w-6 h-6 text-white" /> :
                       item.type === 'hire_with_car' ? <Car className="w-6 h-6 text-amber-400" /> :
                       <Key className="w-6 h-6 text-amber-400" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-slate-400 text-[11px] font-semibold mb-0.5">{item.categoryLabel}</p>
                      <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                      <p className="text-slate-400 text-xs truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-white font-black text-base">₦{item.price.toLocaleString()}</span>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DIRECT OFFERS (PENDING PROPOSALS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400 w-8 h-8" /></div>
          ) : displayedProposals.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-white font-bold text-base mb-1">No Direct Offers Yet</h4>
              <p className="text-slate-400 text-xs">Direct job proposals sent by employers will appear here.</p>
            </div>
          ) : (
            displayedProposals.map(offer => (
              <div key={offer.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-white">{offer.hirer_name || offer.client_name || 'Direct Employer Offer'}</h3>
                    <p className="text-slate-400 text-sm">{offer.job_title || 'Executive Driver'}</p>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Pending</span>
                </div>

                <div className="flex items-center gap-2 mt-3 mb-4">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 text-sm truncate">{offer.pickup_location || 'Lagos'}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Salary Offer</p>
                    <span className="text-2xl font-black text-amber-400">₦{Number(offer.salary_offered || offer.amount || 180000).toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecline(offer.id)}
                      disabled={processingId === offer.id}
                      className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-2xl hover:bg-slate-700"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(offer.id)}
                      disabled={processingId === offer.id}
                      className="bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl hover:brightness-110"
                    >
                      {processingId === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept Offer'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY CONTRACTS (ACCEPTED JOBS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'accepted' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400 w-8 h-8" /></div>
          ) : displayedProposals.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-white font-bold text-base mb-1">No Active Contracts</h4>
              <p className="text-slate-400 text-xs">Contracts you accept will appear here.</p>
            </div>
          ) : (
            displayedProposals.map(contract => (
              <div key={contract.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-white">{contract.hirer_name || contract.client_name || 'Active Contract'}</h3>
                    <p className="text-slate-400 text-sm">{contract.job_title || 'Executive Chauffeur'}</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Contract Amount</p>
                    <span className="text-2xl font-black text-white">₦{Number(contract.salary_offered || contract.amount || 0).toLocaleString()}</span>
                  </div>
                  <button className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-2xl border border-slate-700">
                    View Terms
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}