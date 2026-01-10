import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PasswordStrengthMeter = ({ password }) => {
  const { score, strength, feedback } = usePasswordStrength(password);
  
  if (!password) return null;
  
  const getColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getStrengthText = () => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Fair';
    return 'Weak';
  };
  
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Password Strength:</span>
        <span className={`font-semibold ${
          score >= 80 ? 'text-green-600' :
          score >= 60 ? 'text-yellow-600' :
          score >= 40 ? 'text-orange-600' :
          'text-red-600'
        }`}>
          {getStrengthText()} ({score})
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      
      {/* Requirements checklist */}
      <div className="space-y-1">
        {feedback.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {item.met ? (
              <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <XMarkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            <span className={item.met ? 'text-gray-700' : 'text-gray-500'}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;








