import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { 
  HomeIcon, 
  TicketIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user, isAuthenticated, logout, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await logout();
      // AuthContext will handle redirect, but this is a fallback
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local data and redirect
      navigate('/login', { replace: true });
    }
  };

  const isActive = (path) => location.pathname === path;
  
  // Check if current path is a dashboard route
  const isDashboardActive = () => {
    const dashboardRoute = getDashboardRoute();
    return location.pathname === dashboardRoute || 
           location.pathname.startsWith('/dashboard') ||
           location.pathname.startsWith('/organizer/dashboard') ||
           location.pathname.startsWith('/staff/dashboard') ||
           location.pathname.startsWith('/admin');
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Logo size={44} animated={false} showText={true} />
            </motion.div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/events"
              className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/events')
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
              }`}
            >
              {isActive('/events') && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-orange-50 rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">Events</span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardRoute()}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isDashboardActive()
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  {isDashboardActive() && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-orange-50 rounded-lg"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Dashboard</span>
                </Link>
                {user?.role === 'organizer' && (
                  <Link
                    to="/events/create"
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/events/create')
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    {isActive('/events/create') && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-orange-50 rounded-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Create Event</span>
                  </Link>
                )}
                {(user?.role === 'staff' || user?.role === 'admin') && (
                  <Link
                    to="/checkin"
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/checkin')
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    {isActive('/checkin') && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-orange-50 rounded-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Check-in</span>
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/admin')
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    {isActive('/admin') && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-orange-50 rounded-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">Admin</span>
                  </Link>
                )}
              </>
            ) : null}
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to={`${getDashboardRoute()}/settings`}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Cog6ToothIcon className="h-5 w-5 text-gray-600 hover:text-orange-600 transition-colors" />
                  </motion.div>
                </Link>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <UserCircleIcon className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-semibold text-gray-800">{user?.firstName}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

