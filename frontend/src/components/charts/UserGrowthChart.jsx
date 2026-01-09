let rechartsAvailable = false;
let BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer;

try {
  const recharts = require('recharts');
  BarChart = recharts.BarChart;
  Bar = recharts.Bar;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
  ResponsiveContainer = recharts.ResponsiveContainer;
  rechartsAvailable = true;
} catch (e) {
  rechartsAvailable = false;
}

const UserGrowthChart = ({ data = [], className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  if (!rechartsAvailable) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-300 ${className}`}>
        <p className="text-blue-600 font-semibold mb-2">Chart Library Not Installed</p>
        <p className="text-sm text-blue-700 text-center px-4">
          Please run: <code className="bg-blue-200 px-2 py-1 rounded">npm install recharts</code>
        </p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserGrowthChart;

