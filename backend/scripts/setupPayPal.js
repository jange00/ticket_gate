const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// PayPal credentials
const paypalConfig = `
# PayPal Payment Gateway Configuration
PAYPAL_CLIENT_ID=AcnpbvL-nqay69eboBK-a2hcQLnkFTQZXbTF0f4UafVwhRYAXe11Z0B3PtFyWCTDH24INY6Cu2U0rhRC
PAYPAL_CLIENT_SECRET=EGZXWncK71BKAfqH7ClPpldekK6kSKvO9yIk0Loz36CkdM7uLC_vuE5mjbGjRhJhBT5BeOYyBB-_p6WW
PAYPAL_MODE=sandbox
PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com
`;

try {
  // Check if .env file exists
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if PayPal config already exists
    if (envContent.includes('PAYPAL_CLIENT_ID')) {
      console.log('⚠️  PayPal credentials already exist in .env file');
      console.log('Please manually update them or remove the old entries first');
      process.exit(1);
    }
  }
  
  // Append PayPal config to .env file
  fs.appendFileSync(envPath, paypalConfig, 'utf8');
  
  console.log('✅ PayPal credentials have been added to .env file successfully!');
  console.log('📌 Please restart your backend server for the changes to take effect.');
  console.log('   (Stop the server with Ctrl+C, then start it again)');
  
} catch (error) {
  console.error('❌ Error adding PayPal credentials:', error.message);
  console.log('\n📝 Manual setup:');
  console.log('Please open backend/.env file and add these lines:');
  console.log(paypalConfig);
  process.exit(1);
}
