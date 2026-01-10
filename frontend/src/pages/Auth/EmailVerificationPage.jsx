import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { authService } from '../../services/auth.service';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    if (token) {
      authService.verifyEmail({ token })
        .then(() => {
          setStatus('success');
          setMessage('Email verified successfully! You can now login.');
        })
        .catch((error) => {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
        });
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [token]);
  
  if (status === 'verifying') {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button onClick={() => navigate('/login')} className="w-full">
          Go to Login
        </Button>
      </div>
    </Card>
  );
};

export default EmailVerificationPage;











