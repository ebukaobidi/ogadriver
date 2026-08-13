import { Navigate } from 'react-router-dom';
import { authService } from '../api/auth';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, allowedRoles = ['admin', 'super_admin'] }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      const currentUser = authService.getUser();
      
      setIsAuthenticated(authStatus);
      setUser(currentUser);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandMint"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.role) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
    {children}
  </ProtectedRoute>
);

export const DriverRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['driver']}>
    {children}
  </ProtectedRoute>
);

export const HirerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['hirer']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
