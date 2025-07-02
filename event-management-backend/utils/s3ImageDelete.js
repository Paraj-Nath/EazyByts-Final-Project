// backend/utils/s3ImageDelete.js
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv').config(); // Ensure dotenv is loaded for env vars

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to extract S3 Key from a given S3 URL
const getS3KeyFromUrl = (url) => {
  // Basic check for S3 URL format
  if (!url || !url.includes('.s3.') || !url.includes(process.env.AWS_S3_BUCKET_NAME)) {
    return null;
  }
  try {
    // Assuming URL format like: https://<bucket-name>.s3.<region>.amazonaws.com/<key>
    const urlObj = new URL(url);
    // The pathname usually starts with a '/', so slice it off
    const key = decodeURIComponent(urlObj.pathname.substring(1));
    return key;
  } catch (error) {
    console.error('Error parsing S3 URL to get key:', error);
  }
  return null;
};

// @desc    Deletes an object from S3 given its full public URL
// @param   {string} imageUrl - The full public URL of the S3 object to delete
// @returns {Promise<boolean>} - True if deletion was attempted and successful or key was invalid, false if S3 error.
const deleteS3ImageByUrl = async (imageUrl) => {
  if (!imageUrl) {
    console.log('No image URL provided for S3 deletion.');
    return true; // Consider it successful if there's nothing to delete
  }

  const imageKey = getS3KeyFromUrl(imageUrl);

  if (!imageKey) {
    console.warn(`Invalid S3 image URL or cannot extract key for deletion: ${imageUrl}`);
    return true; // Not an S3 URL or malformed, so nothing to delete from S3
  }

  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: imageKey,
    }));
    console.log(`Successfully deleted S3 object: ${imageKey}`);
    return true;
  } catch (s3Err) {
    console.error(`Failed to delete S3 object ${imageKey}:`, s3Err.message);
    // Depending on your error handling, you might re-throw or return false
    return false; // Indicate that deletion failed
  }
};

module.exports = {
  deleteS3ImageByUrl,
};