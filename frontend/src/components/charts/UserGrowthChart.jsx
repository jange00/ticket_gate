import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const UserGrowthChart = ({ data = [], className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            className="dark:[&_text]:fill-gray-400"
          />
          <YAxis 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            className="dark:[&_text]:fill-gray-400"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            className="dark:!bg-gray-800 dark:!border-gray-700 dark:!text-white"
          />
          <Legend 
            wrapperStyle={{ color: '#6b7280' }}
            className="dark:[&_text]:fill-gray-400"
          />
          <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthChart;

