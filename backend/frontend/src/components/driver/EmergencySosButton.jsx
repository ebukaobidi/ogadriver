import React, { useState } from 'react';
import { ShieldAlert, Radio, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import api from '../../api/axios';

const EmergencySosButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [error, setError] = useState('');

  const handleTrigger = () => {
    setShowModal(true);
    setDispatched(false);
    setError('');
  };

  const handleConfirmDispatch = () => {
    setDispatching(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendBeacon(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Fallback coords (Lagos Operative Zone)
          sendBeacon(6.5244, 3.3792);
        }
      );
    } else {
      sendBeacon(6.5244, 3.3792);
    }
  };

  const sendBeacon = (lat, lng) => {
    api.post('/drivers/sos/trigger', {
      latitude: lat,
      longitude: lng,
      address: 'Live Operative GPS Beacon Dispatched',
    })
    .then(res => {
      if (res.data.success) {
        setDispatched(true);
      }
    })
    .catch(err => {
      setError(err.response?.data?.message || 'Emergency dispatch failed.');
    })
    .finally(() => setDispatching(false));
  };

  return (
    <>
      <button
        onClick={handleTrigger}
        className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-40 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black px-4 py-3 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-red-400 group"
      >
        <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
        <span className="text-xs uppercase tracking-widest font-mono hidden sm:inline">Emergency SOS</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-950 border-2 border-red-500 rounded-2xl max-w-sm w-full p-6 text-center shadow-[0_0_60px_rgba(239,68,68,0.4)] relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            {!dispatched ? (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-black text-2xl text-white uppercase tracking-tight">EMERGENCY SOS BEACON</h3>
                <p className="text-xs text-slate-400 mt-2 mb-6">
                  Pressing confirm will instantly transmit your live GPS location, vehicle details, and active trip alert to <strong className="text-white">OgaDriver Security Central</strong> and your <strong className="text-white">Guarantors</strong>.
                </p>

                {error && <p className="text-xs text-red-400 font-bold mb-4">{error}</p>}

                <div className="space-y-3">
                  <button
                    onClick={handleConfirmDispatch}
                    disabled={dispatching}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
                  >
                    {dispatching ? 'DISPATCHING BEACON...' : 'CONFIRM EMERGENCY BEACON'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full text-xs text-slate-500 hover:text-slate-400 font-mono"
                  >
                    Cancel / False Alarm
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-black text-xl text-emerald-400 uppercase">BEACON ACTIVE & LIVE</h3>
                <p className="text-xs text-slate-300">
                  Security units and Guarantors have been dispatched your coordinates. Stay calm — help is en route.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-slate-900 border border-white/10 text-white py-3 rounded-xl font-bold text-xs"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencySosButton;
