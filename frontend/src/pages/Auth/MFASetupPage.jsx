import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';

const MFASetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('setup'); // setup, verify, success
  const [mfaData, setMfaData] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  
  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await authService.setupMFA();
      setMfaData(response.data);
      setStep('verify');
    } catch (error) {
      console.error('MFA setup error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async () => {
    if (code.length !== 6) return;
    
    setLoading(true);
    try {
      const response = await authService.verifyMFA({ code });
      if (response.data.backupCodes) {
        setBackupCodes(response.data.backupCodes);
        setStep('success');
      } else {
        navigate('/dashboard/settings');
      }
    } catch (error) {
      console.error('MFA verify error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (step === 'setup') {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup MFA</h1>
          <p className="text-gray-600">Enable two-factor authentication for added security</p>
        </div>
        <Button onClick={handleSetup} loading={loading} className="w-full">
          Start Setup
        </Button>
      </Card>
    );
  }
  
  if (step === 'verify') {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan QR Code</h1>
          <p className="text-gray-600 mb-4">Use your authenticator app to scan this code</p>
          {mfaData?.qrCode && (
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={mfaData.qrCode} size={200} />
            </div>
          )}
          {mfaData?.manualEntryKey && (
            <p className="text-sm text-gray-500 mb-4">
              Manual entry: <code className="bg-gray-100 px-2 py-1 rounded">{mfaData.manualEntryKey}</code>
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          <Input
            label="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="000000"
          />
          <Button onClick={handleVerify} loading={loading} disabled={code.length !== 6} className="w-full">
            Verify & Enable
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MFA Enabled!</h1>
        <p className="text-gray-600 mb-4">Save these backup codes in a safe place</p>
        {backupCodes.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <ul className="space-y-2 text-left">
              {backupCodes.map((code, index) => (
                <li key={index} className="font-mono text-sm">{code}</li>
              ))}
            </ul>
          </div>
        )}
        <Button onClick={() => navigate('/dashboard/settings')} className="w-full">
          Continue
        </Button>
      </div>
    </Card>
  );
};

export default MFASetupPage;

