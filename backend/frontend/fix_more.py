# -*- coding: utf-8 -*-
with open('frontend/src/pages/DriverPortal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad = """                    {[
                      { id: 'settings', icon: Settings, label: 'Settings' },
                      { id: 'compliance', icon: ShieldCheck, label: 'Compliance' },
                      { id: 'subscriptions', icon: CreditCard, label: 'Billing' }
                    ].map(item => ("""
good = """                    {[
                      { id: 'settings', icon: Settings, label: 'Settings' },
                      { id: 'compliance', icon: ShieldCheck, label: 'Compliance' },
                      { id: 'subscriptions', icon: CreditCard, label: 'Billing' },
                      { id: 'training', icon: Gamepad2, label: 'Simulations' }
                    ].map(item => ("""

content = content.replace(bad, good)

with open('frontend/src/pages/DriverPortal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
