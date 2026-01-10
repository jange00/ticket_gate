export const paymentService = {
  redirectToEsewa: (paymentUrl) => {
    if (!paymentUrl) {
      throw new Error('Payment URL is required');
    }
    window.location.href = paymentUrl;
  },
  
  handlePaymentCallback: (searchParams) => {
    // Handle eSewa payment callback
    // This would typically parse the callback parameters
    const params = new URLSearchParams(searchParams);
    return {
      success: params.get('status') === 'success',
      transactionId: params.get('transaction_id'),
      amount: params.get('amount'),
      message: params.get('message'),
    };
  },
};










