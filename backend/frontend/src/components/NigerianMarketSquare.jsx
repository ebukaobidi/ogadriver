import React, { useState } from 'react';
import { Car, Users, Award, ShieldCheck, Handshake, Wallet, MapPin, Zap, TrendingUp, ChevronRight, Globe } from 'lucide-react';

export default function NigerianMarketSquare() {
  const [activeTab, setActiveTab] = useState('market');

  const tabs = [
    { id: 'market', label: 'Market Square', icon: Globe, color: '#1cd188' },
    { id: 'area', label: 'My Area', icon: MapPin, color: '#f59e0b' },
    { id: 'connect', label: 'Connect', icon: Users, color: '#3b82f6' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, color: '#a855f7' },
  ];

  const drivers = [
    { id: 1, name: 'Chinedu Okafor', aka: 'China Boy', rating: 4.9, price: '₦3,500', trips: 1234, area: 'Victoria Island', verified: true },
    { id: 2, name: 'Emeka Nnamdi', aka: 'Emeka Fine', rating: 4.8, price: '₦3,200', trips: 987, area: 'Lekki', verified: true },
    { id: 3, name: 'Adaeze Onwudiwe', aka: 'Ada Taxi', rating: 4.7, price: '₦3,800', trips: 756, area: 'Ikoyi', verified: true },
    { id: 4, name: 'Oluwaseun Adebayo', aka: 'Seun Driver', rating: 4.6, price: '₦3,000', trips: 543, area: 'Yaba', verified: false },
  ];

  return (
    <div className="bg-gradient-to-b from-[#052e16] via-[#0a5c25] to-[#1a7a37] rounded-2xl p-6 border border-emerald-500/30">
      {/* Nigerian Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-3xl mr-3">🇳🇬</span>
          <div>
            <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider">Naija Driver Market</p>
            <h2 className="text-white font-black text-2xl">Oga, Welcome!</h2>
            <p className="text-emerald-200 text-sm">Wetin you wan do today?</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-500 border-2 border-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span className="text-white font-black text-lg">D</span>
        </div>
      </div>

      {/* Nigerian Cultural Greeting */}
      <div className="bg-emerald-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-emerald-400/30">
        <p className="text-emerald-100 text-sm italic">
          "Na who you know, no be who you be" - Find trusted drivers from your area
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 border-emerald-300'
                : 'bg-emerald-800/50 border-emerald-700 hover:bg-emerald-700/50'
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-emerald-300'} />
            <span className={`ml-2 text-sm font-bold ${activeTab === tab.id ? 'text-white' : 'text-emerald-300'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'market' && (
        <>
          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="bg-amber-500/20 backdrop-blur-sm border-2 border-amber-400 rounded-2xl p-4 hover:shadow-lg hover:shadow-amber-500/20 transition-all group">
              <Zap size={32} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <p className="text-amber-300 font-black text-sm mt-2">Oya Now!</p>
              <p className="text-amber-200 text-xs">Quick ride, sharp sharp</p>
            </button>

            <button className="bg-purple-500/20 backdrop-blur-sm border-2 border-purple-400 rounded-2xl p-4 hover:shadow-lg hover:shadow-purple-500/20 transition-all group">
              <Handshake size={32} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <p className="text-purple-300 font-black text-sm mt-2">Price Drop</p>
              <p className="text-purple-200 text-xs">Talk price, make we see</p>
            </button>

            <button className="bg-blue-500/20 backdrop-blur-sm border-2 border-blue-400 rounded-2xl p-4 hover:shadow-lg hover:shadow-blue-500/20 transition-all group">
              <MapPin size={32} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <p className="text-blue-300 font-black text-sm mt-2">My Area</p>
              <p className="text-blue-200 text-xs">Drivers wey dey your side</p>
            </button>

            <button className="bg-rose-500/20 backdrop-blur-sm border-2 border-rose-400 rounded-2xl p-4 hover:shadow-lg hover:shadow-rose-500/20 transition-all group">
              <Wallet size={32} className="text-rose-400 group-hover:scale-110 transition-transform" />
              <p className="text-rose-300 font-black text-sm mt-2">Cash Out</p>
              <p className="text-rose-200 text-xs">Collect your money</p>
            </button>
          </div>

          {/* Driver Marketplace */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-lg">Top Drivers for Market</h3>
              <button className="flex items-center text-emerald-300 text-xs font-bold hover:text-emerald-200">
                See All <ChevronRight size={16} className="ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-emerald-900/40 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 flex items-center hover:border-emerald-400 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center mr-4">
                    <span className="text-white font-black text-xl">{driver.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-white font-bold text-base">{driver.name}</p>
                      {driver.verified && (
                        <ShieldCheck size={16} className="ml-2 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-emerald-300 text-sm italic">"{driver.aka}"</p>
                    <div className="flex items-center mt-1 space-x-3">
                      <div className="flex items-center">
                        <TrendingUp size={14} className="text-amber-400" />
                        <span className="text-emerald-200 text-xs ml-1">{driver.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Car size={14} className="text-emerald-300" />
                        <span className="text-emerald-200 text-xs ml-1">{driver.trips} trips</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-300 font-black text-lg">{driver.price}</p>
                    <p className="text-emerald-400 text-xs">per trip</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'area' && (
        <div className="flex items-center justify-center py-12">
          <MapPin size={64} className="text-emerald-300" />
          <h3 className="text-white font-black text-xl mt-4">My Area Drivers</h3>
          <p className="text-emerald-300 text-sm">Drivers wey dey your side</p>
        </div>
      )}

      {activeTab === 'connect' && (
        <div className="flex items-center justify-center py-12">
          <Users size={64} className="text-emerald-300" />
          <h3 className="text-white font-black text-xl mt-4">Connect</h3>
          <p className="text-emerald-300 text-sm">Connect with drivers and hirers</p>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="flex items-center justify-center py-12">
          <Wallet size={64} className="text-emerald-300" />
          <h3 className="text-white font-black text-xl mt-4">Your Wallet</h3>
          <p className="text-emerald-300 text-sm">Check your balance and cash out</p>
        </div>
      )}
    </div>
  );
}
