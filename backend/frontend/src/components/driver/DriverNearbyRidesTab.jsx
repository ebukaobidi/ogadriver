import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, RefreshCw, Loader2, Zap, Navigation2, CheckCircle2,
  Briefcase, Calendar, Clock, CarFront, DollarSign, ChevronRight,
  Timer, ArrowRight, Radio, Map, List, AlertCircle, TrendingUp
} from 'lucide-react';
import api from '../../api/axios';
import { safeArray } from '../../utils/safeArray';
import LiveRouteMap from './LiveRouteMap';

// Haversine formula — compute real-world km distance
function getDistanceKm(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

const QUICK_BID_PRESETS = [2500, 3500, 4500, 6000];

export default function DriverNearbyRidesTab() {
  const [activeSection, setActiveSection] = useState('rides'); // 'rides' | 'jobs'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const [openRides, setOpenRides] = useState([]);
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [biddingRide, setBiddingRide] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);

  const [applyingJob, setApplyingJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  const [mapRide, setMapRide] = useState(null); // ride selected for map view

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { setLocation({ lat: 6.5244, lng: 3.3792 }); setLocationError(true); }
      );
    } else {
      setLocation({ lat: 6.5244, lng: 3.3792 });
    }
  }, []);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [ridesRes, jobsRes] = await Promise.all([
        api.get('/marketplace/open-rides').catch(() => ({ data: { data: [] } })),
        location
          ? api.get(`/jobs/nearby?lat=${location.lat}&lng=${location.lng}&radius=50`).catch(() => ({ data: { data: [] } }))
          : Promise.resolve({ data: { data: [] } })
      ]);
      setOpenRides(safeArray(ridesRes.data));
      setNearbyJobs(safeArray(jobsRes.data));
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [location]);

  useEffect(() => {
    if (location) fetchData();
    // Auto-refresh every 30s
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [location]);

  const handleBidSubmit = async (amount) => {
    if (!biddingRide) return;
    setBiddingLoading(true);
    try {
      await api.post(`/rides/${biddingRide.id}/bid`, { amount });
      setBidSuccess(true);
      setTimeout(() => {
        setBiddingRide(null);
        setBidAmount('');
        setBidSuccess(false);
        fetchData(true);
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setBiddingLoading(false);
    }
  };

  const handleApplySubmit = async () => {
    if (!applyingJob) return;
    setApplyLoading(true);
    try {
      await api.post(`/jobs/${applyingJob.id}/apply`, { cover_letter: coverLetter });
      setApplyingJob(null);
      setCoverLetter('');
      fetchData(true);
    } catch (e) {
      console.error(e);
    } finally {
      setApplyLoading(false);
    }
  };

  const rideDistanceFromMe = (ride) =>
    getDistanceKm(location?.lat, location?.lng, ride.pickup_lat, ride.pickup_lng);

  const jobDistanceFromMe = (job) =>
    getDistanceKm(location?.lat, location?.lng, job.lat, job.lng);

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#0f172a] min-h-screen text-white pt-2 pb-24">

      {/* ── Hero Card ── */}
      <div className="relative bg-gradient-to-br from-[#1e293b] to-[#0f172a] mx-4 mb-4 rounded-2xl overflow-hidden border border-white/10 p-5">
        {/* Animated radar bg */}
        <div className="absolute right-2 top-0 bottom-0 flex items-center pointer-events-none">
          <div className="relative w-32 h-32 opacity-10">
            {[60, 44, 28].map((r, i) => (
              <span
                key={i}
                style={{ width: r * 2, height: r * 2, top: 64 - r, left: 64 - r }}
                className="absolute rounded-full border border-[#1cd188]"
              />
            ))}
            <div className="absolute top-0 left-16 w-px h-16 bg-[#1cd188] origin-bottom"
              style={{ animation: 'spin 3s linear infinite' }} />
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-[#1cd188] text-[10px] font-normal uppercase tracking-[0.2em] mb-0.5">Live Radar</p>
          <h2 className="text-white font-normal text-xl leading-tight mb-1">NEARBY<br />OPPORTUNITIES</h2>
          <p className="text-slate-400 text-xs mb-3 leading-relaxed">
            Live ride bids from hirers + transport hire jobs within 50 km.
            {locationError && <span className="text-amber-400"> (GPS unavailable — using Lagos)</span>}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              className="flex items-center gap-1.5 border border-[#1cd188] text-[#1cd188] text-[11px] font-bold px-4 py-1.5 rounded-full"
            >
              <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'REFRESH'}
            </button>
            {lastUpdated && (
              <span className="text-slate-500 text-[10px]">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3">
          <span className="flex items-center gap-1.5 text-[#1cd188] text-[10px] font-bold">
            <CheckCircle2 size={11} /> Verified Drivers Get Priority Placement
          </span>
        </div>
      </div>

      {/* ── Section Switcher Pill Tabs ── */}
      <div className="mx-4 mb-4 flex bg-slate-900/60 backdrop-blur-2xl rounded-xl p-1 gap-1">
        {[
          { id: 'rides', label: 'Open Ride Bids', icon: CarFront, count: openRides.length },
          { id: 'jobs', label: 'Hire Jobs', icon: Briefcase, count: nearbyJobs.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveSection(tab.id); setViewMode('list'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSection === tab.id
                ? 'bg-[#1cd188] text-[#0f172a]'
                : 'text-slate-400'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeSection === tab.id ? 'bg-[#0f172a]/20 text-[#0f172a]' : 'bg-slate-700 text-slate-300'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-2 border-[#1cd188] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs">Scanning your area...</p>
        </div>
      ) : (
        <>
          {/* ══════════════ OPEN RIDE BIDS ══════════════ */}
          {activeSection === 'rides' && (
            <div className="px-4">
              {/* List / Map toggle */}
              {openRides.length > 0 && (
                <div className="flex justify-end mb-3">
                  <div className="flex bg-slate-900/60 backdrop-blur-2xl rounded-lg p-0.5 gap-0.5">
                    {[
                      { id: 'list', icon: List, label: 'List' },
                      { id: 'map', icon: Map, label: 'Map' },
                    ].map(v => (
                      <button
                        key={v.id}
                        onClick={() => { setViewMode(v.id); if (v.id === 'map') setMapRide(openRides[0]); }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                          viewMode === v.id ? 'bg-[#1cd188] text-[#0f172a]' : 'text-slate-400'
                        }`}
                      >
                        <v.icon size={11} /> {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Map View */}
              {viewMode === 'map' && mapRide && (
                <div className="mb-4">
                  <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl overflow-hidden mb-2 border border-slate-700">
                    <LiveRouteMap
                      pickupLat={mapRide.pickup_lat}
                      pickupLng={mapRide.pickup_lng}
                      dropoffLat={mapRide.dropoff_lat}
                      dropoffLng={mapRide.dropoff_lng}
                    />
                  </div>
                  {/* Map ride selector chips */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {openRides.map((ride, idx) => (
                      <button
                        key={ride.id}
                        onClick={() => setMapRide(ride)}
                        className={`flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                          mapRide?.id === ride.id
                            ? 'bg-[#1cd188] text-[#0f172a] border-[#1cd188]'
                            : 'border-slate-700 text-slate-400'
                        }`}
                      >
                        Ride #{idx + 1} · ₦{Number(ride.fare || 0).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {openRides.length === 0 ? (
                <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-8 flex flex-col items-center text-center border border-white/10">
                  <div className="w-16 h-16 rounded-full bg-[#0f172a] flex items-center justify-center mb-3">
                    <Radio size={28} className="text-slate-600" />
                  </div>
                  <p className="text-white font-bold mb-1">No Open Bids Right Now</p>
                  <p className="text-slate-400 text-xs mb-5 max-w-xs">
                    When hirers broadcast a fare in your area, it appears here instantly. Keep your GPS ON and stay ready.
                  </p>
                  <div className="flex items-center gap-1.5 bg-[#1cd188]/10 text-[#1cd188] border border-[#1cd188]/20 text-[11px] font-bold px-3 py-1.5 rounded-full">
                    <TrendingUp size={11} /> Auto-refreshes every 30 seconds
                  </div>
                </div>
              ) : (
                /* Ride cards */
                openRides.map(ride => {
                  const distKm = rideDistanceFromMe(ride);
                  const rideKm = getDistanceKm(ride.pickup_lat, ride.pickup_lng, ride.dropoff_lat, ride.dropoff_lng);
                  const isRecurring = ride.metadata?.is_recurring;
                  const isScheduled = ride.metadata?.is_scheduled || (ride.pickup_time && new Date(ride.pickup_time) > new Date());

                  return (
                    <div key={ride.id} className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl mb-3 border border-white/10 overflow-hidden">
                      {/* Type badges */}
                      <div className="px-4 pt-3 flex items-center gap-2 flex-wrap">
                        {isRecurring && (
                          <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/30 inline-flex items-center gap-1">
                            🔁 RECURRING
                          </span>
                        )}
                        {isScheduled && (
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 inline-flex items-center gap-1">
                            <Calendar size={9} />
                            {new Date(ride.pickup_time).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        )}
                        {!isRecurring && !isScheduled && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
                            <Zap size={9} /> INSTANT RIDE
                          </span>
                        )}
                      </div>

                      {/* Route */}
                      <div className="px-4 py-3">
                        <div className="flex items-stretch gap-2 mb-2">
                          <div className="flex flex-col items-center gap-0.5 pt-1">
                            <div className="w-2 h-2 rounded-full bg-[#1cd188]" />
                            <div className="w-0.5 h-5 bg-slate-700" />
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between gap-2">
                            <p className="text-white text-sm font-semibold leading-tight">{ride.pickup_address || ride.pickup_location || 'Pickup point'}</p>
                            <p className="text-slate-400 text-sm leading-tight">{ride.dropoff_address || ride.dropoff_location || 'Drop-off point'}</p>
                          </div>
                        </div>

                        {/* Distance/duration row */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          {distKm && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                              <Navigation2 size={11} /> {distKm} km from you
                            </span>
                          )}
                          {rideKm && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <ArrowRight size={10} /> {rideKm} km trip
                            </span>
                          )}
                          {ride.pickup_time && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock size={10} /> {new Date(ride.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {/* Fare & actions */}
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[#1cd188] font-black text-lg">
                              ₦{Number(ride.fare || ride.agreed_rate || 0).toLocaleString()}
                            </span>
                            <p className="text-slate-500 text-[10px]">Hirer's asking price</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setMapRide(ride); setViewMode('map'); }}
                              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300"
                              title="View on map"
                            >
                              <Map size={15} />
                            </button>
                            <button
                              onClick={() => { setBiddingRide(ride); setBidAmount(String(ride.fare || '')); }}
                              className="bg-[#1cd188] text-[#0f172a] font-bold text-xs px-4 py-2 rounded-xl"
                            >
                              BID NOW
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ══════════════ HIRE JOBS NEARBY ══════════════ */}
          {activeSection === 'jobs' && (
            <div className="px-4">
              {nearbyJobs.length === 0 ? (
                <div className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-8 flex flex-col items-center text-center border border-white/10">
                  <div className="w-16 h-16 rounded-full bg-[#0f172a] flex items-center justify-center mb-3">
                    <Briefcase size={28} className="text-slate-600" />
                  </div>
                  <p className="text-white font-bold mb-1">No Hire Jobs Nearby</p>
                  <p className="text-slate-400 text-xs mb-5 max-w-xs">
                    Hirers looking for employed or contracted drivers (with or without a car) show up here within 50 km.
                  </p>
                  <div className="flex items-center gap-1.5 bg-[#1cd188]/10 text-[#1cd188] border border-[#1cd188]/20 text-[11px] font-bold px-3 py-1.5 rounded-full">
                    <TrendingUp size={11} /> Auto-refreshes every 30 seconds
                  </div>
                </div>
              ) : (
                nearbyJobs.map(job => {
                  const distKm = jobDistanceFromMe(job);
                  return (
                    <div key={job.id} className="bg-slate-900/60 backdrop-blur-2xl rounded-2xl mb-3 border border-white/10 overflow-hidden">
                      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          job.employment_type === 'full_time'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : job.employment_type === 'part_time'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {(job.employment_type || 'contract').replace('_', ' ').toUpperCase()}
                        </span>
                        {distKm && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                            <Navigation2 size={11} /> {distKm} km away
                          </span>
                        )}
                      </div>

                      <div className="px-4 py-3">
                        <p className="text-white font-bold text-base mb-0.5">{job.title || 'Driver Position'}</p>
                        <p className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                          <MapPin size={10} /> {job.location || job.pickup_location || 'Location not specified'}
                        </p>

                        {/* Rate info */}
                        <div className="flex gap-3 mb-3">
                          {job.daily_rate && (
                            <div className="bg-[#0f172a] rounded-xl px-3 py-2 text-center">
                              <p className="text-[#1cd188] font-black text-sm">₦{Number(job.daily_rate).toLocaleString()}</p>
                              <p className="text-slate-500 text-[9px] uppercase tracking-wide">Per Day</p>
                            </div>
                          )}
                          {job.monthly_rate && (
                            <div className="bg-[#0f172a] rounded-xl px-3 py-2 text-center">
                              <p className="text-[#1cd188] font-black text-sm">₦{Number(job.monthly_rate).toLocaleString()}</p>
                              <p className="text-slate-500 text-[9px] uppercase tracking-wide">Per Month</p>
                            </div>
                          )}
                          {job.requires_vehicle && (
                            <div className="bg-[#0f172a] rounded-xl px-3 py-2 flex items-center gap-1">
                              <CarFront size={14} className="text-amber-400" />
                              <p className="text-amber-400 text-[10px] font-bold">Own car needed</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => { setApplyingJob(job); setCoverLetter(''); }}
                          className="w-full bg-[#1cd188]/10 border border-[#1cd188]/30 text-[#1cd188] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2"
                        >
                          APPLY FOR THIS JOB <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* ── Bid Bottom Sheet ── */}
      {biddingRide && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-end" onClick={() => setBiddingRide(null)}>
          <div className="bg-[#0f172a] w-full rounded-t-3xl p-6 pb-10 border-t border-white/10" onClick={e => e.stopPropagation()}>
            {bidSuccess ? (
              <div className="flex flex-col items-center py-6">
                <CheckCircle2 size={48} className="text-[#1cd188] mb-3" />
                <p className="text-white font-bold text-lg">Bid Submitted!</p>
                <p className="text-slate-400 text-sm mt-1">The hirer will review your offer shortly.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold">Propose Your Fare</h3>
                  <button onClick={() => setBiddingRide(null)} className="p-2 bg-slate-900/60 backdrop-blur-2xl rounded-full text-slate-400">✕</button>
                </div>
                <p className="text-slate-400 text-xs mb-4">
                  {biddingRide.pickup_address} → {biddingRide.dropoff_address}
                </p>

                {/* Quick-select presets */}
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Quick Select</p>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {QUICK_BID_PRESETS.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBidAmount(String(amount))}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        bidAmount === String(amount)
                          ? 'bg-[#1cd188] text-[#0f172a] border-[#1cd188]'
                          : 'border-slate-700 text-slate-300'
                      }`}
                    >
                      ₦{amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1cd188] font-bold text-sm">₦</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full bg-slate-900/60 backdrop-blur-2xl border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:border-[#1cd188] outline-none"
                  />
                </div>

                {/* Hirer reference */}
                <div className="bg-slate-900/60 rounded-xl px-4 py-2 mb-4 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Hirer's asking price</span>
                  <span className="text-slate-300 font-bold text-sm">₦{Number(biddingRide.fare || 0).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleBidSubmit(bidAmount)}
                  disabled={!bidAmount || biddingLoading}
                  className="w-full bg-[#1cd188] disabled:opacity-50 text-[#0f172a] font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
                >
                  {biddingLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><Zap size={16} /> SUBMIT BID</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Apply Bottom Sheet ── */}
      {applyingJob && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-end" onClick={() => setApplyingJob(null)}>
          <div className="bg-[#0f172a] w-full rounded-t-3xl p-6 pb-10 border-t border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold">Quick Application</h3>
              <button onClick={() => setApplyingJob(null)} className="p-2 bg-slate-900/60 backdrop-blur-2xl rounded-full text-slate-400">✕</button>
            </div>
            <p className="text-slate-400 text-xs mb-4">Applying to: <span className="text-white font-semibold">{applyingJob.title}</span></p>

            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Tell the hirer why you're the best fit (optional)..."
              className="w-full bg-slate-900/60 backdrop-blur-2xl border border-slate-700 rounded-xl px-4 py-3 text-white text-sm mb-4 h-28 resize-none focus:border-[#1cd188] outline-none"
            />

            <button
              onClick={handleApplySubmit}
              disabled={applyLoading}
              className="w-full bg-[#1cd188] disabled:opacity-50 text-[#0f172a] font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              {applyLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Sending...</>
              ) : (
                <><CheckCircle2 size={16} /> SEND APPLICATION</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
