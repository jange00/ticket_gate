import Input from '../ui/Input';

const DatePicker = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  ...props
}) => {
  return (
    <Input
      type="datetime-local"
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      {...props}
    />
  );
};

export default DatePicker;









