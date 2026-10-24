# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverSettingsTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the destructured props for notificationPrefs with local state
# Find where the props are destructured
props_pattern = r"notificationPrefs = \{ jobAlerts: true, email: true, security: true \},\s*setNotificationPrefs = \(\) => \{\},"
text = re.sub(props_pattern, "", text)

# Add local state inside the component
hook_pattern = r"const \[sv, setSv\] = useState\(\{ pc: false, pi: false, r: false, it: false \}\);"
new_state = """const [sv, setSv] = useState({ pc: false, pi: false, r: false, it: false });
  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('driver_notifications');
      return saved ? JSON.parse(saved) : { jobAlerts: true, email: true, security: true };
    } catch(e) {
      return { jobAlerts: true, email: true, security: true };
    }
  });

  // Save on change
  useEffect(() => {
    localStorage.setItem('driver_notifications', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);"""
text = re.sub(hook_pattern, new_state, text)

# Add import for useEffect if not there
if "useEffect" not in text:
    text = re.sub(r"import React, \{ useState \} from 'react';", "import React, { useState, useEffect } from 'react';", text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

