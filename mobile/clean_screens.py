import re

# RIDE BOOKING SCREEN
with open('src/screens/hirer/RideBookingScreen.js', 'r') as f:
    code = f.read()

# Remove state
code = re.sub(r"const \[activeTab, setActiveTab\] = useState\('Ride'\);\n?", "", code)
# Fix map activeTab
code = code.replace("{activeTab === 'Ride' && dropoff &&", "{dropoff &&")
code = code.replace("{activeTab === 'Ride' && pickup && dropoff && (", "{pickup && dropoff && (")

# Remove adjustPrice logic
code = re.sub(r"const adjustPrice = \(amount\) => \{[\s\S]*?\};\n", "const adjustPrice = (amount) => { setOfferPrice(prev => Math.max(1000, prev + amount)); };\n", code)

# Remove Tab Controls entirely
code = re.sub(r"\{/\* Map Controls \*/\}[\s\S]*?</View>\n\n\s*\{/\*", "{/*", code)

# Strip out the {activeTab === 'Ride' && ( <> ... </> )} wrapping
code = re.sub(r"\{activeTab === 'Ride' && \(\s*<>\s*", "", code)
# End of Ride tab has </> )}. It's before HIRE TAB CONTENT. Let's find it.
code = re.sub(r"</>\s*\)\}\s*\{/\* =========================================\s*HIRE TAB CONTENT", "{/* =========================================\n                HIRE TAB CONTENT", code)

# Remove HIRE TAB CONTENT
code = re.sub(r"\{/\* =========================================\s*HIRE TAB CONTENT[\s\S]*?\{/\* Common \*/\}", "{/* Common */}", code)

with open('src/screens/hirer/RideBookingScreen.js', 'w') as f:
    f.write(code)


# HIRE BOOKING SCREEN
with open('src/screens/hirer/HireBookingScreen.js', 'r') as f:
    code2 = f.read()

# Rename component
code2 = code2.replace("export default function RideBookingScreen", "export default function HireBookingScreen")

# Remove state
code2 = re.sub(r"const \[activeTab, setActiveTab\] = useState\('Ride'\);\n?", "", code2)
# Fix map activeTab
code2 = code2.replace("{activeTab === 'Hire a driver' && dropoff &&", "{dropoff &&")
code2 = code2.replace("{activeTab === 'Hire a driver' && pickup && dropoff && (", "{pickup && dropoff && (")
code2 = code2.replace("{activeTab === 'Ride' && dropoff &&", "{false &&")
code2 = code2.replace("{activeTab === 'Ride' && pickup && dropoff && (", "{false && (")

# Remove adjustPrice logic
code2 = re.sub(r"const adjustPrice = \(amount\) => \{[\s\S]*?\};\n", "const adjustPrice = (amount) => { setHireOfferPrice(prev => Math.max(1000, prev + amount)); };\n", code2)

# Remove Tab Controls entirely
code2 = re.sub(r"\{/\* Map Controls \*/\}[\s\S]*?</View>\n\n\s*\{/\*", "{/*", code2)

# Remove RIDE TAB CONTENT
code2 = re.sub(r"\{/\* =========================================\s*RIDE TAB CONTENT[\s\S]*?\{/\* =========================================\s*HIRE TAB CONTENT", "{/* =========================================\n                HIRE TAB CONTENT", code2)

# Strip out the {activeTab === 'Hire a driver' && ( <> ... </> )} wrapping
code2 = re.sub(r"\{activeTab === 'Hire a driver' && \(\s*<>\s*", "", code2)
code2 = re.sub(r"</>\s*\)\}\s*\{/\* Common \*/\}", "{/* Common */}", code2)

with open('src/screens/hirer/HireBookingScreen.js', 'w') as f:
    f.write(code2)

