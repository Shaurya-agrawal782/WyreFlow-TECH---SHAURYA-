const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middlewares/auth');
const { importCandidates } = require('../controllers/candidateImport.controller');
const { importLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Setup multer memory storage with 10MB limit and CSV filter
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
    if (isCsv) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/candidates/import (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  importLimiter,
  upload.single('file'),
  // Inline error handler for multer uploads (e.g. file too large or wrong type)
  (err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message.includes('allowed') || err.message.includes('limit')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  },
  importCandidates
);

module.exports = router;
