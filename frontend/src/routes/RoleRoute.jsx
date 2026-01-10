import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/ui/Loading';

const RoleRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role to lowercase for comparison
  const userRole = user.role?.toLowerCase();
  const normalizedRoles = roles.map(role => role?.toLowerCase());

  // Debug logging (remove in production)
  if (import.meta.env.DEV) {
    console.log('RoleRoute check:', {
      userRole,
      requiredRoles: normalizedRoles,
      isAdmin: userRole === 'admin',
    });
  }

  // Admin has access to everything
  if (userRole === 'admin') {
    return children;
  }

  // Check if user has required role
  if (!normalizedRoles.includes(userRole)) {
    console.warn('Access denied: Required roles', normalizedRoles, 'but user has', userRole);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
