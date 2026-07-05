const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

// Production format is JSON, Development format is colored text
const format = isProduction
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `[${info.timestamp}] [${info.level}]${info.requestId ? ` [reqId:${info.requestId}]` : ''}: ${info.message}`
      )
    );

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format,
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;
