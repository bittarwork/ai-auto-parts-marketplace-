const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors from express-validator
 * Should be used after validation rules
 * 
 * Usage:
 * router.post('/login', 
 *   [body('email').isEmail(), body('password').notEmpty()],
 *   validate,
 *   authController.login
 * );
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for common fields
 */
const { body, param, query } = require('express-validator');

exports.loginRules = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.forgotPasswordRules = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail()
];

exports.resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number')
];

exports.registerRules = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(05|5)\d{8}$/).withMessage('Please provide a valid Saudi phone number')
];

exports.productRules = [
  body('name.en')
    .notEmpty().withMessage('English name is required'),
  body('partNumber')
    .notEmpty().withMessage('Part number is required')
    .trim()
    .toUpperCase(),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID')
];

// Update stock validation rules
exports.updateStockRules = [
  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isNumeric().withMessage('Stock must be a number')
    .isInt({ min: 0 }).withMessage('Stock must be a positive number')
];

exports.vehicleRules = [
  body('brand')
    .notEmpty().withMessage('Brand is required')
    .isIn(['Chery', 'Geely', 'MG', 'Haval', 'Great Wall', 'Changan', 'BYD'])
    .withMessage('Invalid brand'),
  body('model')
    .notEmpty().withMessage('Model is required'),
  body('year')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year')
];

exports.searchRules = [
  body('query')
    .notEmpty().withMessage('Search query is required')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Query must be between 2 and 200 characters'),
  body('language')
    .optional()
    .isIn(['ar', 'en']).withMessage('Language must be either "ar" or "en"')
];

exports.mongoIdRules = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];
