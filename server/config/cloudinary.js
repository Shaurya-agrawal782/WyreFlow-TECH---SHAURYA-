const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const resumeStorage = new CloudinaryStorage({    //storage configuartion for resume processing
  cloudinary,
  params: {
    folder: 'job-platform/resumes',
    resource_type: 'raw',              //  Resume type - raw
    allowed_formats: ['pdf', 'doc', 'docx'],
    public_id: (req, file) => `${req.user._id}_${Date.now()}`
  }
});
module.exports = { cloudinary, resumeStorage };
