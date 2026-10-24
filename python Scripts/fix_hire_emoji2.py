# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/hirer/HirerAccount.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the entire array
old_array = r"const DEFAULT_PLACES = \[\s*\{ id: '1', name: 'Home', address: 'Victoria Island, Lagos', icon: '[^']+' \},\s*\{ id: '2', name: 'Office', address: 'Marina Financial Center, Lagos', icon: '[^']+' \}\s*\];"
new_array = """const DEFAULT_PLACES = [
  { id: '1', name: 'Home', address: 'Victoria Island, Lagos', icon: 'Home' },
  { id: '2', name: 'Office', address: 'Marina Financial Center, Lagos', icon: 'Briefcase' }
];"""
text = re.sub(old_array, new_array, text)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
