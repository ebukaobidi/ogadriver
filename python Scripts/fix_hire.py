# -*- coding: utf-8 -*-
import io
import re

path = 'frontend/src/components/hirer/MobileHireDirectory.jsx'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("if (filters.vehicle_required) params.vehicle_required = 1;", "if (filters.vehicle_required) params.has_vehicle = 1;")

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
