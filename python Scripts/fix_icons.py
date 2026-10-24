import re

with open('mobile/src/screens/DriverProfileScreen.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Make all Ionicons color='#1cd188' except maybe the logout one (red) or keep it red?
# "all the icon on this project to be inuniform in color"
text = re.sub(r'color=\"#[0-9a-fA-F]+\"', 'color=\"#1cd188\"', text)

with open('mobile/src/screens/DriverProfileScreen.js', 'w', encoding='utf-8') as f:
    f.write(text)
