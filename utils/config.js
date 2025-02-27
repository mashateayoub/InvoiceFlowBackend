const dotenv = require('dotenv');
const path = require('path');

const loadEnvFile = () => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    dotenv.config({ path: path.join(__dirname, '../prod.env') });
  } else {
    dotenv.config({ path: path.join(__dirname, '../dev.env') });
  }
};



const getEnvironmentConfig = () => {
  // Load the appropriate .env file
  loadEnvFile();
  const env = process.env.NODE_ENV;
  const configs = {
    development: {
      mongoUri: process.env.MONGODB_URI,
      port: process.env.PORT,
      jwtSecret: process.env.JWT_SECRET,
      logLevel: 'debug'
    },
    production: {
      mongoUri: process.env.MONGODB_URI,
      port: process.env.PORT,
      jwtSecret: process.env.JWT_SECRET,
      logLevel: 'debug'
    },
    test: {
      mongoUri: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/test-invoice-flow',
      port: process.env.TEST_PORT || 5001,
      jwtSecret: 'test_secret_key',
      logLevel: 'error'
    }
  };

  return configs[env];
};

module.exports = getEnvironmentConfig();