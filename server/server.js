const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const requestLogger = require('./middlewares/logging');
const globalErrorHandler = require('./middlewares/error');
const { generalLimiter } = require('./middlewares/rateLimiter');

dotenv.config();
connectDB();

const authRoutes = require('./routes/userRoute');
const jobRoutes = require('./routes/jobroute');
const applicationRoutes = require('./routes/applicationroute');
const candidateRoutes = require('./routes/candidate.routes');
const candidateImportRoutes = require('./routes/candidateImport.routes');

const app = express();

// Custom HTML escaping function to prevent XSS attacks
const cleanXSS = (val) => {
  if (typeof val === 'string') {
    return val
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (Array.isArray(val)) {
    return val.map(cleanXSS);
  }
  if (val && typeof val === 'object') {
    for (const k in val) {
      val[k] = cleanXSS(val[k]);
    }
  }
  return val;
};

// Security and request parsing middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Custom sanitization middleware to prevent NoSQL injection & XSS (Express 5 compatible)
app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
    req.body = cleanXSS(req.body);
  }
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params);
    req.params = cleanXSS(req.params);
  }
  next();
});

// Request logger (early in stack to capture all metrics)
app.use(requestLogger);

// Rate limiter (applied globally)
app.use(generalLimiter);

// Advanced health check endpoint
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/users',         authRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/candidates',    candidateRoutes);
app.use('/api/candidates/import', candidateImportRoutes);

// Fallback for non-existent routes
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Centralized error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database connection shutdown:', err);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
