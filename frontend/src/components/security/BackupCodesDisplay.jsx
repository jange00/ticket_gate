import Card from '../ui/Card';
import Button from '../ui/Button';
import { useState } from 'react';

const BackupCodesDisplay = ({ codes, onDownload }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup Codes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Save these codes in a safe place. You can use them to access your account if you lose your device.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
          {codes.map((code, index) => (
            <li key={index} className="text-gray-900">{code}</li>
          ))}
        </ul>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCopy} className="flex-1">
          {copied ? 'Copied!' : 'Copy Codes'}
        </Button>
        {onDownload && (
          <Button variant="outline" onClick={onDownload} className="flex-1">
            Download
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BackupCodesDisplay;









