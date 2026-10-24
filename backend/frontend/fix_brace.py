# -*- coding: utf-8 -*-
with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad = '''              )}
            </div>
          </div>
        </div>
      )}}

      {showEmergencyModal && ('''
good = '''              )}
            </div>
          </div>
        </div>
      )}

      {showEmergencyModal && ('''

content = content.replace(bad, good)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
