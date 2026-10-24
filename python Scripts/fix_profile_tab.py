import re

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_header_regex = r'<div className="flex justify-between items-center px-5 pt-6 pb-2">.*?</div>\s*</div>'

new_header = '''<div className="flex justify-center items-center px-5 pt-2 pb-4">
        <div className="text-center">
          <p className="text-[#1cd188] text-[10px] font-bold tracking-widest uppercase mb-1">@{driver?.formatted_id || user?.handle || 'DRV-0000'}</p>
          <h1 className="text-white text-2xl font-black">Profile</h1>
        </div>
      </div>'''

text = re.sub(old_header_regex, new_header, text, flags=re.DOTALL)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
