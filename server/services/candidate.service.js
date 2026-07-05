const Candidate = require('../models/candidate');
const { sendEmail } = require('./email.service');
const { candidateCreatedTemplate, candidateStatusUpdatedTemplate } = require('./emailTemplates');

/**
 * Creates a new candidate
 * @param {Object} candidateData 
 * @returns {Promise<Object>}
 */
const createCandidate = async (candidateData) => {
  const candidate = await Candidate.create(candidateData);
  
  // Trigger application received email asynchronously (fire-and-forget)
  sendEmail({
    to: candidate.email,
    subject: 'Application Received',
    html: candidateCreatedTemplate({ name: candidate.name, email: candidate.email })
  });

  return candidate;
};

/**
 * Retrieves a candidate by ID, populated with creator info
 * @param {String} id 
 * @returns {Promise<Object|null>}
 */
const getCandidateById = async (id) => {
  return await Candidate.findById(id).populate('createdBy', 'name email role');
};

/**
 * Updates a candidate by ID
 * @param {String} id 
 * @param {Object} updateData 
 * @returns {Promise<Object|null>}
 */
const updateCandidate = async (id, updateData) => {
  const updatedCandidate = await Candidate.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email role');

  // Trigger status update email asynchronously (fire-and-forget) if status was updated
  if (updatedCandidate && updateData.status) {
    sendEmail({
      to: updatedCandidate.email,
      subject: 'Application Status Update',
      html: candidateStatusUpdatedTemplate({ name: updatedCandidate.name, status: updatedCandidate.status })
    });
  }

  return updatedCandidate;
};

/**
 * Deletes a candidate by ID
 * @param {String} id 
 * @returns {Promise<Object|null>}
 */
const deleteCandidate = async (id) => {
  return await Candidate.findByIdAndDelete(id);
};

/**
 * Lists candidates with advanced querying (text search, status, experience range, sorting, and pagination)
 * @param {Object} options 
 * @returns {Promise<Object>} Paginated response containing totalRecords, totalPages, currentPage, and data
 */
const listCandidates = async (options = {}) => {
  const {
    q,
    status,
    minExp,
    maxExp,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = options;

  const filter = {};

  // 1. Text search (case-insensitive) across name, email, and skills
  if (q) {
    const searchRegex = { $regex: String(q), $options: 'i' };
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { skills: searchRegex }
    ];
  }

  // 2. Filtering by status
  if (status) {
    filter.status = status;
  }

  // 3. Filtering by experience range using minExp and maxExp
  if (minExp !== undefined || maxExp !== undefined) {
    filter.experience = {};
    if (minExp !== undefined && minExp !== '') {
      filter.experience.$gte = Number(minExp);
    }
    if (maxExp !== undefined && maxExp !== '') {
      filter.experience.$lte = Number(maxExp);
    }
    if (Object.keys(filter.experience).length === 0) {
      delete filter.experience;
    }
  }

  // 4. Sorting by createdAt or experience (default: createdAt desc)
  const sortField = ['createdAt', 'experience'].includes(sortBy) ? sortBy : 'createdAt';
  const sortDir = sortOrder === 'asc' ? 1 : -1;
  const sortOption = { [sortField]: sortDir };

  // 5. Pagination using page and limit (default page=1, limit=10)
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [data, totalRecords] = await Promise.all([
    Candidate.find(filter)
      .populate('createdBy', 'name email role')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Candidate.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalRecords / limitNum);

  return {
    totalRecords,
    totalPages,
    currentPage: pageNum,
    data
  };
};

module.exports = {
  createCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  listCandidates
};
