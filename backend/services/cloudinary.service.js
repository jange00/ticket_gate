const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const config = require('../config/env');
const logger = require('./logging.service');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET
});

/**
 * Upload image from buffer
 */
const uploadImageFromBuffer = (buffer, folder = 'ticketgate', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...options
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          logger.info('Image uploaded to Cloudinary:', result.public_id);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload image from URL
 */
const uploadImageFromUrl = async (url, folder = 'ticketgate', options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: 'image',
      ...options
    });
    logger.info('Image uploaded from URL to Cloudinary:', result.public_id);
    return result;
  } catch (error) {
    logger.error('Cloudinary upload from URL error:', error);
    throw error;
  }
};

/**
 * Upload image from data URI (base64)
 */
const uploadImageFromDataUri = async (dataUri, folder = 'ticketgate', options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
      ...options
    });
    logger.info('Image uploaded from data URI to Cloudinary:', result.public_id);
    return result;
  } catch (error) {
    logger.error('Cloudinary upload from data URI error:', error);
    throw error;
  }
};

/**
 * Upload image from URL or data URI (auto-detect)
 * Handles: data URIs, HTTP/HTTPS URLs, and Cloudinary URLs
 */
const uploadImage = async (imageUrl, folder = 'ticketgate/events', options = {}) => {
  if (!imageUrl) {
    return null;
  }

  // If it's already a Cloudinary URL, return as is
  if (imageUrl.includes('res.cloudinary.com')) {
    logger.info('Image is already a Cloudinary URL, skipping upload');
    return { secure_url: imageUrl };
  }

  // If it's a data URI (base64), upload it
  if (imageUrl.startsWith('data:image/')) {
    return await uploadImageFromDataUri(imageUrl, folder, options);
  }

  // If it's a regular URL, upload it
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return await uploadImageFromUrl(imageUrl, folder, options);
  }

  // Unknown format, return null
  logger.warn('Unknown image URL format:', imageUrl);
  return null;
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info('Image deleted from Cloudinary:', publicId);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Get image URL with transformations
 */
const getImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
};

module.exports = {
  uploadImage, // Auto-detect and upload from URL/data URI
  uploadImageFromBuffer, // Upload from buffer
  uploadImageFromUrl, // Upload from HTTP/HTTPS URL
  uploadImageFromDataUri, // Upload from base64 data URI
  deleteImage,
  getImageUrl,
  cloudinary
};







