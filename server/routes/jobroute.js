const express = require('express');
const { body, validationResult } = require('express-validator');
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

const jobValidation = [            //job section validation by checking all the input data required as per job fileds

  body('title').notEmpty().withMessage('Title required'),
  body('description').notEmpty().withMessage('Description required'),
  body('company').notEmpty().withMessage('Company required'),
  body('location').notEmpty().withMessage('Location required'),
];
router.post(
  '/',
  protect,
  authorize('employer'),
  ...jobValidation,          //spread array into dividable functions.
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createJob
);


router.get('/',      getJobs); //route to get all jobs which were posted.

router.get('/:id',   getJobById); //route to get a particular job by jobid

router.put('/:id',   protect, authorize('employer'), updateJob); //route to update the job if required any fileds needs to be updated by employer

router.delete('/:id',protect, authorize('employer'), deleteJob); //route to delete the job by filtering with jobid and delete it from the posting.

module.exports = router;
