const axios = require('axios');

const baseUrl = 'https://rc.esewa.com.np';
const paths = [
  '/epay/main',
  '/api/epay/main/v2/form',
  '/api/epay/main/v1/form',
];

async function scanRc() {
  console.log(`Scanning https://rc.esewa.com.np...`);
  
  for (const path of paths) {
    try {
      const url = baseUrl + path;
      console.log(`\nTesting: ${url}`);
      const res = await axios.get(url, { validateStatus: () => true, timeout: 5000 });
      console.log(`Result: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
}

scanRc();
