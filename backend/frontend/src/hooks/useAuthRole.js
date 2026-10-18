// Hook to check role and permissions in React components
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // assuming you have an AuthContext providing user
import { ROLE } from '../constants/roles';
import { PERMISSIONS } from '../constants/permissions';

export const useAuthRole = () => {
  const { user } = useContext(AuthContext);

  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const hasAnyRole = (rolesArray) => {
    if (!user) return false;
    return rolesArray.includes(user.role);
  };

  const hasPermission = (perm) => {
    if (!user) return false;
    const rolePerms = PERMISSIONS[user.role] || [];
    return rolePerms.includes(perm);
  };

  return { user, hasRole, hasAnyRole, hasPermission };
};
