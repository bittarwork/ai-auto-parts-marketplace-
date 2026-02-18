const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * ★★★ FILE UPLOAD MIDDLEWARE ★★★
 * Comprehensive file upload handling with multer
 */

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const productsDir = path.join(uploadsDir, 'products');
const categoriesDir = path.join(uploadsDir, 'categories');
const usersDir = path.join(uploadsDir, 'users');

[uploadsDir, productsDir, categoriesDir, usersDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on route
    let dest = uploadsDir;
    
    if (req.baseUrl.includes('/products')) {
      dest = productsDir;
    } else if (req.baseUrl.includes('/categories')) {
      dest = categoriesDir;
    } else if (req.baseUrl.includes('/users') || req.baseUrl.includes('/auth')) {
      dest = usersDir;
    }
    
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

/**
 * Middleware for single image upload
 * Usage: uploadMiddleware.single('fieldName')
 */
exports.uploadSingle = (fieldName = 'image') => {
  return upload.single(fieldName);
};

/**
 * Middleware for multiple image upload
 * Usage: uploadMiddleware.uploadMultiple('fieldName', maxCount)
 */
exports.uploadMultiple = (fieldName = 'images', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Middleware for mixed file upload (multiple fields)
 * Usage: uploadMiddleware.uploadFields([
 *   { name: 'cover', maxCount: 1 },
 *   { name: 'images', maxCount: 5 }
 * ])
 */
exports.uploadFields = (fields) => {
  return upload.fields(fields);
};

/**
 * Process uploaded file and return file info
 */
exports.processUploadedFile = (file) => {
  if (!file) return null;
  
  return {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
  };
};

/**
 * Process multiple uploaded files
 */
exports.processUploadedFiles = (files) => {
  if (!files || files.length === 0) return [];
  
  return files.map(file => exports.processUploadedFile(file));
};

/**
 * Delete file from filesystem
 */
exports.deleteFile = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Delete multiple files
 */
exports.deleteFiles = (filepaths) => {
  return filepaths.map(filepath => exports.deleteFile(filepath));
};

/**
 * Multer error handler middleware
 */
exports.handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

/**
 * Get file URL helper
 */
exports.getFileUrl = (filename, type = 'products') => {
  return `/uploads/${type}/${filename}`;
};

module.exports = exports;
