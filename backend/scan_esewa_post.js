const axios = require('axios');

const baseUrl = 'https://rc-epay.esewa.com.np';
const paths = [
  '/epay/main',
  '/api/epay/main/v2/form',
  '/api/epay/main/v1/form',
  '/api/epay/main/form',
  '/epay/transrec',
  '/api/epay/transaction/status'
];

async function scanPost() {
  console.log(`Scanning POST on ${baseUrl}...`);
  
  for (const path of paths) {
    try {
      const url = baseUrl + path;
      console.log(`\nTesting POST: ${url}`);
      // Send empty POST. 
      // 200 = OK (maybe logic error inside, but endpoint exists)
      // 400 = OK (Bad Request, meaning endpoint exists and validated input)
      // 405 = Method Not Allowed (Endpoint exists but not for POST, or maybe opposite)
      // 404 = Not Found (Dead)
      // 500 = Server Error (Alive)
      const res = await axios.post(url, {}, { validateStatus: () => true, timeout: 5000 });
      console.log(`Result: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
}

scanPost();
