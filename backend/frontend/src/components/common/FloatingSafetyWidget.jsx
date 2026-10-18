import React, { useState } from 'react';
import { Shield, ShieldAlert, Share2, Mic, Phone, X, Check, Copy } from 'lucide-react';
import UniversalSosModal from './UniversalSosModal';

export default function FloatingSafetyWidget({ userProfile, activeTripId, tripDetails }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);

  const shareableLink = `https://ogadriver.ng/track/${activeTripId || 'live'}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`I am currently on a ride with OgaDriver. Live Tracking Link: ${shareableLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSimulateAudioRecord = () => {
    setAudioRecording(true);
    setTimeout(() => {
      setAudioRecording(false);
      setAudioRecorded(true);
      setTimeout(() => setAudioRecorded(false), 3000);
    }, 5000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all transform active:scale-95 ${
            isOpen ? 'bg-slate-800 text-white border border-slate-700' : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
          }`}
          title="Safety Shield & Emergency Controls"
        >
          {isOpen ? <X size={20} /> : <Shield size={24} className="animate-pulse" />}
        </button>

        {/* Floating Menu Popover */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                <span className="font-bold text-sm">OgaDriver Safety Shield</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                PROTECTED
              </span>
            </div>

            <div className="space-y-2">
              {/* Share Live Location */}
              <div className="bg-slate-800/80 rounded-xl p-2.5">
                <p className="text-xs text-slate-400 mb-2">Share Live Tracking</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
                  >
                    <Share2 size={13} /> WhatsApp
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Audio Safety Record */}
              <button
                onClick={handleSimulateAudioRecord}
                disabled={audioRecording}
                className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left p-2.5 rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${audioRecording ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-700 text-slate-300'}`}>
                    <Mic size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Audio Safety Monitor</p>
                    <p className="text-[10px] text-slate-400">
                      {audioRecording ? 'Recording 5s ambient clip...' : audioRecorded ? 'Audio buffer saved safely' : 'Record ambient clip'}
                    </p>
                  </div>
                </div>
              </button>

              {/* Emergency Hotline Direct Call */}
              <a
                href="tel:08000000000"
                className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 p-2.5 rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Phone size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Safety Support Hotline</p>
                    <p className="text-[10px] text-slate-400">24/7 Security Desk</p>
                  </div>
                </div>
              </a>

              {/* Red SOS Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowSosModal(true);
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
              >
                <ShieldAlert size={16} /> TRIGGER SOS EMERGENCY
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Universal SOS Modal */}
      {showSosModal && (
        <UniversalSosModal
          isOpen={showSosModal}
          onClose={() => setShowSosModal(false)}
          userProfile={userProfile}
        />
      )}
    </>
  );
}
