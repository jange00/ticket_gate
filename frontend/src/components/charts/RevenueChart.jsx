// RevenueChart component - works with or without recharts
const RevenueChart = ({ data = [], className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }
  
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1); // Avoid division by zero
  
  // Fallback visualization using pure CSS (works without recharts)
  return (
    <div className={`${className}`}>
      <div className="h-64 flex flex-col justify-end pb-4">
        <div className="grid grid-cols-6 gap-3 h-full items-end">
          {data.map((item, index) => {
            const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={index} className="flex flex-col items-center group relative">
                <div className="relative w-full flex flex-col items-center h-full">
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                    {item.name}: NPR {item.revenue.toLocaleString()}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  
                  {/* Bar */}
                  <div 
                    className="w-full bg-gradient-to-t from-orange-600 via-orange-500 to-orange-400 rounded-t-xl transition-all duration-500 hover:from-orange-700 hover:via-orange-600 hover:to-orange-500 cursor-pointer shadow-lg hover:shadow-2xl relative overflow-hidden group/bar"
                    style={{ height: `${Math.max(percentage, 3)}%`, minHeight: percentage > 0 ? '20px' : '0px' }}
                    title={`${item.name}: NPR ${item.revenue.toLocaleString()}`}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Value label on bar (if bar is tall enough) */}
                    {percentage > 15 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-bold drop-shadow-lg">
                          {item.revenue > 0 ? `NPR ${(item.revenue / 1000).toFixed(0)}k` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Month label */}
                <div className="mt-3 text-xs text-gray-700 dark:text-gray-300 text-center font-semibold">
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Chart Total</span>
          <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            NPR {data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
