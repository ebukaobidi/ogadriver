import os

src_dir = r"c:\xampp\htdocs\ogadriver.ng\mobile\src"

def replace_in_file(rel_path, replacements):
    path = os.path.join(src_dir, rel_path)
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig = content
    for old, new in replacements:
        content = content.replace(old, new)
        
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {rel_path}")
    else:
        print(f"No changes made to {rel_path}")

# 1-17 Replacements
replace_in_file('screens/LoginScreen.js', [
    ('"Passwordless Access"', '"Login with OTP"')
])

replace_in_file('screens/RegisterScreen.js', [
    ('"Identity Registration"', '"Create Your Account"'),
    ('placeholder="John Doe"', 'placeholder="Chukwuemeka Obi"'),
    ('placeholder="john@example.com"', 'placeholder="emeka@email.com"'),
    ('"Initialize Account"', '"Create Account"'),
    ('"Authenticate"', '"Login"')
])

replace_in_file('screens/ContractsScreen.js', [
    ('Active Ops', 'Active Bookings'),
    ('Ongoing Deployments', 'Current Assignments')
])

replace_in_file('screens/DriverDocumentsScreen.js', [
    ('Trust & Safety Dossier', 'Verification Documents'),
    ('Required for Deployment', 'Required for Activation'),
    ('Security Node Activation', 'Upload Document')
])

job_details_remove = """    {/* DEV ONLY: TRIGGER SECURITY HALT */}
    <TouchableOpacity 
        className="bg-red-500/20 border border-red-500 py-3 rounded-xl items-center mb-4"
        onPress={() => setShowSecurityHalt(true)}
    >
        <Text className="text-red-500 font-bold uppercase tracking-widest text-xs">Test Biometric Dead-Man Switch</Text>
    </TouchableOpacity>"""
replace_in_file('screens/JobDetailsScreen.js', [
    ('Operations Dossier', 'Job Information'),
    ('Stealth Protocol', 'Private Route'),
    ('HIDDEN (Stealth Protocol)', 'Private (Hidden Route)'),
    (job_details_remove, '')
])

replace_in_file('screens/EmergencySosScreen.js', [
    ('Return to Operational Screen', 'Return to Home Screen'),
    ('Security Central', 'OgaDriver Safety Team'),
    ('Guarantors and Security patrol units have received your coordinates.', 'Your emergency contacts and OgaDriver Safety Team have been notified.'),
    ('Security patrol units', 'emergency contacts'),
    ('Live Operative GPS Beacon Dispatched', 'Emergency Alert Sent')
])

replace_in_file('screens/ProfileScreen.js', [
    ('Account & Dossier', 'My Account'),
    ('Hybrid Client', 'OgaDriver Member')
])

replace_in_file('screens/WeeklySprintScreen.js', [
    ('Top Operatives Leaderboard', 'Top Drivers Leaderboard'),
    ('Top Operative Leaderboard', 'Top Drivers Leaderboard'),
    ('Operative #', 'Driver #'),
    ('Top Operatives', 'Top Drivers')
])

replace_in_file('screens/AppLockScreen.js', [
    ('Secure Lock', 'App Lock')
])

replace_in_file('screens/AppSettingsScreen.js', [
    ('Clearance granted', 'Authentication successful!'),
    ('Rooted theme selection applied globally across all Hire/Ride & Driver screens.', 'Theme applied across all screens.')
])

replace_in_file('screens/DriverSettingsScreen.js', [
    ('Background Telemetry', 'Live Location Sharing')
])

replace_in_file('screens/ChatScreen.js', [
    ('In-App Encryption', 'Secure Chat')
])

replace_in_file('screens/SearchDriversScreen.js', [
    ('"1.2 km away"', "{item.distance ? `${item.distance} km away` : 'Nearby'}"),
    ('Scanning 15km radius', 'Drivers near you'),
    ('Live Radar', 'Find Drivers')
])

replace_in_file('screens/DashboardScreen.js', [
    ('<Text className="text-slate-900 dark:text-white font-black text-[9px] uppercase mt-0.5 tracking-widest">SOS</Text>',
     '<Text className="text-white font-black text-[9px] uppercase mt-0.5 tracking-widest">SOS</Text>')
])

for f in ['screens/ReferralScreen.js', 'screens/EarningsScreen.js', 'screens/LoyaltyScreen.js']:
    replace_in_file(f, [('ogadriver.com', 'ogadriver.ng')])
