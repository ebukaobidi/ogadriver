const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const navDir = path.join(__dirname, 'src', 'navigation');

const dirs = {
  driver: path.join(screensDir, 'driver'),
  hirer: path.join(screensDir, 'hirer'),
  shared: path.join(screensDir, 'shared')
};

// Create dirs
Object.values(dirs).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const driverScreens = [
  'ContractsScreen.js',
  'DriverAssessmentScreen.js',
  'DriverDashboardScreen.js',
  'DriverDocumentsScreen.js',
  'DriverHomeScreen.js',
  'DriverJobsScreen.js',
  'DriverProfileScreen.js',
  'DriverSettingsScreen.js',
  'DriverTacticalMapScreen.js',
  'DriverWalletScreen.js',
  'EarningsScreen.js',
  'InstantCashoutScreen.js',
  'NaijaDriverHomeScreen.js',
  'ProposalsScreen.js',
  'ScheduleScreen.js',
  'VehicleInspectionScreen.js',
  'WeeklySprintScreen.js',
  'OgaCopilotScreen.js'
];

const hirerScreens = [
  'HirerBookingsScreen.js',
  'HirerDashboardScreen.js',
  'HirerDashboardScreenV2.js',
  'NaijaHirerHomeScreen.js',
  'PlacementPaymentScreen.js',
  'PostJobScreen.js',
  'RideBookingScreen.js',
  'SearchDriversScreen.js',
  'VipFleetScreen.js',
  'JobDetailsScreen.js'
];

const sharedScreens = [
  'AppLockScreen.js',
  'AppSettingsScreen.js',
  'ChatScreen.js',
  'ConversationsListScreen.js',
  'DashboardScreen.js',
  'EmergencySosScreen.js',
  'LoginScreen.js',
  'LoyaltyScreen.js',
  'OnboardingScreen.js',
  'PerkQrScreen.js',
  'ProfileScreen.js',
  'ReferralScreen.js',
  'RegisterScreen.js',
  'ReportInfractionScreen.js'
];

function getCategory(file) {
  if (driverScreens.includes(file)) return 'driver';
  if (hirerScreens.includes(file)) return 'hirer';
  if (sharedScreens.includes(file)) return 'shared';
  return 'shared'; // default fallback
}

// 1. Move screens and update their internal imports
const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const oldPath = path.join(screensDir, file);
  if (!fs.statSync(oldPath).isFile()) return;
  
  const cat = getCategory(file);
  const newPath = path.join(dirs[cat], file);
  
  let content = fs.readFileSync(oldPath, 'utf8');
  
  // Replace imports that start with '../' (e.g. '../components/..') to '../../'
  content = content.replace(/from\s+['"]\.\.\/([^'"]+)['"]/g, "from '../../$1'");
  
  // They might also import from other screens (e.g. './LoginScreen' -> '../shared/LoginScreen')
  // We can't perfectly regex this without knowing the destination of the other screen, but usually screens don't import screens.
  
  fs.writeFileSync(newPath, content);
  fs.unlinkSync(oldPath);
  console.log(`Moved ${file} to ${cat}/`);
});

// 2. Update Navigation files
const navFiles = fs.readdirSync(navDir).filter(f => f.endsWith('.js'));
navFiles.forEach(file => {
  const p = path.join(navDir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // We need to replace '../screens/ScreenName' with '../screens/category/ScreenName'
  content = content.replace(/from\s+['"]\.\.\/screens\/([^'"]+)['"]/g, (match, screenName) => {
    const screenFile = screenName + '.js';
    const cat = getCategory(screenFile);
    return `from '../screens/${cat}/${screenName}'`;
  });
  
  fs.writeFileSync(p, content);
  console.log(`Updated navigation ${file}`);
});
