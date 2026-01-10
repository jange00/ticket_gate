import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UsersIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  TicketIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  
  // Fetch statistics
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: async () => {
      const response = await adminApi.getStatistics();
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const stats = statsData?.data || {};

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading statistics. Please try again later.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers?.toLocaleString() || '0',
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: stats.userGrowth ? `+${stats.userGrowth[stats.userGrowth.length - 1]?.growth || 0}%` : null,
    },
    {
      title: 'Total Events',
      value: stats.totalEvents?.toLocaleString() || '0',
      icon: CalendarIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Revenue',
      value: `NPR ${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Tickets Sold',
      value: stats.totalTicketsSold?.toLocaleString() || '0',
      icon: TicketIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's an overview of your platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart Section */}
      {stats.revenueByMonth && stats.revenueByMonth.length > 0 && (
        <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Revenue Overview
            </h2>
          </div>
          <div className="space-y-3">
            {stats.revenueByMonth.slice(-6).map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${(month.revenue / (stats.totalRevenue || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-24 text-right">
                    NPR {month.revenue?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Growth Chart */}
      {stats.userGrowth && stats.userGrowth.length > 0 && (
        <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
              User Growth
            </h2>
          </div>
          <div className="space-y-3">
            {stats.userGrowth.slice(-6).map((growth, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(growth.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min((growth.count / (stats.totalUsers || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-24 text-right">
                    {growth.count?.toLocaleString() || '0'} users
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <UsersIcon className="h-6 w-6 text-orange-500 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Manage Users</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all users</p>
          </a>
          <a
            href="/admin/activity-logs"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChartBarIcon className="h-6 w-6 text-orange-500 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">Activity Logs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor system activity</p>
          </a>
          <a
            href="/events"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <CalendarIcon className="h-6 w-6 text-orange-500 mb-2" />
            <h3 className="font-medium text-gray-900 dark:text-white">View Events</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Browse all events</p>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
