import sys, re
sys.stdout.reconfigure(encoding='utf-8')

for filepath in [
    'frontend/src/components/hirer/MobileRideBooking.jsx',
    'frontend/src/components/hirer/MobileHireDirectory.jsx'
]:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix merged setState pairs: xyzsetXyz -> xyz, setXyz
    content = re.sub(
        r'\[([a-z][a-zA-Z]*)(set[A-Z][a-zA-Z]*)\] = (React\.)?useState',
        lambda m: f'[{m.group(1)}, {m.group(2)}] = {m.group(3) or ""}useState',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
