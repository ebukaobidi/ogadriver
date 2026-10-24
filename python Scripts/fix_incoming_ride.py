import re

path = 'frontend/src/components/driver/IncomingRideOverlay.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

target = '''        {/* Giant Fare Display */}
        <div className="bg-[#1e293b] border border-[#1cd188]/40 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(28,209,136,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#1cd188] to-cyan-400" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Guaranteed Fare</p>
          <p className="text-5xl font-black text-[#1cd188] tracking-tight">
            ?{Number(ride.agreed_rate || ride.fare || 3500).toLocaleString()}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="bg-[#0f172a] text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
              {ride.ride_type || ride.vehicle_type || 'Standard'} Ride'''

# Sometimes encoding changes ? to ,. So I will use regex.
pattern = re.compile(r'\{\/\* Giant Fare Display \*\/\}.*?\{ride\.ride_type \|\| ride\.vehicle_type \|\| \'Standard\'\} Ride', re.DOTALL)

replacement = '''{/* Radical Transparency Fare Display */}
        <div className="bg-[#1e293b] border border-[#1cd188]/40 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(28,209,136,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#1cd188] to-cyan-400" />
          
          <div className="flex justify-between items-center px-4 mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase">Total Fare</span>
              <span className="text-slate-300 text-sm font-bold">?{Number(ride.agreed_rate || ride.fare || 3500).toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center px-4 mb-4 border-b border-slate-700/50 pb-3">
              <span className="text-slate-400 text-xs font-bold uppercase">OgaDriver Cut (0%)</span>
              <span className="text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2 py-0.5 rounded">?0</span>
          </div>

          <p className="text-[#1cd188] text-[10px] font-black uppercase tracking-widest mb-1">You Keep 100%</p>
          <p className="text-5xl font-black text-[#1cd188] tracking-tight">
            ?{Number(ride.agreed_rate || ride.fare || 3500).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="bg-[#0f172a] text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
              {ride.ride_type || ride.vehicle_type || 'Standard'} Ride'''

text = pattern.sub(replacement, text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
