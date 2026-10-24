# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/driver/SurgeMap.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add Shield to imports
import_pattern = r"import \{ Zap, MapPin, RefreshCw, Loader2, Navigation, Flame, Mic, Radio, ShieldCheck \} from 'lucide-react';"
new_import = """import { Zap, MapPin, RefreshCw, Loader2, Navigation, Flame, Mic, Radio, ShieldCheck, Shield } from 'lucide-react';"""
text = re.sub(import_pattern, new_import, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)

