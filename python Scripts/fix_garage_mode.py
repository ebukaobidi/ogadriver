import re

path = 'frontend/src/components/driver/DriverSubscriptionsTab.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

target = '''          {subscriptionEndsAt && (
            <p className="text-slate-400 text-xs">
              Expires: <span className="text-white font-semibold">{new Date(subscriptionEndsAt).toLocaleDateString()}</span>
            </p>
          )}'''

replacement = '''          {subscriptionEndsAt && (
            <p className="text-slate-400 text-xs">
              Expires: <span className="text-white font-semibold">{new Date(subscriptionEndsAt).toLocaleDateString()}</span>
            </p>
          )}

          {/* Garage Mode (Pause Subscription) */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
             <div className="flex justify-between items-start">
                 <div>
                     <h4 className="text-white font-bold text-sm flex items-center gap-2">
                         <Shield size={14} className="text-amber-500" />
                         Garage Mode (Pause Plan)
                     </h4>
                     <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                         Car broke down? Sick? Pause your subscription up to 14 days so you don't lose your money. 
                         <span className="block text-amber-500 mt-1 font-semibold">Your account will be offline while paused.</span>
                     </p>
                 </div>
                 <button className="bg-slate-800 text-white border border-slate-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-700 transition">
                     Pause
                 </button>
             </div>
          </div>'''

text = text.replace(target, replacement)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
