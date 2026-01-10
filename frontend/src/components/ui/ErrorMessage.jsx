import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <div className={`flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 ${className}`}>
      <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default ErrorMessage;










