import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { authService } from './api/auth';
import { useEffect, lazy, Suspense } from 'react';
import CustomerSupport from './components/CustomerSupport';
import { NotificationProvider, NotificationToast } from './components/NotificationSystem';
import { MessagingProvider } from './components/MessagingSystem';
import ProtectedRoute, { AdminRoute, DriverRoute, HirerRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeToggle from './components/ThemeToggle';
import './index.css';
const DrivingSchools = lazy(() => import('./pages/DrivingSchools'));
const DrivingSchoolDetail = lazy(() => import('./pages/DrivingSchoolDetail'));
const ExecutiveCarHires = lazy(() => import('./pages/ExecutiveCarHires'));
const ExecutiveCarHireDetail = lazy(() => import('./pages/ExecutiveCarHireDetail'));

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const DriverPortal = lazy(() => import('./pages/DriverPortal'));
const HirerPortal = lazy(() => import('./pages/HirerPortal'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const UserDetail = lazy(() => import('./pages/admin/UserDetail'));
const HirerManagement = lazy(() => import('./pages/admin/HirerManagement'));
const HirerDetail = lazy(() => import('./pages/admin/HirerDetail'));
const AdminManagement = lazy(() => import('./pages/admin/AdminManagement'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const DriverList = lazy(() => import('./pages/admin/DriverList'));
const DriverDetail = lazy(() => import('./pages/admin/DriverDetail'));
const DriverEdit = lazy(() => import('./pages/admin/DriverEdit'));
const DriverOnboarding = lazy(() => import('./pages/DriverOnboarding'));
const DriverVerification = lazy(() => import('./pages/admin/DriverVerification'));
const DriverPerformance = lazy(() => import('./pages/admin/DriverPerformance'));
const DriverBlacklist = lazy(() => import('./pages/admin/DriverBlacklist'));
const JobManagement = lazy(() => import('./pages/admin/JobManagement'));
const ActiveJobs = lazy(() => import('./pages/admin/ActiveJobs'));
const CompletedJobs = lazy(() => import('./pages/admin/CompletedJobs'));
const JobDisputes = lazy(() => import('./pages/admin/JobDisputes'));
const FinancialOverview = lazy(() => import('./pages/admin/FinancialOverview'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));
const RevenueAnalytics = lazy(() => import('./pages/admin/RevenueAnalytics'));
const SubscriptionManagement = lazy(() => import('./pages/admin/SubscriptionManagement'));
const SubscriptionPlans = lazy(() => import('./pages/admin/SubscriptionPlans'));
const SubscriptionPayments = lazy(() => import('./pages/admin/SubscriptionPayments'));
const TelemetryLive = lazy(() => import('./pages/admin/TelemetryLive'));
const TelemetryIncidents = lazy(() => import('./pages/admin/TelemetryIncidents'));
const GeneralSettings = lazy(() => import('./pages/admin/GeneralSettings'));
const SecuritySettings = lazy(() => import('./pages/admin/SecuritySettings'));
const NotificationSettings = lazy(() => import('./pages/admin/NotificationSettings'));
const APIConfiguration = lazy(() => import('./pages/admin/APIConfiguration'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const AuditLog = lazy(() => import('./pages/admin/AuditLog'));
const DisputeResolution = lazy(() => import('./pages/admin/DisputeResolution'));
const AdvancedAnalytics = lazy(() => import('./pages/admin/AdvancedAnalytics'));
const CommunicationCenter = lazy(() => import('./pages/admin/CommunicationCenter'));
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'));
const ApiSettings = lazy(() => import('./pages/admin/ApiSettings'));
const BlacklistManagement = lazy(() => import('./pages/admin/BlacklistManagement'));
const SiteContent = lazy(() => import('./pages/admin/SiteContent'));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement'));
const DrivingSchoolsManagement = lazy(() => import('./pages/admin/DrivingSchoolsManagement'));
const CarHiresManagement = lazy(() => import('./pages/admin/CarHiresManagement'));
const Home = lazy(() => import('./pages/Home'));
const Vetting = lazy(() => import('./pages/Vetting'));
const Enterprise = lazy(() => import('./pages/Enterprise'));
const GuarantorForm = lazy(() => import('./pages/GuarantorForm'));

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
      // Fetch user data with the new token
      fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            if (!data.user.role) {
              window.location.href = '/onboarding';
            } else if (['driver', 'operator'].includes(data.user.role)) {
              window.location.href = '/driver';
            } else if (['hirer', 'employee'].includes(data.user.role)) {
              window.location.href = '/hirer';
            } else if (['admin', 'super_admin'].includes(data.user.role)) {
              window.location.href = '/admin/dashboard';
            } else {
              window.location.href = '/dashboard';
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          window.location.href = '/login?error=auth_failed';
        });
    } else {
      window.location.href = '/login?error=no_token';
    }
  }, [token]);

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
  if (!user) return <Navigate to="/login" />;
  if (!user.role) return <Navigate to="/onboarding" />;
  
  switch (user.role) {
    case 'super_admin':
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'hirer':
      return <Navigate to="/hirer" />;
    case 'driver':
      return <Navigate to="/driver" />;
    default:
      return <Navigate to="/login" />;
  }
};

function App() {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <MessagingProvider>
          <Router>
            <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">Loading Terminal...</div>}>
              <Routes>
              <Route path="/login" element={!isAuthenticated ? <Login /> : <RoleRedirect />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <RoleRedirect />} />
            <Route path="/dashboard" element={<RoleRedirect />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />} />
            <Route path="/driver-onboarding" element={<DriverOnboarding />} />
            
            <Route path="/driver" element={<DriverRoute><DriverPortal /></DriverRoute>} />
            <Route path="/hirer" element={<HirerRoute><HirerPortal /></HirerRoute>} />
            
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
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
            <Route path="/admin/settings/security" element={<AdminRoute><SecuritySettings /></AdminRoute>} />
            <Route path="/admin/settings/notifications" element={<AdminRoute><NotificationSettings /></AdminRoute>} />
            <Route path="/admin/settings/api" element={<AdminRoute><ApiSettings /></AdminRoute>} />
            <Route path="/admin/security/audit" element={<AdminRoute><AuditLogs /></AdminRoute>} />
            <Route path="/admin/security/blacklist" element={<AdminRoute><BlacklistManagement /></AdminRoute>} />
            <Route path="/admin/content/site" element={<AdminRoute><SiteContent /></AdminRoute>} />
            <Route path="/admin/content/blog" element={<AdminRoute><BlogManagement /></AdminRoute>} />
            <Route path="/admin/directories/driving-schools" element={<AdminRoute><DrivingSchoolsManagement /></AdminRoute>} />
            <Route path="/admin/directories/car-hires" element={<AdminRoute><CarHiresManagement /></AdminRoute>} />
            
            <Route path="/" element={<Home />} />
            <Route path="/driving-schools" element={<DrivingSchools />} />
            <Route path="/driving-schools/:slug" element={<DrivingSchoolDetail />} />
            <Route path="/executive-car-hires" element={<ExecutiveCarHires />} />
            <Route path="/executive-car-hires/:slug" element={<ExecutiveCarHireDetail />} />
            <Route path="/vetting" element={<Vetting />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/guarantor-form/:formType/:driverId" element={<GuarantorForm />} />
            <Route path="/dashboard" element={
              isAuthenticated ? (
                <Navigate to={
                  !user?.role ? '/onboarding' :
                  user?.role === 'driver' ? '/driver' : 
                  user?.role === 'hirer' ? '/hirer' : 
                  user?.role === 'admin' || user?.role === 'super_admin' ? '/admin' : '/login'
                } />
              ) : <Navigate to="/login" />
            } />
            </Routes>
          </Suspense>
          <CustomerSupport phoneNumber="+2348000000000" />
          <NotificationToast />
        </Router>
      </MessagingProvider>
    </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
