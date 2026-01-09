import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  className = '',
  showPageNumbers = true 
}) => {
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`
            px-4 py-2 rounded-lg border border-gray-300 
            ${currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600'
            }
            transition-colors
          `}
          whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
          whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
        >
          <FiChevronLeft className="w-5 h-5" />
        </motion.button>
        
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {startPage > 1 && (
              <>
                <PageButton page={1} currentPage={currentPage} onPageChange={onPageChange} />
                {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
              </>
            )}
            
            {pages.map((page) => (
              <PageButton
                key={page}
                page={page}
                currentPage={currentPage}
                onPageChange={onPageChange}
              />
            ))}
            
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
                <PageButton page={totalPages} currentPage={currentPage} onPageChange={onPageChange} />
              </>
            )}
          </div>
        )}
        
        <motion.button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`
            px-4 py-2 rounded-lg border border-gray-300 
            ${currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600'
            }
            transition-colors
          `}
          whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
          whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
        >
          <FiChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
      
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

const PageButton = ({ page, currentPage, onPageChange }) => {
  const isActive = page === currentPage;
  
  return (
    <motion.button
      onClick={() => onPageChange(page)}
      className={`
        w-10 h-10 rounded-lg font-medium transition-colors
        ${isActive
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600'
        }
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {page}
    </motion.button>
  );
};

export default Pagination;





