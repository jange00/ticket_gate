import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import { 
  HomeIcon, 
  CalendarIcon,
  ChartBarIcon,
  TicketIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const OrganizerLayout = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/organizer/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/organizer/events', label: 'My Events', icon: CalendarIcon },
    { path: '/organizer/analytics', label: 'Analytics', icon: ChartBarIcon },
    { path: '/organizer/sales', label: 'Sales Reports', icon: TicketIcon },
    { path: '/organizer/refunds', label: 'Refunds', icon: TicketIcon },
    { path: '/organizer/settings', label: 'Settings', icon: Cog6ToothIcon },
  ];
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
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
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrganizerLayout;

