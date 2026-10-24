# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_block = """      {loading && zones.length === 0 ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#1cd188] animate-spin" /></div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active High-Demand Corridors</p>
          {zones.map(zone => {"""

new_block = """      {loading && zones.length === 0 ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#1cd188] animate-spin" /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {zones.length === 0 ? (
            <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-8 mt-4 text-center flex flex-col items-center justify-center shadow-lg">
              <MapPin className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-300 text-sm font-bold uppercase tracking-wider">No Active Surge Corridors</p>
              <p className="text-slate-500 text-xs mt-2 max-w-[200px] leading-relaxed">Map will automatically highlight zones when rider demand increases in your city.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active High-Demand Corridors</p>
              {zones.map(zone => {"""

text = text.replace(old_block, new_block)

old_end = """              </div>
            );
          })}
        </div>
      )}"""

new_end = """              </div>
            );
          })}
          </>
          )}
        </div>
      )}"""

text = text.replace(old_end, new_end)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

