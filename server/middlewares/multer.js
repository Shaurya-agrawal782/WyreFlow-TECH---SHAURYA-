const multer = require('multer'); //importing multer from multer useful for resume storing process in cloudinary storage.

const { resumeStorage } = require('../config/cloudinary');


const fileFilter = (req, file, cb) => {     //Accept only these file types and allows the only types for resume storing.

  const allowed = ['application/pdf', 'application/msword',
                   'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF, DOC, DOCX allowed'));
};

const uploadResume = multer({   //resume uploading size and storage path/place.
  storage: resumeStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mb Limit for files storage.
});

module.exports = uploadResume;
