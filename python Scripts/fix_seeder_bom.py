import io

path = 'database/seeders/SubscriptionPlanSeeder.php'
with io.open(path, 'r', encoding='utf-8-sig') as f:
    text = f.read()

# Make sure there is no leading whitespace or empty lines before <?php
text = text.lstrip()

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(text)
