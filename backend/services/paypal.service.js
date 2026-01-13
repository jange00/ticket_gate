const axios = require('axios');
const env = require('../config/env');

class PayPalService {
  constructor() {
    this.clientId = env.PAYPAL_CLIENT_ID;
    this.clientSecret = env.PAYPAL_CLIENT_SECRET;
    this.mode = env.PAYPAL_MODE || 'sandbox';
    this.baseUrl = env.PAYPAL_API_BASE_URL || (this.mode === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com');
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Validate credentials are set
    if (!this.clientId || !this.clientSecret) {
      console.error('PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file');
    }
  }

  /**
   * Get OAuth 2.0 access token from PayPal
   */
  async getAccessToken() {
    // Validate credentials are set
    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file');
    }
    
    // Return cached token if still valid (with 5 minute buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in response.data.expires_in seconds (usually 32400 = 9 hours)
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('PayPal OAuth error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error_description || error.response?.data?.error || error.message;
      throw new Error(`PayPal authentication failed: ${errorMsg}`);
    }
  }

  /**
   * Create a PayPal order
   * @param {Object} orderData - Order data containing amount, currency, etc.
   */
  async createOrder(orderData) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: orderData.currency || 'USD',
                value: orderData.amount.toString()
              },
              description: orderData.description || 'Event Tickets',
              custom_id: orderData.customId || orderData.purchaseId,
            }
          ],
          application_context: {
            brand_name: orderData.brandName || 'TicketGate',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: orderData.returnUrl,
            cancel_url: orderData.cancelUrl,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'PayPal-Request-Id': orderData.requestId || `${orderData.purchaseId}-${Date.now()}`,
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('PayPal create order error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create PayPal order');
    }
  }

  /**
   * Capture a PayPal order payment
   * @param {String} orderId - PayPal order ID
   */
  async captureOrder(orderId) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('PayPal capture order error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to capture PayPal order');
    }
  }

  /**
   * Get order details
   * @param {String} orderId - PayPal order ID
   */
  async getOrder(orderId) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('PayPal get order error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get PayPal order');
    }
  }
}

module.exports = new PayPalService();
