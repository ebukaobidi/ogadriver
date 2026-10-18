import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { authService } from './api/auth';
import { useEffect, lazy, Suspense } from 'react';
import CustomerSupport from './components/CustomerSupport';
import { NotificationProvider, NotificationToast } from './components/NotificationSystem';
import { MessagingProvider } from './components/MessagingSystem';
import ProtectedRoute, { AdminRoute, DriverRoute, HirerRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeToggle from './components/ThemeToggle';
import InstallPrompt from './components/InstallPrompt';
import OfflineBanner from './components/OfflineBanner';
import { LanguageProvider } from './context/LanguageContext';
import api from './api/axios';
import './index.css';

const applyDynamicFont = (fontFamily) => {
  if (!fontFamily || fontFamily === 'Inter') return;
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700;800;900&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  document.documentElement.style.setProperty('--font-sans', `"${fontFamily}", sans-serif`);
};

// Fetch public settings on boot
api.get('/settings/public').then(res => {
  if (res.data?.status === 'success' && res.data?.data?.primaryFont) {
    applyDynamicFont(res.data.data.primaryFont);
  }
}).catch(console.error);

const safeLazy = (importFn) => 
  lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.warn('Component dynamic import notice:', error);
      
      // Stable fallback UI with manual reload button (no automated loop)
      return {
        default: () => (
          <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-400 text-2xl font-bold">!</span>
              </div>
              <h2 className="text-white font-bold text-lg mb-2">Screen Refresh Needed</h2>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                A newer version of this screen is available. Click below to load it cleanly.
              </p>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full bg-[#1cd188] hover:bg-[#19b877] text-[#0f172a] font-bold py-3 px-6 rounded-xl transition-all text-sm uppercase tracking-wider cursor-pointer"
              >
                Reload Screen
              </button>
            </div>
          </div>
        )
      };
    }
  });

const DrivingSchools = safeLazy(() => import('./pages/DrivingSchools'));
const DrivingSchoolDetail = safeLazy(() => import('./pages/DrivingSchoolDetail'));
const VipFleetRegister = safeLazy(() => import('./pages/VipFleetRegister'));

const Login = safeLazy(() => import('./pages/Login'));
const Register = safeLazy(() => import('./pages/Register'));
const ForgotPassword = safeLazy(() => import('./pages/ForgotPassword'));
const Verify = safeLazy(() => import('./pages/Verify'));
const Terms = safeLazy(() => import('./pages/Terms'));
const Privacy = safeLazy(() => import('./pages/Privacy'));
const DriverPortal = safeLazy(() => import('./pages/DriverPortal'));
const HirerPortal = safeLazy(() => import('./pages/HirerPortal'));
const Onboarding = safeLazy(() => import('./pages/Onboarding'));
const AdminDashboard = safeLazy(() => import('./pages/AdminDashboard'));
const UsersManagement = safeLazy(() => import('./pages/admin/UsersManagement'));
const UserDetail = safeLazy(() => import('./pages/admin/UserDetail'));
const HirerManagement = safeLazy(() => import('./pages/admin/HirerManagement'));
const HirerDetail = safeLazy(() => import('./pages/admin/HirerDetail'));
const AdminManagement = safeLazy(() => import('./pages/admin/AdminManagement'));
const AdminProfile = safeLazy(() => import('./pages/admin/AdminProfile'));
const DriverList = safeLazy(() => import('./pages/admin/DriverList'));
const DriverDetail = safeLazy(() => import('./pages/admin/DriverDetail'));
const DriverEdit = safeLazy(() => import('./pages/admin/DriverEdit'));
const DriverOnboarding = safeLazy(() => import('./pages/DriverOnboarding'));
const DriverVerification = safeLazy(() => import('./pages/admin/DriverVerification'));
const DriverPerformance = safeLazy(() => import('./pages/admin/DriverPerformance'));
const DriverBlacklist = safeLazy(() => import('./pages/admin/DriverBlacklist'));
const JobManagement = safeLazy(() => import('./pages/admin/JobManagement'));
const ActiveJobs = safeLazy(() => import('./pages/admin/ActiveJobs'));
const CompletedJobs = safeLazy(() => import('./pages/admin/CompletedJobs'));
const JobDisputes = safeLazy(() => import('./pages/admin/JobDisputes'));
const FinancialOverview = safeLazy(() => import('./pages/admin/FinancialOverview'));
const Transactions = safeLazy(() => import('./pages/admin/Transactions'));
const RevenueAnalytics = safeLazy(() => import('./pages/admin/RevenueAnalytics'));
const SubscriptionManagement = safeLazy(() => import('./pages/admin/SubscriptionManagement'));
const SubscriptionPlans = safeLazy(() => import('./pages/admin/SubscriptionPlans'));
const SubscriptionPayments = safeLazy(() => import('./pages/admin/SubscriptionPayments'));
const TelemetryLive = safeLazy(() => import('./pages/admin/TelemetryLive'));
const TelemetryIncidents = safeLazy(() => import('./pages/admin/TelemetryIncidents'));
const GeneralSettings = safeLazy(() => import('./pages/admin/GeneralSettings'));
const ReleaseManager = safeLazy(() => import('./pages/admin/ReleaseManager'));
const SecuritySettings = safeLazy(() => import('./pages/admin/SecuritySettings'));
const NotificationSettings = safeLazy(() => import('./pages/admin/NotificationSettings'));
const APIConfiguration = safeLazy(() => import('./pages/admin/APIConfiguration'));
const AuditLogs = safeLazy(() => import('./pages/admin/AuditLogs'));
const AuditLog = safeLazy(() => import('./pages/admin/AuditLog'));
const DisputeResolution = safeLazy(() => import('./pages/admin/DisputeResolution'));
const AdvancedAnalytics = safeLazy(() => import('./pages/admin/AdvancedAnalytics'));
const CommunicationCenter = safeLazy(() => import('./pages/admin/CommunicationCenter'));
const SystemHealth = safeLazy(() => import('./pages/admin/SystemHealth'));
const ApiSettings = safeLazy(() => import('./pages/admin/ApiSettings'));
const BlacklistManagement = safeLazy(() => import('./pages/admin/BlacklistManagement'));
const SiteContent = safeLazy(() => import('./pages/admin/SiteContent'));
const MobileSettings = safeLazy(() => import('./pages/admin/MobileSettings'));
const BlogManagement = safeLazy(() => import('./pages/admin/BlogManagement'));
const DrivingSchoolsManagement = safeLazy(() => import('./pages/admin/DrivingSchoolsManagement'));
const CarHiresManagement = safeLazy(() => import('./pages/admin/CarHiresManagement'));
const AdminFleetRadarPage = safeLazy(() => import('./pages/admin/AdminFleetRadarPage'));
const BatchPayoutPage = safeLazy(() => import('./pages/admin/BatchPayoutPage'));
const FinancialForecastPage = safeLazy(() => import('./pages/admin/FinancialForecastPage'));
const AiGuarantorCallPage = safeLazy(() => import('./pages/admin/AiGuarantorCallPage'));
const ServerTerminalPage = safeLazy(() => import('./pages/admin/ServerTerminalPage'));
const RegionalCommandCenterPage = safeLazy(() => import('./pages/admin/RegionalCommandCenterPage'));
const Home = safeLazy(() => import('./pages/Home'));
const PromoterPortal = safeLazy(() => import('./pages/PromoterPortal'));

const Vetting = safeLazy(() => import('./pages/Vetting'));
const Enterprise = safeLazy(() => import('./pages/Enterprise'));
const GuarantorForm = safeLazy(() => import('./pages/GuarantorForm'));

const GoogleCallback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    let apiBase = import.meta.env.VITE_API_BASE_URL;
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      apiBase = `${window.location.origin}/api`;
    }
    if (!apiBase || apiBase === 'undefined') {
      apiBase = `${window.location.origin}/api`;
    }
    apiBase = apiBase.replace(/\/$/, '');

    if (error) {
      window.location.href = `/login?error=${encodeURIComponent(error)}`;
      return;
    }

    if (token) {
      localStorage.setItem('auth_token', token);
      fetch(`${apiBase}/auth/me`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            const user = data.user;
            if (!user.role) {
              window.location.href = '/onboarding';
            } else if (user.role === 'driver') {
              window.location.href = '/driver';
            } else if (user.role === 'hirer') {
              window.location.href = '/hirer';
            } else if (['admin', 'super_admin'].includes(user.role)) {
              window.location.href = '/admin/dashboard';
            } else {
              window.location.href = '/dashboard';
            }
          } else {
            window.location.href = '/login?error=auth_failed';
          }
        })
        .catch(() => {
          window.location.href = '/login?error=auth_failed';
        });
    } else if (code) {
      window.location.href = `${apiBase}/auth/google/callback?code=${encodeURIComponent(code)}`;
    } else {
      window.location.href = '/login?error=no_token';
    }
  }, []);

  return (
    <div className="min-h-screen bg-corporateNavy flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandMint mx-auto mb-4"></div>
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
};

const RoleRedirect = () => {
  const user = authService.getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.role) return <Navigate to="/onboarding" replace />;
  
  const rawRole = typeof user.role === 'object' && user.role !== null
    ? (user.role.slug || user.role.name || '')
    : user.role;
  const role = String(rawRole || '').toLowerCase();

  if (['state_manager', 'regional_admin'].includes(role)) {
    return <Navigate to="/admin/regional-command" replace />;
  }
  if (['admin', 'super_admin', 'superadmin', 'administrator'].includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (['hirer', 'employer'].includes(role)) {
    return <Navigate to="/hirer" replace />;
  }
  if (['driver'].includes(role)) {
    return <Navigate to="/driver" replace />;
  }
  return <Navigate to="/login" replace />;
};

const HomePwaRedirect = () => {
  const isPwa = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isPwa) {
    return <Navigate to="/login" replace />;
  }
  return <Home />;
};

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <NotificationProvider>
          <OfflineBanner />
          <InstallPrompt />
          <MessagingProvider>
          <Router>
            <Suspense fallback={
              <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="w-12 h-12 rounded-2xl bg-[#1cd188]/10 border border-[#1cd188]/30 flex items-center justify-center mb-4 shadow-lg shadow-[#1cd188]/5">
                  <div className="w-6 h-6 border-2 border-[#1cd188] border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-white font-black text-sm tracking-wider uppercase">OGADRIVER</p>
                <p className="text-slate-400 font-mono text-xs mt-1">Loading workspace...</p>
              </div>
            }>
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<Login isAdminPortal={true} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/dashboard" element={<RoleRedirect />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />} />
              <Route path="/driver-onboarding" element={<DriverOnboarding />} />
              
              <Route path="/driver/*" element={<DriverRoute><DriverPortal /></DriverRoute>} />
              <Route path="/promoter" element={<PromoterPortal />} />
              <Route path="/hirer" element={<HirerRoute><HirerPortal /></HirerRoute>} />
              
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/regional-command" element={<AdminRoute><RegionalCommandCenterPage /></AdminRoute>} />
              <Route path="/admin/location-activation" element={<Navigate to="/admin/regional-command" replace />} />
              <Route path="/admin/launch-zones" element={<Navigate to="/admin/regional-command" replace />} />
              <Route path="/admin/users" element={<AdminRoute><UsersManagement /></AdminRoute>} />
              <Route path="/admin/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
              <Route path="/admin/hirers" element={<AdminRoute><HirerManagement /></AdminRoute>} />
              <Route path="/admin/hirers/:id" element={<AdminRoute><HirerDetail /></AdminRoute>} />
              <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
              <Route path="/admin/drivers" element={<AdminRoute><DriverList /></AdminRoute>} />
              <Route path="/admin/admins" element={<AdminRoute><AdminManagement /></AdminRoute>} />
              <Route path="/admin/drivers/list" element={<AdminRoute><DriverList /></AdminRoute>} />
              <Route path="/admin/drivers/:id" element={<AdminRoute><DriverDetail /></AdminRoute>} />
              <Route path="/admin/drivers/:id/edit" element={<AdminRoute><DriverEdit /></AdminRoute>} />
              <Route path="/admin/drivers/verification" element={<AdminRoute><DriverVerification /></AdminRoute>} />
              <Route path="/admin/drivers/performance" element={<AdminRoute><DriverPerformance /></AdminRoute>} />
              <Route path="/admin/drivers/blacklist" element={<AdminRoute><DriverBlacklist /></AdminRoute>} />
              <Route path="/admin/jobs" element={<AdminRoute><JobManagement /></AdminRoute>} />
              <Route path="/admin/jobs/active" element={<AdminRoute><ActiveJobs /></AdminRoute>} />
              <Route path="/admin/jobs/completed" element={<AdminRoute><CompletedJobs /></AdminRoute>} />
              <Route path="/admin/jobs/disputes" element={<AdminRoute><JobDisputes /></AdminRoute>} />
              <Route path="/admin/disputes" element={<AdminRoute><DisputeResolution /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdvancedAnalytics /></AdminRoute>} />
              <Route path="/admin/audit" element={<AdminRoute><AuditLog /></AdminRoute>} />
              <Route path="/admin/communications" element={<AdminRoute><CommunicationCenter /></AdminRoute>} />
              <Route path="/admin/system-health" element={<AdminRoute><SystemHealth /></AdminRoute>} />
              <Route path="/admin/telemetry/live" element={<AdminRoute><TelemetryLive /></AdminRoute>} />
              <Route path="/admin/telemetry/incidents" element={<AdminRoute><TelemetryIncidents /></AdminRoute>} />
              <Route path="/admin/financials" element={<AdminRoute><FinancialOverview /></AdminRoute>} />
              <Route path="/admin/financials/transactions" element={<AdminRoute><Transactions /></AdminRoute>} />
              <Route path="/admin/financials/revenue" element={<AdminRoute><RevenueAnalytics /></AdminRoute>} />
              <Route path="/admin/subscriptions" element={<AdminRoute><SubscriptionManagement /></AdminRoute>} />
              <Route path="/admin/subscriptions/plans" element={<AdminRoute><SubscriptionPlans /></AdminRoute>} />
              <Route path="/admin/subscriptions/payments" element={<AdminRoute><SubscriptionPayments /></AdminRoute>} />
              <Route path="/admin/settings/general" element={<AdminRoute><GeneralSettings /></AdminRoute>} />
              <Route path="/admin/settings/releases" element={<AdminRoute><ReleaseManager /></AdminRoute>} />
              <Route path="/admin/settings/security" element={<AdminRoute><SecuritySettings /></AdminRoute>} />
              <Route path="/admin/settings/notifications" element={<AdminRoute><NotificationSettings /></AdminRoute>} />
              <Route path="/admin/settings/api" element={<AdminRoute><ApiSettings /></AdminRoute>} />
              <Route path="/admin/mobile" element={<AdminRoute><MobileSettings /></AdminRoute>} />
              <Route path="/admin/security" element={<Navigate to="/admin/settings/security" replace />} />
              <Route path="/admin/security/audit" element={<AdminRoute><AuditLogs /></AdminRoute>} />
              <Route path="/admin/security/blacklist" element={<AdminRoute><BlacklistManagement /></AdminRoute>} />
              <Route path="/admin/content/site" element={<AdminRoute><SiteContent /></AdminRoute>} />
              <Route path="/admin/content/blog" element={<AdminRoute><BlogManagement /></AdminRoute>} />
              <Route path="/admin/directories/driving-schools" element={<AdminRoute><DrivingSchoolsManagement /></AdminRoute>} />
              <Route path="/admin/directories/car-hires" element={<AdminRoute><CarHiresManagement /></AdminRoute>} />
              <Route path="/admin/telemetry/radar" element={<AdminRoute><AdminFleetRadarPage /></AdminRoute>} />
              <Route path="/admin/financials/batch-payouts" element={<AdminRoute><BatchPayoutPage /></AdminRoute>} />
              <Route path="/admin/financials/forecasting" element={<AdminRoute><FinancialForecastPage /></AdminRoute>} />
              <Route path="/admin/guarantor-calls" element={<AdminRoute><AiGuarantorCallPage /></AdminRoute>} />
              <Route path="/admin/call-logs" element={<AdminRoute><AiGuarantorCallPage /></AdminRoute>} />
              <Route path="/admin/system-health/terminal" element={<AdminRoute><ServerTerminalPage /></AdminRoute>} />
              <Route path="/admin/terminal" element={<AdminRoute><ServerTerminalPage /></AdminRoute>} />
              <Route path="/admin/fleet-map" element={<AdminRoute><AdminFleetRadarPage /></AdminRoute>} />
              <Route path="/admin/payouts" element={<AdminRoute><BatchPayoutPage /></AdminRoute>} />
              <Route path="/admin/emergency" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              
              <Route path="/" element={<HomePwaRedirect />} />
              <Route path="/driving-schools" element={<DrivingSchools />} />
              <Route path="/driving-schools/:slug" element={<DrivingSchoolDetail />} />
              <Route path="/vip-fleet-register" element={<VipFleetRegister />} />
              <Route path="/executive-car-hires" element={<Navigate to="/hirer" replace />} />
              <Route path="/executive-car-hires/*" element={<Navigate to="/hirer" replace />} />
              <Route path="/vetting" element={<Vetting />} />
              <Route path="/enterprise" element={<Enterprise />} />
              <Route path="/guarantor-form/:formType/:driverId" element={<GuarantorForm />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </Suspense>
          <GlobalSupportWidget />
          <NotificationToast />
          
        </Router>
      </MessagingProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

// Separate component to use useLocation for conditional rendering
function GlobalSupportWidget() {
  const location = useLocation();
  const hideSupportPaths = ['/admin', '/driver', '/hirer', '/dashboard', '/onboarding'];
  const isBackend = hideSupportPaths.some(path => location.pathname.startsWith(path));
  
  if (isBackend) return null;
  return <CustomerSupport />;
}

export default App;
