import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

target = '''                </div>
              </div>
            );
          })}'''

replacement = '''                </div>
              </div>

              {/* Surge Lock Feature */}
              <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 mt-1 w-full">
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
          })}'''

text = text.replace(target, replacement)
if 'ShieldCheck' not in text:
    text = text.replace('import { Zap, MapPin, RefreshCw, Loader2, Navigation, Flame, Mic, Radio }', 'import { Zap, MapPin, RefreshCw, Loader2, Navigation, Flame, Mic, Radio, ShieldCheck }')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
