import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Input from '../ui/Input';

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  showStrengthMeter = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          label={label}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          placeholder={placeholder}
          required={required}
          className="pr-12"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          style={{ marginTop: label ? '12px' : '0' }}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;









