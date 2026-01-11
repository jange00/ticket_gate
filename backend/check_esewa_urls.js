const axios = require('axios');

const urls = [
  'https://rc.esewa.com.np/epay/main',
  'https://uat.esewa.com.np/epay/main',
  'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  'https://epay.esewa.com.np/api/epay/main/v2/form',
  'https://esewa.com.np/epay/main' // Prod
];

async function checkUrls() {
  console.log('Checking eSewa URLs...');
  
  for (const url of urls) {
    try {
      console.log(`\nTesting: ${url}`);
      // Using GET for reachability, though these are typically POST endpoints. 
      // A 405 Method Not Allowed is a SUCCESS for reachability (server is there).
      // A 404 means the path is wrong.
      // A Network Error means DNS/Down.
      const res = await axios.get(url, { validateStatus: () => true, timeout: 5000 });
      console.log(`Result: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
}

checkUrls();
