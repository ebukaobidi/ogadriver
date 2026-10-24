# -*- coding: utf-8 -*-
import io

path = 'frontend/src/pages/DriverPortal.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_block = """              <div className="min-h-screen bg-[#0f172a] px-4 pt-4 pb-24">
                <h2 className="text-white font-black text-xl mb-1">Manage Your Availability</h2>
                <p className="text-slate-400 text-xs mb-4">Employers check your availability before sending hiring proposals. Block out days when you are off-duty or unavailable.</p>
                <AvailabilityCalendar driverId={driver?.id} />"""

new_block = """              <div className="min-h-screen bg-[#0f172a] px-4 pt-4 pb-24">
                <AvailabilityCalendar driverId={driver?.id} />"""

text = text.replace(old_block, new_block)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

