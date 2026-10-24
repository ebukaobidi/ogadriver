# -*- coding: utf-8 -*-
with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_goal = '''style={{ width: ${Math.min(100, ((earningsSummary?.month_earnings || 0) / (weeklyGoal || 1)) * 100)}% }}'''
good_goal = '''style={{ width: `${Math.min(100, ((earningsSummary?.month_earnings || 0) / (weeklyGoal || 1)) * 100)}%` }}'''

content = content.replace(bad_goal, good_goal)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
