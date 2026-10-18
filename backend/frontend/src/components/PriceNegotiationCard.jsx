import React, { useState } from 'react';
import { Handshake, X, Send, Check, ChevronRight, Info } from 'lucide-react';

export default function PriceNegotiationCard({ driver, onNegotiate, onAccept }) {
  const [isOpen, setIsOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [negotiationStep, setNegotiationStep] = useState(1);

  const handleNegotiate = () => {
    if (onNegotiate) {
      onNegotiate(driver, offerPrice);
    }
    setIsOpen(false);
    setNegotiationStep(1);
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(driver);
    }
    setIsOpen(false);
    setNegotiationStep(1);
  };

  const closeModal = () => {
    setIsOpen(false);
    setNegotiationStep(1);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-amber-500/20 backdrop-blur-sm border-2 border-amber-400 rounded-2xl p-4 hover:shadow-lg hover:shadow-amber-500/20 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Handshake size={24} className="text-amber-400 mr-3" />
            <div className="text-left">
              <p className="text-amber-300 font-black text-base">Price Negotiation</p>
              <p className="text-amber-200 text-xs">Talk price, make we see</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-amber-400" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-t-3xl p-6 border-t-4 border-emerald-500 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-black text-xl">Price Negotiation</h2>
              <button onClick={closeModal}>
                <X size={28} className="text-emerald-300 hover:text-emerald-200" />
              </button>
            </div>

            <div className="bg-emerald-800/50 rounded-2xl p-4 mb-4 border border-emerald-500/30">
              <p className="text-emerald-200 text-sm mb-2">Driver's Price:</p>
              <p className="text-white font-black text-2xl">{driver?.price || '₦3,500'}</p>
              <p className="text-emerald-300 text-xs italic mt-2">
                "Make we talk, money no be problem"
              </p>
            </div>

            {negotiationStep === 1 && (
              <>
                <p className="text-white font-bold text-base mb-3">
                  Wetin you wan pay?
                </p>
                <input
                  type="text"
                  placeholder="Enter your price"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full bg-emerald-800/50 border-2 border-emerald-500 rounded-xl p-4 text-white text-lg mb-4 focus:outline-none focus:border-emerald-400"
                />

                <div className="space-y-3 mb-4">
                  <button
                    onClick={() => { setOfferPrice('₦3,000'); setNegotiationStep(2); }}
                    className="w-full bg-emerald-700/50 border border-emerald-500 rounded-xl p-3 flex items-center justify-between hover:bg-emerald-700 transition-colors"
                  >
                    <span className="text-white font-bold">₦3,000</span>
                    <span className="text-emerald-300 text-xs">-14% off</span>
                  </button>
                  <button
                    onClick={() => { setOfferPrice('₦3,200'); setNegotiationStep(2); }}
                    className="w-full bg-emerald-700/50 border border-emerald-500 rounded-xl p-3 flex items-center justify-between hover:bg-emerald-700 transition-colors"
                  >
                    <span className="text-white font-bold">₦3,200</span>
                    <span className="text-emerald-300 text-xs">-9% off</span>
                  </button>
                  <button
                    onClick={() => { setOfferPrice('₦3,400'); setNegotiationStep(2); }}
                    className="w-full bg-emerald-700/50 border border-emerald-500 rounded-xl p-3 flex items-center justify-between hover:bg-emerald-700 transition-colors"
                  >
                    <span className="text-white font-bold">₦3,400</span>
                    <span className="text-emerald-300 text-xs">-3% off</span>
                  </button>
                </div>

                <button
                  onClick={() => setNegotiationStep(2)}
                  className="w-full bg-emerald-500 py-4 rounded-xl text-white font-black text-base hover:bg-emerald-600 transition-colors"
                >
                  Continue
                </button>
              </>
            )}

            {negotiationStep === 2 && (
              <>
                <div className="bg-amber-500/20 border-2 border-amber-400 rounded-2xl p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Check size={20} className="text-amber-400 mr-2" />
                    <p className="text-amber-300 font-bold">Your Offer</p>
                  </div>
                  <p className="text-white font-black text-2xl">{offerPrice}</p>
                </div>

                <p className="text-emerald-200 text-sm mb-4 italic">
                  Driver go review your offer. If e agree, you go receive notification sharp sharp!
                </p>

                <button
                  onClick={handleNegotiate}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 py-4 rounded-xl text-white font-black text-base mb-3 hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center shadow-lg"
                >
                  <Send size={20} className="mr-2" />
                  Send Offer
                </button>

                <button
                  onClick={handleAccept}
                  className="w-full bg-emerald-500 py-4 rounded-xl text-white font-black text-base hover:bg-emerald-600 transition-colors"
                >
                  Accept Original Price
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
