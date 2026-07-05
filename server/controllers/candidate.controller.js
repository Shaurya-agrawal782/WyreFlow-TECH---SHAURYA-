const Candidate = require('../models/candidate');
const candidateService = require('../services/candidate.service');

/**
 * Create a new candidate
 * POST /api/candidates
 */
exports.createCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, experience, skills, resumeUrl, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const exists = await Candidate.findOne({ email: emailLower });
    if (exists) {
      return res.status(400).json({ message: 'Candidate with this email already exists' });
    }

    let skillsArray = [];
    if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(skills)) {
      skillsArray = skills.map(s => s.trim()).filter(Boolean);
    }

    const candidate = await candidateService.createCandidate({
      name,
      email: emailLower,
      phone,
      experience,
      skills: skillsArray,
      resumeUrl,
      status,
      createdBy: req.user._id
    });

    return res.status(201).json(candidate);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all candidates
 * GET /api/candidates
 */
exports.getCandidates = async (req, res, next) => {
  try {
    const { q, status, minExp, maxExp, sortBy, sortOrder, page, limit } = req.query;
    const result = await candidateService.listCandidates({
      q,
      status,
      minExp,
      maxExp,
      sortBy,
      sortOrder,
      page,
      limit
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Get candidate by ID
 * GET /api/candidates/:id
 */
exports.getCandidateById = async (req, res, next) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    return res.json(candidate);
  } catch (err) {
    next(err);
  }
};

/**
 * Update candidate details
 * PUT /api/candidates/:id
 */
exports.updateCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, experience, skills, resumeUrl, status } = req.body;

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (experience !== undefined) updateData.experience = experience;
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
    if (status !== undefined) updateData.status = status;

    if (email !== undefined) {
      const emailLower = email.toLowerCase().trim();
      if (emailLower !== candidate.email) {
        const exists = await Candidate.findOne({ email: emailLower });
        if (exists) {
          return res.status(400).json({ message: 'Candidate with this email already exists' });
        }
      }
      updateData.email = emailLower;
    }

    if (skills !== undefined) {
      let skillsArray = [];
      if (typeof skills === 'string') {
        skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      } else if (Array.isArray(skills)) {
        skillsArray = skills.map(s => s.trim()).filter(Boolean);
      }
      updateData.skills = skillsArray;
    }

    const updatedCandidate = await candidateService.updateCandidate(req.params.id, updateData);
    return res.json(updatedCandidate);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete candidate
 * DELETE /api/candidates/:id
 */
exports.deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await candidateService.deleteCandidate(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    return res.json({ message: 'Candidate deleted' });
  } catch (err) {
    next(err);
  }
};
