const { logger } = require('../utils/logger');

const requestLogger = (req, res, next) => {
  // Clone the request body and headers to avoid modification
  const requestBody = JSON.parse(JSON.stringify(req.body || {}));
  
  // Mask sensitive data in passwords
  if (requestBody.password) {
    requestBody.password = '[MASKED]';
  }
  if (requestBody.currentPassword) {
    requestBody.currentPassword = '[MASKED]';
  }
  if (requestBody.newPassword) {
    requestBody.newPassword = '[MASKED]';
  }

  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: requestBody,
    query: req.query,
    params: req.params,
    ip: req.ip
  };

  logger.info('Incoming Request', logData);
  next();
};

module.exports = requestLogger;