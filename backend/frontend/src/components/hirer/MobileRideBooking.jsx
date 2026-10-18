import React, { useState } from 'react';
import { ArrowDownUp, CalendarClock, CarFront, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import MapLocationPickerModal from '../common/MapLocationPickerModal';

const VEHICLES = [
  { id: 'standard', label: 'Standard' },
  { id: 'executive', label: 'Executive' },
  { id: 'luxury', label: 'Luxury' },
];

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function MobileRideBooking() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [offer, setOffer] = useState('');
  const [vehicleType, setVehicleType] = useState('standard');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(localDate());
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [mapField, setMapField] = useState(null);

  const swapLocations = () => {
    setPickup(dropoff);
    setDropoff(pickup);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setError('');
    setConfirmation('');
    setSubmitting(true);

    try {
      const scheduledAt = isScheduled
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : undefined;
      const response = await api.post('/bookings', {
        booking_mode: 'open_ride',
        pickup_location: pickup.trim(),
        dropoff_location: dropoff.trim(),
        agreed_rate: Number(offer),
        pricing_type: 'trip',
        vehicle_type: vehicleType,
        title: `Ride request: ${pickup.trim()} to ${dropoff.trim()}`,
        is_scheduled: isScheduled,
        ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
      });
      const bookingId = response.data?.booking?.id || response.data?.data?.id;
      setConfirmation(
        response.data?.message ||
          (bookingId ? `Ride request #${bookingId} sent to nearby drivers.` : 'Ride request sent to nearby drivers.')
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Ride request could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-28 pt-4 text-slate-100">
      <header className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">On-demand rides</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Where are you going?</h2>
        <p className="mt-1 text-sm text-slate-400">Set your route and fare offer. Nearby drivers can respond.</p>
      </header>

      <form onSubmit={submitRequest} className="space-y-4">
        <section className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="absolute bottom-[4.6rem] left-[1.65rem] top-[3.9rem] border-l border-dashed border-slate-600" aria-hidden="true" />

          <LocationInput
            label="Pickup"
            value={pickup}
            onChange={setPickup}
            onPickMap={() => setMapField('pickup')}
            icon={MapPin}
            iconClass="text-emerald-400"
            placeholder="Enter pickup point"
          />
          <button
            type="button"
            onClick={swapLocations}
            disabled={!pickup && !dropoff}
            aria-label="Swap pickup and destination"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950 p-2 text-slate-300 transition hover:border-emerald-400 hover:text-emerald-300 disabled:opacity-40"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
          <div className="mt-3 border-t border-slate-800 pt-3">
            <LocationInput
              label="Destination"
              value={dropoff}
              onChange={setDropoff}
              onPickMap={() => setMapField('dropoff')}
              icon={Navigation}
              iconClass="text-rose-300"
              placeholder="Where to?"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <CarFront className="h-4 w-4 text-emerald-300" />
            Choose a vehicle
          </div>
          <div className="grid grid-cols-3 gap-2">
            {VEHICLES.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => setVehicleType(vehicle.id)}
                aria-pressed={vehicleType === vehicle.id}
                className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                  vehicleType === vehicle.id
                    ? 'border-emerald-400 bg-emerald-400/10 text-emerald-200'
                    : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                {vehicle.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <label htmlFor="ride-offer" className="block text-sm font-bold text-white">Your fare offer</label>
          <p className="mt-1 text-xs text-slate-400">Drivers can accept or respond with another offer.</p>
          <div className="mt-3 flex items-center rounded-xl border border-slate-700 bg-slate-950/70 focus-within:border-emerald-400">
            <span className="pl-3 text-sm font-bold text-emerald-300" aria-hidden="true">₦</span>
            <input
              id="ride-offer"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              required
              value={offer}
              onChange={(event) => setOffer(event.target.value)}
              placeholder="Enter amount"
              className="w-full bg-transparent px-2 py-3 text-lg font-bold text-white outline-none placeholder:text-sm placeholder:font-normal placeholder:text-slate-500"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm font-bold text-white">Schedule for later</p>
                <p className="text-xs text-slate-400">Leave off for the soonest pickup.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isScheduled}
              aria-label="Schedule ride for later"
              onClick={() => setIsScheduled((enabled) => !enabled)}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${isScheduled ? 'bg-emerald-400' : 'bg-slate-700'}`}
            >
              <span className={`h-4 w-4 rounded-full bg-white transition-transform ${isScheduled ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          {isScheduled && (
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
              <label className="text-xs text-slate-400">
                Date
                <input
                  type="date"
                  min={localDate()}
                  required={isScheduled}
                  value={scheduledDate}
                  onChange={(event) => setScheduledDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-400">
                Pickup time
                <input
                  type="time"
                  required={isScheduled}
                  value={scheduledTime}
                  onChange={(event) => setScheduledTime(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                />
              </label>
            </div>
          )}
        </section>

        <div className="flex items-start gap-2 px-1 text-xs text-slate-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          <p>Your request is shared with nearby drivers. Confirm details and fare with your driver before the trip.</p>
        </div>

        {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-200">{error}</p>}
        {confirmation && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{confirmation}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-emerald-400 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Sending request…' : 'Find a driver'}
        </button>
      </form>

      <MapLocationPickerModal
        isOpen={Boolean(mapField)}
        onClose={() => setMapField(null)}
        initialAddress={mapField === 'pickup' ? pickup : dropoff}
        onConfirm={({ address }) => {
          if (mapField === 'pickup') setPickup(address);
          if (mapField === 'dropoff') setDropoff(address);
          setMapField(null);
        }}
      />
    </div>
  );
}

function LocationInput({ label, value, onChange, onPickMap, icon: Icon, iconClass, placeholder }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
      <label className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <input
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full bg-transparent pr-8 text-sm text-white outline-none placeholder:text-slate-500"
        />
      </label>
      <button
        type="button"
        onClick={onPickMap}
        aria-label={`Choose ${label.toLowerCase()} on map`}
        title="Choose on map"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-300"
      >
        <MapPin className="h-4 w-4" />
      </button>
    </div>
  );
}
