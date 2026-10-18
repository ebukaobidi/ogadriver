import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Zap, Check, X, Clock, ShieldCheck, Car } from 'lucide-react';
import api from '../../api/axios';

export default function IncomingRideOverlay({ ride, onAccept, onDecline }) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!ride) return;
    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onDecline) onDecline(ride.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ride]);

  if (!ride) return null;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      if (onAccept) {
        await onAccept(ride);
      } else {
        await api.post(`/rides/${ride.id}/bid`, { amount: ride.agreed_rate || ride.fare || 3000 });
      }
    } catch (e) {
      console.error("Accept ride failed", e);
    } finally {
      setAccepting(false);
    }
  };

  const progressPercent = (timeLeft / 15) * 100;
  const dashArray = 2 * Math.PI * 24;
  const dashOffset = dashArray - (dashArray * progressPercent) / 100;

  const isScheduled = ride.metadata?.is_scheduled || (ride.pickup_time && new Date(ride.pickup_time) > new Date());
  const isRecurring = ride.metadata?.is_recurring;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col justify-between p-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header Bar with Countdown Ring */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1cd188]/20 border border-[#1cd188]/40 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#1cd188] animate-bounce" />
          </div>
          <div>
            <span className="text-[#1cd188] text-xs font-black uppercase tracking-widest block">
              {isRecurring ? '🔁 RECURRING COMMUTE' : isScheduled ? '📅 SCHEDULED TRIP' : '⚡ INCOMING RIDE BID'}
            </span>
            <span className="text-white text-sm font-bold">New Passenger Request</span>
          </div>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" stroke="#1e293b" strokeWidth="4" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke={timeLeft < 5 ? '#ef4444' : '#1cd188'}
              strokeWidth="4"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className={`absolute text-sm font-black ${timeLeft < 5 ? 'text-red-500 animate-ping' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Main Fare Hero & Route Card */}
      <div className="my-auto space-y-6">
        {/* Radical Transparency Fare Display */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-[#1cd188]/40 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(28,209,136,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#1cd188] to-cyan-400" />
          
          <div className="flex justify-between items-center px-4 mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase">Total Fare</span>
              <span className="text-slate-300 text-sm font-bold">?{Number(ride.agreed_rate || ride.fare || 3500).toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center px-4 mb-4 border-b border-slate-700/50 pb-3">
              <span className="text-slate-400 text-xs font-bold uppercase">OgaDriver Cut (0%)</span>
              <span className="text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded">?0</span>
          </div>

          <p className="text-[#1cd188] text-[10px] font-black uppercase tracking-widest mb-1">You Keep 100%</p>
          <p className="text-5xl font-black text-[#1cd188] tracking-tight">
            ?{Number(ride.agreed_rate || ride.fare || 3500).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="bg-[#0f172a] text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
              {ride.ride_type || ride.vehicle_type || 'Standard'} Ride
            </span>
            <span className="bg-emerald-500/20 text-[#1cd188] text-xs font-bold px-3 py-1 rounded-full border border-[#1cd188]/30 flex items-center gap-1">
              <ShieldCheck size={12} /> Verified Fare
            </span>
          </div>
        </div>

        {/* Route Details with High Contrast */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-4">
          {/* Pickup */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#1cd188]/20 border border-[#1cd188] flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-3 h-3 rounded-full bg-[#1cd188]" />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">PICKUP LOCATION</p>
              <p className="text-white font-bold text-lg leading-tight mt-0.5">
                {ride.pickup_location || ride.pickup_address || ride.pickup || 'Pickup Location'}
              </p>
              <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                <Navigation size={12} className="text-[#1cd188]" /> ~{ride.distance || '2.4'} km away
              </p>
            </div>
          </div>

          <div className="border-l-2 border-dashed border-slate-700 ml-4 h-4" />

          {/* Dropoff */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={16} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">DROPOFF LOCATION</p>
              <p className="text-white font-bold text-lg leading-tight mt-0.5">
                {ride.dropoff_location || ride.dropoff_address || ride.dropoff || 'Dropoff Location'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Huge Ergonomic Touch Targets) */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="h-16 w-full bg-[#1cd188] hover:bg-emerald-400 text-[#0f172a] font-black text-xl rounded-2xl flex items-center justify-center gap-3 uppercase tracking-wider shadow-[0_0_30px_rgba(28,209,136,0.4)] transition-all active:scale-95 disabled:opacity-50"
        >
          {accepting ? (
            <div className="w-7 h-7 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-7 h-7 stroke-[3]" /> ACCEPT TRIP BID
            </>
          )}
        </button>

        <button
          onClick={() => onDecline && onDecline(ride.id)}
          className="h-12 w-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <X className="w-4 h-4" /> DECLINE
        </button>
      </div>
    </div>
  );
}
