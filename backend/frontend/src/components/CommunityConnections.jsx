import React from 'react';
import { Users, Car, Star, Basket, ChevronRight } from 'lucide-react';

export default function CommunityConnections() {
  const connections = [
    { id: 1, name: 'Emeka O.', type: 'Driver', area: 'Victoria Island', mutual: 12, status: 'online' },
    { id: 2, name: 'Chinedu K.', type: 'Hirer', area: 'Lekki', mutual: 8, status: 'online' },
    { id: 3, name: 'Adaeze N.', type: 'Driver', area: 'Ikoyi', mutual: 5, status: 'offline' },
    { id: 4, name: 'Oluwaseun A.', type: 'Hirer', area: 'Yaba', mutual: 3, status: 'online' },
  ];

  const communities = [
    { id: 1, name: 'Victoria Island Drivers', members: 156, icon: Car },
    { id: 2, name: 'Lekki Hirers Club', members: 89, icon: Users },
    { id: 3, name: 'Ikoyi Elite Drivers', members: 67, icon: Star },
    { id: 4, name: 'Yaba Market Runs', members: 234, icon: Basket },
  ];

  return (
    <div className="bg-emerald-900/30 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Users size={20} className="text-emerald-300 mr-2" />
          <h3 className="text-white font-bold text-base">Community Connections</h3>
        </div>
        <button className="flex items-center text-emerald-300 text-xs font-bold hover:text-emerald-200">
          See All <ChevronRight size={16} className="ml-1" />
        </button>
      </div>

      {/* Mutual Connections */}
      <div className="mb-4">
        <p className="text-emerald-300 text-xs uppercase tracking-wider mb-3">People You Know</p>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="bg-emerald-800/50 border border-emerald-500/30 rounded-xl p-3 min-w-[140px] hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">{connection.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-xs">{connection.name}</p>
                  <p className="text-emerald-300 text-[10px]">{connection.type}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-emerald-400 text-[10px]">{connection.area}</p>
                <div className={`w-2 h-2 rounded-full ${connection.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communities */}
      <div>
        <p className="text-emerald-300 text-xs uppercase tracking-wider mb-3">Your Communities</p>
        <div className="space-y-2">
          {communities.map((community) => (
            <button
              key={community.id}
              className="w-full bg-emerald-800/30 border border-emerald-500/20 rounded-xl p-3 flex items-center hover:bg-emerald-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mr-3">
                <community.icon size={20} className="text-emerald-300" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-bold text-sm">{community.name}</p>
                <p className="text-emerald-300 text-xs">{community.members} members</p>
              </div>
              <ChevronRight size={16} className="text-emerald-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
