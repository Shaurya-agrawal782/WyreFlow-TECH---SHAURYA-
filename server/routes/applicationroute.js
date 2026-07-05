const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const uploadResume = require('../middlewares/multer');
const {
  applyJob, myApplications, getJobApplications, updateApplication, withdrawApplication
} = require('../controllers/applicationController');


const uploadResumeSafe = (req, res, next) =>  // it act as a helper to catch errors of multer in process of resume uploading.

  uploadResume.single('resume')(req, res, err => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });

  


router.post('/:jobId', protect, uploadResumeSafe, applyJob);  //jobseeker applies a job with resume


router.get('/me', protect, myApplications);            // jobseeker view/get their applications


router.get('/job/:jobId', protect, getJobApplications);  //


router.patch('/:applicationId', protect, updateApplication); //employer updates the job apllication of jobseeker like - reviewed, rejected, inprogress


router.delete('/:applicationId', protect, withdrawApplication); //jobseeker withdraw his job apllication by himself




module.exports = router;
