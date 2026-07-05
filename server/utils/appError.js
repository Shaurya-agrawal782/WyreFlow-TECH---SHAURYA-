class AppError extends Error {
  /**
   * @param {String} message Error message
   * @param {Number} statusCode HTTP status code (e.g. 400, 404, 401, 500)
   * @param {String} errorCode Custom error code string for API clients
   */
  constructor(message, statusCode, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
