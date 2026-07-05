const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({   //application format/schema displays to the jobseeker after applying to a job.

  job:        { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter:{ type: String },
  resumeUrl:  { type: String },
  resumePublicId: { type: String },
  status:     { type: String, enum: ['applied', 'reviewed', 'accepted', 'rejected'], default: 'applied' }
}, { timestamps: true });


ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });  //Make sure one applicant has only 1 job - means it avoid duplicate job applicants.

module.exports = mongoose.model('Application', ApplicationSchema);
