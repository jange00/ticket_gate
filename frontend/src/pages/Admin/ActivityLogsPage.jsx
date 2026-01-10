import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { ACTIVITY_TYPES } from '../../utils/constants';

const ActivityLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Fetch activity logs
  const { data: logsData, isLoading, error } = useQuery({
    queryKey: ['admin-activity-logs', page, limit, searchTerm, activityTypeFilter, userIdFilter],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(activityTypeFilter && { activityType: activityTypeFilter }),
        ...(userIdFilter && { userId: userIdFilter }),
      };
      const response = await adminApi.getActivityLogs(params);
      return response.data;
    },
  });

  const logs = logsData?.data?.logs || [];
  const pagination = logsData?.data?.pagination || {};

  const getActivityTypeColor = (type) => {
    if (type?.includes('FAILED') || type?.includes('ERROR')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    if (type?.includes('SUCCESS') || type?.includes('CREATED') || type?.includes('PURCHASED')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (type?.includes('LOGIN') || type?.includes('LOGOUT')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading activity logs. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor all system activities and user actions
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Activity Type Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={activityTypeFilter}
              onChange={(e) => {
                setActivityTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Activity Types</option>
              {Object.values(ACTIVITY_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* User ID Filter */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by User ID..."
              value={userIdFilter}
              onChange={(e) => {
                setUserIdFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Activity Logs Table */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activity Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivityTypeColor(log.activityType)}`}>
                        {log.activityType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {log.userId ? (
                          typeof log.userId === 'string' ? (
                            <div>
                              <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                                {log.userId}
                              </div>
                            </div>
                          ) : log.userId._id ? (
                            <div>
                              <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                                {log.userId._id}
                              </div>
                              {log.userId.email && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {log.userId.email}
                                </div>
                              )}
                              {log.userId.firstName && (
                                <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                                  {log.userId.firstName} {log.userId.lastName}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                              {String(log.userId)}
                            </div>
                          )
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 italic">System</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {log.details || log.metadata ? (
                          <details className="cursor-pointer">
                            <summary className="text-orange-600 dark:text-orange-400 hover:underline">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-auto">
                              {JSON.stringify(log.details || log.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          'No details'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {log.ipAddress || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} logs
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityLogsPage;
