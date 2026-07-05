const logger = require('../utils/logger');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.errorCode = err.errorCode || 'INTERNAL_ERROR';

  const isProduction = process.env.NODE_ENV === 'production';

  // Translate specific library errors
  // 1. Mongoose ValidationError
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.errorCode = 'VALIDATION_ERROR';
    err.message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // 2. Mongoose CastError (e.g. invalid object id)
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.errorCode = 'INVALID_ID';
    err.message = `Invalid value for ${err.path}`;
  }

  // 3. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    err.statusCode = 400;
    err.errorCode = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    err.message = `A record with this ${field} already exists.`;
  }

  // 4. MulterError
  if (err.name === 'MulterError') {
    err.statusCode = 400;
    err.errorCode = 'FILE_UPLOAD_ERROR';
  }

  // 5. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.errorCode = 'INVALID_TOKEN';
    err.message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.errorCode = 'TOKEN_EXPIRED';
    err.message = 'Your token has expired. Please log in again.';
  }

  // Log the complete error stack trace correlated with req.requestId
  logger.error(`${err.message} - ${err.stack}`, { requestId: req.requestId });

  if (isProduction) {
    return res.status(err.statusCode).json({
      status: err.statusCode === 500 ? 'error' : err.status || 'fail',
      errorCode: err.errorCode,
      message: err.statusCode === 500 ? 'Internal server error' : err.message
    });
  } else {
    return res.status(err.statusCode).json({
      status: err.status || 'error',
      errorCode: err.errorCode,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }
};

module.exports = globalErrorHandler;
