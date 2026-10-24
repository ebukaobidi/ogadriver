# -*- coding: utf-8 -*-
with open('frontend/src/components/driver/DriverContractsTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Add Navigation Icon import
if 'Navigation' not in content:
    content = content.replace("import { Briefcase, MapPin, Calendar, Clock, CheckCircle2, ChevronRight, FileText, Loader2, AlertCircle } from 'lucide-react';", "import { Briefcase, MapPin, Calendar, Clock, CheckCircle2, ChevronRight, FileText, Loader2, AlertCircle, Navigation } from 'lucide-react';")


nav_btn = '''<button className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 border border-slate-700 transition-all text-sm flex justify-center items-center gap-2">
                    <FileText className="w-4 h-4" /> View Full Contract
                  </button>
                  <button onClick={() => window.open(`geo:${contract.lat},${contract.lng}?q=${contract.lat},${contract.lng}`, '_blank')} className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-400 transition-all text-sm flex justify-center items-center gap-2">
                    <Navigation className="w-4 h-4" /> Navigate
                  </button>'''

content = content.replace('''<button className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 border border-slate-700 transition-all text-sm flex justify-center items-center gap-2">
                    <FileText className="w-4 h-4" /> View Full Contract
                  </button>''', nav_btn)

with open('frontend/src/components/driver/DriverContractsTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
