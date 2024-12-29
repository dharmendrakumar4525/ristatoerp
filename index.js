const jwt = require('jsonwebtoken');
const https = require('https');

// Your API Key and Secret Key
const apiKey = '8d3b20c0-296d-4e50-926b-1da264da401e';
const secretKey = 'qkCOlbB8C-drun-3XjhqV0r93I0YPFxU2oMfyNMNAos';

// Generate the current time in seconds since the Unix Epoch
const tokenCreationTime = Math.floor(Date.now() / 1000);

// Create the payload with the API key and the issued-at time
const payload = {
  iss: apiKey,
  iat: tokenCreationTime
};

// Generate the JWT token with the payload and secret key using HS256 (default)
const token = jwt.sign(payload, secretKey);
console.log(token,"tkm")

const options = {
  host: 'api.ristaapps.com',
  path: '/v1/branch/list',
  headers: {
    'x-api-key': apiKey,
    'x-api-token': token,
    'content-type': 'application/json'
  }
};

// Make the HTTPS GET request
https.get(options, function (res) {
  let data = '';

  // Listen for data
  res.on('data', (chunk) => {
    data += chunk;
  });

  // End of response
  res.on('end', () => {
    console.log('Response:', data);
  });
}).on('error', (e) => {
  console.error('Error:', e);
});

