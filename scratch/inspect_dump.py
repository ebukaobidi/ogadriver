import re

sql_file = r'C:\Users\HomePC\Downloads\ogadriver.sql'

tables = {}
current_table = None

with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        m = re.match(r'INSERT INTO `?(\w+)`?', line, re.IGNORECASE)
        if m:
            current_table = m.group(1)
            tables[current_table] = tables.get(current_table, 0) + 1

print("Found data for tables:")
for tbl, count in sorted(tables.items()):
    print(f" - {tbl}: {count} insert statement(s)")
