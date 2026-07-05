const candidateImportService = require('../services/candidateImport.service');

/**
 * Handle CSV import of candidates
 * POST /api/candidates/import
 */
exports.importCandidates = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const result = await candidateImportService.importCandidates(req.file.buffer, req.user._id);
    return res.json(result);
  } catch (err) {
    // If there's a CSV format or missing header error, return 400 Bad Request
    if (err.message.includes('headers') || err.message.includes('CSV')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};
