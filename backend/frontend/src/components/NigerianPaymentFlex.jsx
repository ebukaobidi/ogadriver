import React, { useState } from 'react';
import { Wallet, Card, QrCode, Barcode, Time, X, ChevronRight, Info } from 'lucide-react';

export default function NigerianPaymentFlex({ amount, onPaymentSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  const paymentMethods = [
    { id: 'cash', label: 'Cash Payment', icon: Wallet, color: '#10b981', description: 'Pay cash to driver after ride' },
    { id: 'transfer', label: 'Bank Transfer', icon: Card, color: '#3b82f6', description: 'Transfer to driver account' },
    { id: 'ussd', label: 'USSD Code', icon: QrCode, color: '#f59e0b', description: 'Pay with *737# or bank USSD' },
    { id: 'wallet', label: 'Wallet Balance', icon: Wallet, color: '#a855f7', description: 'Use your OgaDriver wallet' },
    { id: 'pos', label: 'POS Machine', icon: Barcode, color: '#ef4444', description: 'Driver brings POS to you' },
    { id: 'flex', label: 'Pay Later', icon: Time, color: '#64748b', description: 'Pay within 7 days with small fee' },
  ];

  const handlePaymentSelect = (methodId) => {
    if (onPaymentSelect) {
      onPaymentSelect(methodId);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-emerald-500/20 backdrop-blur-sm border-2 border-emerald-400 rounded-2xl p-4 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet size={24} className="text-emerald-300 mr-3" />
            <div className="text-left">
              <p className="text-emerald-300 font-black text-base">Payment Flexibility</p>
              <p className="text-emerald-200 text-xs">Pay how you like - Naija style!</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-emerald-300" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-t-3xl p-6 border-t-4 border-emerald-500 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-black text-xl">Payment Options</h2>
              <button onClick={() => setIsOpen(false)}>
                <X size={28} className="text-emerald-300 hover:text-emerald-200" />
              </button>
            </div>

            <div className="bg-emerald-800/50 rounded-2xl p-4 mb-4 border border-emerald-500/30">
              <p className="text-emerald-200 text-sm mb-1">Amount to Pay:</p>
              <p className="text-white font-black text-2xl">{amount || '₦3,500'}</p>
            </div>

            <p className="text-emerald-300 text-sm mb-4 italic">
              "No wahala, we get different ways to pay"
            </p>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentSelect(method.id)}
                  className="w-full bg-emerald-800/50 border border-emerald-500/30 rounded-2xl p-4 flex items-center hover:bg-emerald-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl border-2 flex items-center justify-center mr-4" style={{ borderColor: method.color }}>
                    <method.icon size={24} style={{ color: method.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold text-base">{method.label}</p>
                    <p className="text-emerald-300 text-xs">{method.description}</p>
                  </div>
                  <ChevronRight size={20} className="text-emerald-300" />
                </button>
              ))}
            </div>

            <div className="bg-amber-500/20 border border-amber-400 rounded-xl p-3">
              <div className="flex items-center">
                <Info size={20} className="text-amber-400 mr-2" />
                <p className="text-amber-200 text-xs">
                  All payments are secure. Drivers are verified before they can receive payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
