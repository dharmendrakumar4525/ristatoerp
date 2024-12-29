const express = require('express');
const jwt = require('jsonwebtoken');
const https = require('https');

const app = express();
app.use(express.json());

// Your API Key and Secret Key
const apiKey = '8d3b20c0-296d-4e50-926b-1da264da401e';
const secretKey = 'qkCOlbB8C-drun-3XjhqV0r93I0YPFxU2oMfyNMNAos';

// Utility to generate JWT token
const generateToken = () => {
  const tokenCreationTime = Math.floor(Date.now() / 1000);
  const payload = {
    iss: apiKey,
    iat: tokenCreationTime,
  };
  return jwt.sign(payload, secretKey);
};
const token = generateToken();

// API to fetch sales data
app.post('/fetch-sales-summary', (req, res) => {
  const { branch, period } = req.body;

  if (!branch || !period) {
    return res.status(400).json({ error: 'Branch and period are required!' });
  }
  const token = generateToken();


  const options = {
    hostname: 'api.ristaapps.com',
    path: `/v1/analytics/sales/summary?branch=${branch}&period=${period}`,
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'x-api-token': token,
      'Content-Type': 'application/json',
    },
  };

  const apiRequest = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      if (apiRes.statusCode === 200) {
        res.json({ data: JSON.parse(data) });
      } else {
        res.status(apiRes.statusCode).json({
          error: `API Error: ${data}`,
        });
      }
    });
  });

  apiRequest.on('error', (e) => {
    res.status(500).json({ error: `Request error: ${e.message}` });
  });

  apiRequest.end();
});

const branchApi = {
    
    host: 'api.ristaapps.com',
    path: '/v1/branch/list',
    headers: {
      'x-api-key': apiKey,
      'x-api-token': token,
      'content-type': 'application/json'
    }
  };
  
  // Make the HTTPS GET request
  https.get(branchApi, function (res) {
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
  
  

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
