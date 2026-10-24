import re

path = 'database/seeders/SubscriptionPlanSeeder.php'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('<?php', '<?php')
text = text.replace('?5,000', '?5,000')
text = text.replace('?10,000', '?10,000')
text = text.replace('?15,000', '?15,000')
text = text.replace('?3,000', '?3,000')
text = text.replace('?300', '?300')
text = text.replace('?5', '?5')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
