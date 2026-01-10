import Input from '../ui/Input';

const MFACodeInput = ({ value, onChange, error, ...props }) => {
  const handleChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(input);
  };
  
  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        error={error}
        placeholder="000000"
        maxLength={6}
        className="text-center text-2xl tracking-widest font-mono"
        {...props}
      />
      <p className="text-sm text-gray-500 text-center">Enter the 6-digit code from your authenticator app</p>
    </div>
  );
};

export default MFACodeInput;












