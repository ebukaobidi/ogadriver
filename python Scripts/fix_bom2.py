import io
path = 'database/migrations/2026_10_10_000011_add_wealth_ecosystem_fields_to_users_table.php'
with io.open(path, 'r', encoding='utf-8-sig') as f: text = f.read()
with io.open(path, 'w', encoding='utf-8') as f: f.write(text.lstrip())
