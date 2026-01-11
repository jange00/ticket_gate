const axios = require('axios');

const baseUrl = 'https://rc-epay.esewa.com.np';
const paths = [
  '/',
  '/epay/main',
  '/api/epay/main/v2/form',
  '/api/epay/main/v1/form',
  '/api/epay/transaction/status',
  '/health'
];

async function scanPaths() {
  console.log(`Scanning paths on ${baseUrl}...`);
  
  for (const path of paths) {
    try {
      const url = baseUrl + path;
      console.log(`\nTesting: ${url}`);
      // Timeout 5000ms
      const res = await axios.get(url, { validateStatus: () => true, timeout: 5000 });
      console.log(`Result: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
}

scanPaths();
