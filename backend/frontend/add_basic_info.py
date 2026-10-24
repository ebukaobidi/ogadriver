# -*- coding: utf-8 -*-
import re

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

basic_info = '''      <section className="px-6 mt-6">
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-lg">
          <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#1cd188]" /> Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-sm font-medium text-white">{fullName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-medium text-white break-all">{profileUser?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm font-medium text-white">{profileUser?.phone || profileUser?.phone_number || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Gender</p>
                <p className="text-sm font-medium text-white capitalize">{profileUser?.gender || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-sm font-medium text-white">{profileUser?.date_of_birth || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      '''

pattern = '<section className="px-6 mt-6">\n        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-lg">\n          <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">\n            <Briefcase className="w-5 h-5 text-[#1cd188]" /> Professional Details'

if pattern not in content:
    pattern = '<section className="px-6 mt-6">\r\n        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-5 shadow-lg">\r\n          <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">\r\n            <Briefcase className="w-5 h-5 text-[#1cd188]" /> Professional Details'

content = content.replace(pattern, basic_info + pattern)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
