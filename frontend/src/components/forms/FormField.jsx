import Input from '../ui/Input';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  component: Component = Input,
  ...props
}) => {
  const showError = error && touched;
  
  return (
    <Component
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={showError ? error : undefined}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      {...props}
    />
  );
};

export default FormField;











