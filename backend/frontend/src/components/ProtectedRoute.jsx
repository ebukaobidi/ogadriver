import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../api/auth';

const ADMIN_ROLES = ['admin', 'super_admin', 'superadmin', 'administrator', 'state_manager', 'regional_admin'];

const ProtectedRoute = ({ children, allowedRoles = ['admin', 'super_admin'] }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user || !user.role) {
    return <Navigate to="/onboarding" replace />;
  }

  const rawRole = typeof user.role === 'object' && user.role !== null
    ? (user.role.slug || user.role.name || '')
    : user.role;
  const role = String(rawRole || '').toLowerCase();

  const isAdminRole = ADMIN_ROLES.includes(role);
  const isDriverRole = ['driver'].includes(role);
  const isHirerRole = ['hirer', 'employer'].includes(role);

  const hasAccess = allowedRoles.some(r => {
    const norm = String(r).toLowerCase();
    if (ADMIN_ROLES.includes(norm)) return isAdminRole;
    if (norm === 'driver') return isDriverRole;
    if (norm === 'hirer') return isHirerRole;
    return norm === role;
  });

  if (!hasAccess) {
    const currentPath = location.pathname;
    if (isAdminRole) {
      if (currentPath !== '/admin/dashboard' && currentPath !== '/admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return children;
    }
    if (isDriverRole) {
      if (currentPath !== '/driver') {
        return <Navigate to="/driver" replace />;
      }
      return children;
    }
    if (isHirerRole) {
      if (currentPath !== '/hirer') {
        return <Navigate to="/hirer" replace />;
      }
      return children;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'super_admin', 'superadmin', 'administrator', 'state_manager', 'regional_admin']}>
    {children}
  </ProtectedRoute>
);

export const DriverRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['driver']}>
    {children}
  </ProtectedRoute>
);

export const HirerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['hirer', 'employer']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
