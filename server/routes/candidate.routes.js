const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate
} = require('../controllers/candidate.controller');

const router = express.Router();

// POST /api/candidates - Admin and Recruiter only
router.post('/', protect, authorize('admin', 'recruiter'), createCandidate);

// GET /api/candidates - All authenticated users
router.get('/', protect, getCandidates);

// GET /api/candidates/:id - All authenticated users
router.get('/:id', protect, getCandidateById);

// PUT /api/candidates/:id - Admin and Recruiter only
router.put('/:id', protect, authorize('admin', 'recruiter'), updateCandidate);

// DELETE /api/candidates/:id - Admin only
router.delete('/:id', protect, authorize('admin'), deleteCandidate);

module.exports = router;
