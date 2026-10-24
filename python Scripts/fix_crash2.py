# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/DriverSettingsTab.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r"const \[sv, setSv\] = useState\(\{ it: false \}\);"

new_state = """const [sv, setSv] = useState({ it: false });

  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('driver_notifications');
      return saved ? JSON.parse(saved) : { jobAlerts: true, email: true, security: true };
    } catch(e) {
      return { jobAlerts: true, email: true, security: true };
    }
  });

  useEffect(() => {
    localStorage.setItem('driver_notifications', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);"""

text = re.sub(pattern, new_state, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

