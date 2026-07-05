const readline = require('readline');
const { Readable } = require('stream');
const Candidate = require('../models/candidate');
const User = require('../models/user');
const { sendEmail } = require('./email.service');
const { csvImportSummaryTemplate } = require('./emailTemplates');

/**
 * Parses a CSV line safely supporting quotes and escaped quotes
 * @param {String} line 
 * @returns {Array<String>}
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Stream parses a CSV file buffer and validates the row data.
 * @param {Buffer} buffer 
 * @returns {Promise<Object>} Object containing parsed candidates, failures, and email set.
 */
const parseCSVBuffer = async (buffer) => {
  const stream = Readable.from(buffer.toString('utf-8'));
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let rowNumber = 0;
  let headers = null;
  
  const validCandidates = [];
  const failedRows = [];
  const emails = new Set();

  for await (const line of rl) {
    rowNumber++;
    if (!line.trim()) continue;

    const parsedLine = parseCSVLine(line).map(v => v.trim());

    if (!headers) {
      headers = parsedLine.map(h => h.toLowerCase());
      // Validate that crucial headers are present
      if (!headers.includes('name') || !headers.includes('email')) {
        throw new Error('CSV must contain "name" and "email" headers');
      }
      continue;
    }

    const name = headers.includes('name') ? parsedLine[headers.indexOf('name')] : '';
    const email = headers.includes('email') ? parsedLine[headers.indexOf('email')] : '';
    const phone = headers.includes('phone') ? parsedLine[headers.indexOf('phone')] : '';
    const experienceStr = headers.includes('experience') ? parsedLine[headers.indexOf('experience')] : '';
    const skillsStr = headers.includes('skills') ? parsedLine[headers.indexOf('skills')] : '';

    // Required fields check
    if (!name) {
      failedRows.push({ row: rowNumber, reason: 'Name is required' });
      continue;
    }

    if (!email) {
      failedRows.push({ row: rowNumber, reason: 'Email is required' });
      continue;
    }

    // Email format validation
    const emailLower = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      failedRows.push({ row: rowNumber, reason: 'Invalid email format' });
      continue;
    }

    // Experience validation
    let experience = 0;
    if (experienceStr) {
      experience = Number(experienceStr);
      if (isNaN(experience) || experience < 0) {
        failedRows.push({ row: rowNumber, reason: 'Experience must be a non-negative number' });
        continue;
      }
    }

    // Parse pipe-separated skills
    let skills = [];
    if (skillsStr) {
      skills = skillsStr.split('|').map(s => s.trim()).filter(Boolean);
    }

    // Batch duplicate check (prevent duplicate emails in the same CSV)
    if (emails.has(emailLower)) {
      failedRows.push({ row: rowNumber, reason: `Duplicate email within import file` });
      continue;
    }
    emails.add(emailLower);

    validCandidates.push({
      row: rowNumber,
      name,
      email: emailLower,
      phone,
      experience,
      skills
    });
  }

  return {
    validCandidates,
    failedRows,
    emails
  };
};

/**
 * Handles the imports of candidates from a CSV buffer
 * @param {Buffer} fileBuffer 
 * @param {String} userId 
 * @returns {Promise<Object>} Response detailing success count, total records, failures
 */
const importCandidates = async (fileBuffer, userId) => {
  const { validCandidates, failedRows, emails } = await parseCSVBuffer(fileBuffer);
  
  if (emails.size === 0) {
    return {
      totalRows: failedRows.length,
      successCount: 0,
      failedCount: failedRows.length,
      failedRows
    };
  }

  // Find existing emails in DB to avoid duplicates
  const existing = await Candidate.find({ email: { $in: Array.from(emails) } }, 'email');
  const existingEmails = new Set(existing.map(c => c.email.toLowerCase()));

  const candidatesToInsert = [];
  
  for (const candidate of validCandidates) {
    if (existingEmails.has(candidate.email)) {
      failedRows.push({
        row: candidate.row,
        reason: `Candidate with email "${candidate.email}" already exists in database`
      });
    } else {
      candidatesToInsert.push({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        experience: candidate.experience,
        skills: candidate.skills,
        createdBy: userId
      });
    }
  }

  if (candidatesToInsert.length > 0) {
    await Candidate.insertMany(candidatesToInsert);
  }

  // Sort failures by row number for consistent output
  failedRows.sort((a, b) => a.row - b.row);

  const totalRows = candidatesToInsert.length + failedRows.length;

  // Trigger summary email to the importing admin asynchronously (fire-and-forget)
  User.findById(userId).select('email').then(user => {
    if (user && user.email) {
      sendEmail({
        to: user.email,
        subject: 'CSV Import Summary Report',
        html: csvImportSummaryTemplate({
          totalRows,
          successCount: candidatesToInsert.length,
          failedCount: failedRows.length,
          failedRows
        })
      });
    }
  }).catch(err => {
    console.error('[Import Service] Error fetching user for summary email:', err);
  });

  return {
    totalRows,
    successCount: candidatesToInsert.length,
    failedCount: failedRows.length,
    failedRows
  };
};

module.exports = {
  importCandidates
};
