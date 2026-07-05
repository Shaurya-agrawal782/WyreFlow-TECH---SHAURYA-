const Application = require('../models/application');
const Job = require('../models/job');
const { cloudinary } = require('../config/cloudinary');


exports.applyJob = async (req, res) => { //jobseeker appy for a job
  try {
    const jobId = req.params.jobId;

    if (!jobId) return res.status(400).json({ message: 'jobId param is required' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!req.user?._id) return res.status(401).json({ message: 'Not authorized' });

    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });  //amake sure to avoid duplicate applications
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });



let resumeUrl = null;      //resume stroing as  secureurl
let resumePublicId = null;  //resume storing  as publicId 
if (req.file) {
  

  resumeUrl = req.file.path || req.file.secure_url || null;
  resumePublicId = req.file.filename || req.file.public_id || null;
}

const application = await Application.create({
  job: jobId,
  applicant: req.user._id,
  coverLetter: req.body.coverLetter,
  resumeUrl,
  resumePublicId,
  status: 'applied'
});



    return res.status(201).json(application);
  } catch (err) {
    console.error(' Apply Job Error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};


exports.withdrawApplication = async (req, res) => {
  const app = await Application.findById(req.params.applicationId);

  if (!app) return res.status(404).json({ message: 'Application not found' });

  if (app.applicant.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });

  if (app.resumePublicId) {
    await cloudinary.uploader.destroy(app.resumePublicId, { resource_type: 'auto' });
  }

  await app.deleteOne();
  res.json({ message: 'Application withdrawn' });
};


exports.myApplications = async (req, res) => {  //jobseeker to see own applications
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location');
    return res.json(apps);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


exports.getJobApplications = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const apps = await Application.find({ job: jobId })
      .populate('applicant', 'name email');
    return res.json(apps);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.job.employer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const allowed = ['applied', 'reviewed', 'accepted', 'rejected'];
    if (req.body.status && !allowed.includes(req.body.status))
      return res.status(400).json({ message: 'Invalid status' });

    application.status = req.body.status || application.status;
    await application.save();
    return res.json(application);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
