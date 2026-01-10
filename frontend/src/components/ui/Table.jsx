import { motion } from 'framer-motion';

const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '' }) => {
  return (
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <tr>{children}</tr>
    </thead>
  );
};

const TableHeaderCell = ({ children, className = '', onClick, sortable = false }) => {
  return (
    <th
      onClick={onClick}
      className={`
        px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider
        ${sortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors' : ''}
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
      </div>
    </th>
  );
};

const TableBody = ({ children, className = '' }) => {
  return <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>;
};

const TableRow = ({ children, className = '', onClick, hover = true }) => {
  const baseClasses = hover ? 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer' : '';
  
  if (onClick) {
    return (
      <motion.tr
        onClick={onClick}
        className={`${baseClasses} ${className}`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {children}
      </motion.tr>
    );
  }
  
  return <tr className={`${baseClasses} ${className}`}>{children}</tr>;
};

const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${className}`}>
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.HeaderCell = TableHeaderCell;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;









