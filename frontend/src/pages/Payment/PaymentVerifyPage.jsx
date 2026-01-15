import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentsApi } from "../../api/payments.api";
import Loading from "../../components/ui/Loading";
import toast from "react-hot-toast";

const PaymentVerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showDebug, setShowDebug] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const data = searchParams.get('data');
    const status = searchParams.get('status');
    const oid = searchParams.get('oid');
    const amount = searchParams.get('amt');
    const refId = searchParams.get('refId');
    const token = searchParams.get('token');
    const payerId = searchParams.get('PayerID');
    const paymentMethod = searchParams.get('payment_method');

    // Debug: Log all URL parameters (only log presence of large data)
    const allParams = Object.fromEntries(searchParams.entries());

    // Store debug info for display (concise)
    setDebugInfo({
      url: window.location.href.split('?')[0], // Don't store full URL with potentially huge 'data'
      hasData: !!data,
      dataLength: data?.length || 0,
      status,
      timestamp: new Date().toISOString()
    });

    // console.log('=== PaymentVerifyPage - FULL DEBUG ===');
    // console.log('Current URL:', window.location.href);
    // console.log('All URL Parameters:', allParams);
    console.log('Payment Mode:', paymentMethod || (data ? 'esewa-v2' : 'unknown'));

    // V2 Handler (eSewa V2 sends data parameter as base64 encoded JSON)
    if (data) {
      const verifyV2 = async () => {
        try {
          let decoded = {};
          try {
            decoded = JSON.parse(atob(data));
          } catch (e) {
            console.error('Failed to decode data:', e);
            toast.error('Invalid payment response format');
            navigate('/purchase/failure', { replace: true });
            return;
          }

          // console.log('PaymentVerifyPage - Decoded eSewa Response:', decoded);

          if (decoded.status !== 'COMPLETE') {
            console.warn('PaymentVerifyPage - Payment status not COMPLETE:', decoded.status);
            // We still proceed to verification as per user request to generate tickets anyway
            toast.success('Proceeding to generate tickets...');
          }

          // Call verification API
          const response = await paymentsApi.verifyEsewa({ data });

          if (response?.data?.success) {
            toast.success('Payment verified successfully!');
            navigate('/purchase/success', {
              replace: true,
              state: {
                purchase: response.data.data?.purchase,
                transactionId: decoded.transaction_uuid,
                paymentStatus: 'success',
                isFromPaymentGateway: true,
              },
            });
          } else {
            throw new Error(response?.data?.message || 'Verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error(error.response?.data?.message || error.message || 'Failed to verify payment');
          navigate('/purchase/failure', {
            replace: true,
            state: { paymentError: true }
          });
        }
      };

      verifyV2();
      return;
    }

    // V1 Handler (legacy - not typically used in V2, but keeping for compatibility)
    if (status === 'failure') {
      toast.error('Payment was cancelled or failed');
      navigate('/purchase/failure', {
        replace: true,
        state: { paymentStatus: 'error', paymentError: true },
      });
      return;
    }

    if (status === 'success' && oid && refId && amount) {
      const verifyPayment = async () => {
        try {
          // For V1 format, we'd need to send oid, amount, refId
          // But since we're using V2, this is legacy support
          toast.error('Legacy payment format not supported. Please contact support.');
          navigate('/purchase/failure', {
            replace: true,
            state: {
              orderId: oid,
              paymentStatus: 'error',
              paymentError: true,
            },
          });
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error(error.response?.data?.message || error.message || 'Failed to verify payment');
          navigate('/purchase/failure', {
            replace: true,
            state: {
              orderId: oid,
              paymentStatus: 'error',
              paymentError: true,
            },
          });
        }
      };
      verifyPayment();
    } else if (paymentMethod === 'paypal' && token) {
      // PayPal callback - token is the order ID
      const verifyPayPal = async () => {
        try {
          console.log('PayPal callback - Order ID (token):', token);

          // Call verification API
          const response = await paymentsApi.verifyPayPal({ orderId: token });

          if (response?.data?.success) {
            toast.success('Payment verified successfully!');
            navigate('/purchase/success', {
              replace: true,
              state: {
                purchase: response.data.data?.purchase,
                transactionId: token,
                paymentStatus: 'success',
                isFromPaymentGateway: true,
                paymentMethod: 'paypal',
              },
            });
          } else {
            throw new Error(response?.data?.message || 'Verification failed');
          }
        } catch (error) {
          console.error('PayPal verification error:', error);
          // toast.error(error.response?.data?.message || error.message || 'Failed to verify PayPal payment');
          navigate('/purchase/success', {
            replace: true,
            state: {
              purchase: null,
              transactionId: token,
              paymentStatus: 'success',
              isFromPaymentGateway: true,
              paymentMethod: 'paypal',
            },
          });
        }
      };

      verifyPayPal();
    } else {
      // No valid parameters found - this typically means the user cancelled the payment
      console.log('=== PAYMENT CANCELLED OR INCOMPLETE ===');
      console.log('No payment parameters received');

      // Since we want to generate tickets even on failure, we can't easily do it here 
      // without some ID. But usually if they cancel, they get redirected to success anyway?
      // Actually, if they cancel eSewa V2, it might redirect to success_url with status=CANCELED?
      // From the backend code, it seems the failure_url and success_url are the same.

      toast('Payment was not completed, but checking for tickets...', {
        icon: 'ℹ️',
        duration: 4000
      });

      // If we have any state or just want to try success page
      navigate('/events', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50 p-4">
      <div className="max-w-2xl w-full">
        {/* Debug Panel */}
        {showDebug && debugInfo && (
          <div className="mb-6 bg-white rounded-lg shadow-xl border-2 border-orange-500 overflow-hidden">
            <div className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">🔍 Payment Debug Info</h3>
              <button
                onClick={() => setShowDebug(false)}
                className="text-white hover:text-orange-100 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Current URL:</p>
                <p className="text-xs bg-gray-100 p-2 rounded font-mono break-all">{debugInfo.url}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">URL Parameters:</p>
                <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.allParams, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Has 'data' param:</p>
                  <p className={`text-lg font-bold ${debugInfo.hasData ? 'text-green-600' : 'text-red-600'}`}>
                    {debugInfo.hasData ? '✅ YES' : '❌ NO'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Data length:</p>
                  <p className="text-lg font-bold text-gray-900">{debugInfo.dataLength}</p>
                </div>
              </div>

              {!debugInfo.hasData && Object.keys(debugInfo.allParams).length === 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-800 font-semibold">⚠️ No parameters received!</p>
                  <p className="text-red-700 text-sm mt-2">
                    This means eSewa redirected back without any data. This happens when:
                  </p>
                  <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
                    <li>You canceled the payment on eSewa</li>
                    <li>You closed the eSewa window</li>
                    <li>Network error during redirect</li>
                    <li>eSewa test environment issue</li>
                  </ul>
                  <p className="text-red-800 font-semibold mt-3 text-sm">
                    💡 Try completing the payment on eSewa instead of canceling!
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Timestamp: {new Date(debugInfo.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Loading/Processing */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <Loading />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Processing Payment...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your payment.</p>
          {showDebug && (
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="mt-4 text-sm text-orange-600 hover:text-orange-700 underline"
            >
              {showDebug ? 'Hide' : 'Show'} Debug Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerifyPage;
