import io

path = 'database/seeders/SubscriptionPlanSeeder.php'
with io.open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Strip BOM if exists
if text.startswith('\ufeff'):
    text = text[1:]

with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(text)

