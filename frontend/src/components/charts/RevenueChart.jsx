// RevenueChart component - works with or without recharts
const RevenueChart = ({ data = [], className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
  
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  // Fallback visualization using pure CSS (works without recharts)
  return (
    <div className={`${className}`}>
      <div className="h-64 flex flex-col justify-end">
        <div className="grid grid-cols-6 gap-2 h-full items-end">
          {data.map((item, index) => {
            const percentage = (item.revenue / maxRevenue) * 100;
            return (
              <div key={index} className="flex flex-col items-center group">
                <div className="relative w-full flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-600 rounded-t-lg transition-all duration-500 hover:from-orange-600 hover:to-orange-700 cursor-pointer shadow-lg"
                    style={{ height: `${Math.max(percentage, 5)}%` }}
                    title={`${item.name}: NPR ${item.revenue.toLocaleString()}`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      NPR {item.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center font-medium">
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Revenue</span>
          <span className="font-semibold text-orange-600">
            NPR {data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
