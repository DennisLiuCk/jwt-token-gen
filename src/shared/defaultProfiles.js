const { v4: uuidv4 } = require('uuid');

const defaultProfiles = [
  {
    id: uuidv4(),
    name: 'Dev Environment Admin',
    algorithm: 'HS256',
    encryptedKey: '', // User must enter key
    payload: {
      userId: 'admin001',
      username: 'Admin User',
      email: 'admin@example.com',
      roleCode: 'ADMIN'
    },
    expirationPreset: '1h',
    customExpiration: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Hybris Merchant Admin',
    algorithm: 'HS256',
    encryptedKey: '', // User must enter key
    payload: {
      userId: 'merchant001',
      username: 'Merchant Admin',
      email: 'merchant@example.com',
      roleCode: 'MERCHANT_ADMIN',
      merchantId: 'M001'
    },
    expirationPreset: '1d',
    customExpiration: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'OpenAPI Profile',
    algorithm: 'RS256',
    encryptedKey: '', // User must enter key
    payload: {
      sub: 'api-client-001',
      apiKey: 'placeholder-api-key'
    },
    expirationPreset: '1w',
    customExpiration: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = defaultProfiles;
