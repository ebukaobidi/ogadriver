import re

input_file = r'C:\Users\HomePC\Downloads\ogadriver.sql'
output_file = r'c:\xampp\htdocs\ogadriver.ng\ogadriver_restore.sql'

print("Preparing clean database restore file...")

with open(input_file, 'r', encoding='utf-8', errors='ignore') as infile, \
     open(output_file, 'w', encoding='utf-8') as outfile:
    
    outfile.write("SET FOREIGN_KEY_CHECKS = 0;\n")
    outfile.write("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n")
    outfile.write("START TRANSACTION;\n")
    outfile.write("SET time_zone = '+00:00';\n\n")
    
    for line in infile:
        # Match CREATE TABLE `tbl`
        m = re.match(r'^CREATE TABLE `?(\w+)`?', line, re.IGNORECASE)
        if m:
            table_name = m.group(1)
            outfile.write(f"DROP TABLE IF EXISTS `{table_name}`;\n")
            outfile.write(line)
        else:
            outfile.write(line)
            
    outfile.write("\nSET FOREIGN_KEY_CHECKS = 1;\nCOMMIT;\n")

print("Finished! File created at:", output_file)
