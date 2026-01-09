let rechartsAvailable = false;
let AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer;

try {
  const recharts = require('recharts');
  AreaChart = recharts.AreaChart;
  Area = recharts.Area;
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

const SalesChart = ({ data = [], className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  if (!rechartsAvailable) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-dashed border-green-300 ${className}`}>
        <p className="text-green-600 font-semibold mb-2">Chart Library Not Installed</p>
        <p className="text-sm text-green-700 text-center px-4">
          Please run: <code className="bg-green-200 px-2 py-1 rounded">npm install recharts</code>
        </p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="#f97316" 
            fillOpacity={1} 
            fill="url(#colorSales)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;

