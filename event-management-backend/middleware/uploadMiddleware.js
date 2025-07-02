// middleware/uploadMiddleware.js
const { S3Client } = require('@aws-sdk/client-s3'); 
const multer = require('multer');
const multerS3 = require('multer-s3'); 
const path = require('path');
const dotenv = require('dotenv').config();

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure Multer S3 Storage
const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  acl: 'public-read', // Makes the uploaded object publicly readable
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    // Generate a unique file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `event-images/${uniqueSuffix}${path.extname(file.originalname)}`); // Store in an 'event-images' folder
  },
});

// Create the Multer upload middleware
const upload = multer({
  storage: s3Storage, // MODIFIED to use S3 storage
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB file size limit
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
    }
  },
});

module.exports = upload;