import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: HomeIcon },
    { path: '/admin/users', label: 'Users', icon: UsersIcon },
    { path: '/admin/events', label: 'Events', icon: CalendarIcon },
    { path: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
    { path: '/admin/refunds', label: 'Refunds', icon: CurrencyDollarIcon },
    { path: '/admin/payments', label: 'Payments', icon: CreditCardIcon },
    { path: '/admin/activity-logs', label: 'Activity Logs', icon: DocumentTextIcon },
  ];
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Portal</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path === '/admin' && location.pathname === '/admin/dashboard');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

