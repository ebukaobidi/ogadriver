import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  X,
  User,
  Package,
  GraduationCap,
  Truck,
  Compass,
  Clock
} from 'lucide-react';
import { directoryService } from '../../api/directory';
import { safeArray } from '../../utils/safeArray';

const CATEGORIES = [
  { id: 'all', label: 'All Drivers', icon: User },
  { id: 'corporate', label: 'Corporate Driving', icon: Briefcase, desc: 'Executive chauffeur & corporate office dispatch' },
  { id: 'logistics', label: 'Logistics & Delivery', icon: Package, desc: 'Parcels, merchandise and scheduled multi-drop runs' },
  { id: 'school_runs', label: 'School Runs', icon: GraduationCap, desc: 'Safe daily school pickup & drop-off runs for students' },
  { id: 'car_transport', label: 'Car Transporting', icon: Truck, desc: 'Vehicle relocation, dealership transit and port pickup' },
  { id: 'private_family', label: 'Private & Family', icon: User, desc: 'Household chauffeur & family personal trips' },
  { id: 'interstate', label: 'Interstate Haul', icon: Compass, desc: 'Highway long-distance transit between states' },
  { id: 'relief', label: 'Emergency / Standby', icon: Clock, desc: 'Temporary on-demand cover & weekend standby' },
];

const today = () => new Date().toISOString().slice(0, 10);

function getDriverName(driver) {
  return driver.user?.name || driver.name || 'Verified driver';
}

function getDriverLocation(driver) {
  return [driver.city?.name || driver.city_name, driver.state?.name || driver.state_name]
    .filter(Boolean)
    .join(', ');
}

function getDriverRate(driver) {
  const pricing = driver.pricings?.find((item) => item.is_active) || driver.pricings?.[0];
  if (!pricing?.base_rate) return null;
  const amount = Number(pricing.base_rate);
  if (!Number.isFinite(amount)) return null;
  const cycle = pricing.pricing_type || 'day';
  return `₦${amount.toLocaleString()} / ${cycle}`;
}

export default function MobileHireDirectory() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [hireForm, setHireForm] = useState({
    contract_type: 'monthly',
    proposed_salary: '',
    start_date: today(),
    end_date: '',
    pickup_location: '',
    dropoff_location: '',
    accommodation_required: false,
    vehicle_required: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [hireMessage, setHireMessage] = useState('');
  const [hireError, setHireError] = useState('');

  useEffect(() => {
    let current = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (category !== 'all') params.employment_type = category;
        if (search.trim()) params.search = search.trim();
        const response = await directoryService.getDrivers(params);
        if (current) setDrivers(safeArray(response));
      } catch (requestError) {
        if (current) {
          setDrivers([]);
          setError(requestError.response?.data?.message || 'Drivers could not be loaded. Please try again.');
        }
      } finally {
        if (current) setLoading(false);
      }
    }, 250);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [category, refreshKey, search]);

  const openProfile = async (driver) => {
    setSelectedDriver(driver);
    setProfile(null);
    setProfileError('');
    setHireError('');
    setHireMessage('');
    setProfileLoading(true);
    try {
      const response = await directoryService.getDriverProfile(driver.id);
      setProfile(response.data?.driver || response.driver || response.data || response);
    } catch (requestError) {
      setProfileError(requestError.response?.data?.message || 'Driver profile could not be loaded.');
    } finally {
      setProfileLoading(false);
    }
  };

  const submitHireRequest = async (event) => {
    event.preventDefault();
    if (!selectedDriver) return;
    setSubmitting(true);
    setHireError('');
    setHireMessage('');
    try {
      const response = await directoryService.initiateHire(selectedDriver.id, {
        ...hireForm,
        title: `Driver hire request for ${getDriverName(selectedDriver)}`,
        route_description: [hireForm.pickup_location, hireForm.dropoff_location].filter(Boolean).join(' → '),
      });
      setHireMessage(response.message || 'Your hire request was sent to the driver.');
    } catch (requestError) {
      setHireError(requestError.response?.data?.message || 'We could not send the hire request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const driverForProfile = profile || selectedDriver;
  const profileName = driverForProfile ? getDriverName(driverForProfile) : '';

  useEffect(() => {
    if (navigator.geolocation && !search) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.state_district || data.address?.state || '';
          if (city && !search) setSearch(city);
        } catch (e) {
          console.log('Location detect error', e);
        }
      });
    }
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4 text-slate-100">
      <header className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">OGADRIVERS HIRE</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Hire a driver</h2>
        <p className="mt-1 text-sm text-slate-400">Browse verified professionals and send a contract request.</p>
      </header>

      <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
        <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search drivers or licence class"
            aria-label="Search drivers"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
              <X className="h-4 w-4 text-slate-500" />
            </button>
          )}
        </label>
        {category === 'all' ? (
          <div className="mt-4 grid grid-cols-2 gap-3 pb-2">
            {CATEGORIES.filter(c => c.id !== 'all').map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left transition hover:border-[#1cd188]/50 hover:bg-[#1cd188]/10"
                >
                  <div className="rounded-xl bg-[#1cd188]/20 p-2 text-[#1cd188]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.label}</h4>
                    <p className="mt-1 text-[10px] leading-tight text-slate-400">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  aria-pressed={category === item.id}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${
                    category === item.id
                      ? 'bg-[#1cd188] text-slate-950'
                      : 'border border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-12 text-center text-sm text-slate-400">
          Loading verified drivers…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 text-center">
          <p className="text-sm text-rose-200">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="mt-3 rounded-xl border border-rose-400/30 px-4 py-2 text-xs font-bold text-rose-100"
          >
            Try again
          </button>
        </div>
      ) : drivers.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-12 text-center">
          <UserRound className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-sm font-bold text-white">No matching drivers yet</p>
          <p className="mt-1 text-xs text-slate-400">Try another category or search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="px-1 text-xs text-slate-500">{drivers.length} verified driver{drivers.length === 1 ? '' : 's'}</p>
          {drivers.map((driver) => {
            const name = getDriverName(driver);
            const location = getDriverLocation(driver);
            const rate = getDriverRate(driver);
            const rating = Number(driver.rating);
            return (
              <article key={driver.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-black/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-lg font-black text-emerald-300">
                    {driver.user?.avatar ? (
                      <img src={driver.user.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-white">{name}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      {Number.isFinite(rating) && (
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <Star className="h-3 w-3 fill-current" /> {rating.toFixed(1)}
                        </span>
                      )}
                      {location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>}
                      {driver.license_class && <span>{driver.license_class} licence</span>}
                    </div>
                  </div>
                  {rate && <p className="shrink-0 text-right text-xs font-bold text-white">{rate}</p>}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Briefcase className="h-3.5 w-3.5" />
                    {driver.employment_types?.length
                      ? driver.employment_types.slice(0, 2).map((type) => type.replaceAll('_', ' ')).join(' · ')
                      : 'Professional driver'}
                  </span>
                  <button
                    type="button"
                    onClick={() => openProfile(driver)}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-emerald-300"
                  >
                    View & hire <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedDriver && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center" onClick={() => setSelectedDriver(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="hire-profile-title"
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Driver profile</p>
                <h3 id="hire-profile-title" className="mt-1 text-xl font-black text-white">{profileName}</h3>
              </div>
              <button type="button" onClick={() => setSelectedDriver(null)} aria-label="Close profile" className="rounded-full bg-slate-800 p-2 text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            {profileLoading ? (
              <p className="py-8 text-center text-sm text-slate-400">Loading profile…</p>
            ) : profileError ? (
              <p role="alert" className="mt-4 rounded-xl border border-rose-500/30 p-3 text-sm text-rose-200">{profileError}</p>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-900 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Rating</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-white">
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      {Number.isFinite(Number(driverForProfile?.rating)) ? Number(driverForProfile.rating).toFixed(1) : 'New driver'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Location</p>
                    <p className="mt-1 text-sm font-bold text-white">{getDriverLocation(driverForProfile) || 'Not provided'}</p>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Identity and driving credentials verified
                </p>

                {hireMessage ? (
                  <p role="status" className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{hireMessage}</p>
                ) : (
                  <form onSubmit={submitHireRequest} className="mt-5 space-y-3 border-t border-slate-800 pt-4">
                    <h4 className="text-sm font-bold text-white">Send a hire request</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-xs text-slate-400">
                        Contract
                        <select value={hireForm.contract_type} onChange={(event) => setHireForm({ ...hireForm, contract_type: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white">
                          <option value="daily">Daily</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </label>
                      <label className="text-xs text-slate-400">
                        Proposed rate (₦)
                        <input required min="1" type="number" inputMode="numeric" value={hireForm.proposed_salary} onChange={(event) => setHireForm({ ...hireForm, proposed_salary: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white" placeholder="e.g. 150000" />
                      </label>
                    </div>
                    <label className="block text-xs text-slate-400">
                      Start date
                      <span className="relative mt-1 block">
                        <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input required type="date" min={today()} value={hireForm.start_date} onChange={(event) => setHireForm({ ...hireForm, start_date: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-white" />
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['pickup_location', 'Pickup / work location'],
                        ['dropoff_location', 'Route / destination'],
                      ].map(([field, label]) => (
                        <label key={field} className="text-xs text-slate-400">
                          {label}
                          <input required value={hireForm[field]} onChange={(event) => setHireForm({ ...hireForm, [field]: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white" placeholder={label} />
                        </label>
                      ))}
                    </div>
                    {hireError && <p role="alert" className="text-xs text-rose-300">{hireError}</p>}
                    <button disabled={submitting || profileLoading} className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                      {submitting ? 'Sending request…' : 'Send hire request'}
                    </button>
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
