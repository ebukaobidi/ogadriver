import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

target = '''              <div key={zone.id} className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                <div>
                  <h3 className="font-bold text-sm text-white mb-1">{zone.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">'''

replacement = '''              <div key={zone.id} className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start w-full">
                    <div>
                      <h3 className="font-bold text-sm text-white mb-1">{zone.name}</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">'''

text = text.replace(target, replacement)

target_end = '''                      </div>
                    </span>
                  </div>
                </div>
                <div className="bg-[#1cd188]/20 border border-[#1cd188]/30 px-3 py-1 rounded-lg">
                  <span className="text-[#1cd188] font-black text-sm">{zone.multiplier}x</span>
                </div>
              </div>
            );
          })}
        </div>'''

replacement_end = '''                      </div>
                    </span>
                  </div>
                </div>
                <div className="bg-[#1cd188]/20 border border-[#1cd188]/30 px-3 py-1 rounded-lg">
                  <span className="text-[#1cd188] font-black text-sm">{zone.multiplier}x</span>
                </div>
              </div>

              {/* Surge Lock Feature */}
              <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 mt-1">
                  <div>
                      <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck size={12} /> Surge Lock Guarantee
                      </p>
                      <p className="text-slate-500 text-[9px] mt-0.5">Lock this {zone.multiplier}x multiplier for 15 mins</p>
                  </div>
                  <button onClick={() => alert(Surge Locked! You now have 15 minutes to reach  with a guaranteed x multiplier.)} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                      Lock Surge
                  </button>
              </div>

              </div>
            );
          })}
        </div>'''

text = text.replace(target_end, replacement_end)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
