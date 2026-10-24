import re

path = 'frontend/src/components/driver/DriverSubscriptionsTab.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\{subscriptionEndsAt && \(\s*<p className="text-slate-400 text-xs">\s*Expires:.*?<\/p>\s*\)\}', re.DOTALL)

replacement = '''{subscriptionEndsAt && (
            <p className="text-slate-400 text-xs">
              Expires: <span className="text-white font-semibold">{new Date(subscriptionEndsAt).toLocaleDateString()}</span>
            </p>
          )}

          {/* Garage Mode (Pause Subscription) */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
             <div className="flex justify-between items-center gap-4">
                 <div className="flex-1">
                     <h4 className="text-white font-bold text-sm flex items-center gap-2">
                         <Shield size={14} className="text-amber-500" />
                         Garage Mode
                     </h4>
                     <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">
                         Car broke down? Pause your plan up to 14 days so you don't lose money. Account goes offline while paused.
                     </p>
                 </div>
                 <button onClick={() => alert('Subscription Paused! Your expiration date will be extended when you resume.')} className="bg-slate-800 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-3 py-2 rounded-xl hover:bg-slate-700 transition flex-shrink-0">
                     Pause Plan
                 </button>
             </div>
          </div>'''

text = pattern.sub(replacement, text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
