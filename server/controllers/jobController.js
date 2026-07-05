const Job = require('../models/job');


exports.createJob = async (req, res) => {   //employer only - create job
  try {
    const { title, description, company, location, salary, type, industry, skills } = req.body;
    if (!title || !description || !company || !location)
      return res.status(400).json({ message: 'title, description, company, location required' });

    
    let skillsArray = [];
    if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);  //skills normalizing by using array
    } else if (Array.isArray(skills)) {
      skillsArray = skills.map(s => s.trim().toLowerCase());
    }

    const job = await Job.create({    //response to be display and store in database in this format.
      title,
      description,
      company,
      location,
      salary,
      type,
      industry,
      skills: skillsArray,
      employer: req.user._id
    });

    return res.status(201).json(job);
   } catch (err) {
  console.error('Apply Job Error:', err); 
  res.status(500).json({ message: err.message || 'Server error' });
}
}


exports.getJobs = async (req, res) => {   //searching by keywords like location, company, skills and filter options/ pagination also included.
  try {
    const { q, location, company, industry, skills, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (company) filter.company = { $regex: company, $options: 'i' };
    if (industry) filter.industry = { $regex: industry, $options: 'i' };

    if (q) filter.$text = { $search: q };

    if (skills) {
      let skillsArray = skills;
      if (typeof skills === 'string') {
        skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      }
      filter.skills = { $all: skillsArray };
    }

    const skip = (Number(page) - 1) * Number(limit);  //pagination for user interface

    const [items, total] = await Promise.all([
      Job.find(filter)
        .populate('employer', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Job.countDocuments(filter)
    ]);

    return res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    Object.assign(job, req.body);
    await job.save();

    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
