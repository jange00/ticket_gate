import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/ui/Loading';

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication or loading user profile
  if (isLoading || (isAuthenticated && !user)) {
    return <Loading fullScreen />;
  }

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but user profile not loaded yet, wait
  if (!user) {
    return <Loading fullScreen />;
  }

  // If user exists but role is not yet loaded, wait (unless we're still loading)
  if (user && !user.role && !isLoading) {
    // User object exists but role is missing - this shouldn't happen
    // but we'll wait a bit more for the role to load
    console.warn('User object exists but role is missing:', user);
  }

  // Normalize role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();
  const normalizedRequiredRole = requiredRole?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map(role => role?.toLowerCase());

  // Debug logging (remove in production)
  if (import.meta.env.DEV) {
    console.log('ProtectedRoute check:', {
      userRole,
      requiredRole: normalizedRequiredRole,
      allowedRoles: normalizedAllowedRoles,
      isAdmin: userRole === 'admin',
      userObject: user,
      rawRole: user?.role,
      userKeys: user ? Object.keys(user) : [],
      fullUser: JSON.stringify(user),
    });
  }
  
  // If user exists but has no role, wait for profile to load
  if (user && !user.role && isLoading) {
    return <Loading fullScreen />;
  }

  // Admin has access to everything - check this FIRST before any other checks
  if (userRole === 'admin') {
    console.log('Admin user detected - granting access');
    return children;
  }

  // Check role-based access
  if (normalizedRequiredRole && userRole !== normalizedRequiredRole) {
    console.warn('Access denied: Required role', normalizedRequiredRole, 'but user has', userRole);
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user has any of the allowed roles
  if (normalizedAllowedRoles && normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    console.warn('Access denied: Allowed roles', normalizedAllowedRoles, 'but user has', userRole);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
