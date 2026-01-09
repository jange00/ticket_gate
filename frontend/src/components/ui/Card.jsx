import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-2xl shadow-soft border border-gray-100 transition-all duration-300';
  const hoverStyles = hover ? 'hover:shadow-xl hover:border-orange-200 cursor-pointer' : '';
  
  const cardClasses = `${baseStyles} ${hoverStyles} ${className}`;
  
  if (hover || onClick) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        whileHover={hover ? { y: -4 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;

