const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-200 animate-pulse rounded',
    text: 'bg-gray-200 animate-pulse rounded h-4',
    circle: 'bg-gray-200 animate-pulse rounded-full',
    card: 'bg-gray-200 animate-pulse rounded-2xl',
  };
  
  return <div className={`${variants[variant]} ${className}`} />;
};

export default Skeleton;












