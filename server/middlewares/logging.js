const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Middleware to log incoming HTTP requests and responses
 */
const requestLogger = (req, res, next) => {
  // Extract or generate requestId
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    // Log request parameters
    logger.info(message, {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      responseTime: duration
    });
  });

  next();
};

module.exports = requestLogger;
