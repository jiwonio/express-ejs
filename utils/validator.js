// modules/validator.js

import { validationResult } from 'express-validator';

// Validation result handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.error('Validation failed', 400,
      errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    );
  }
  next();
};

/**
 * Utility function that combines validation rules and error handler
 * @param {Array} rules - express-validator validation rules array
 * @returns {Array} - middleware array
 */
const validate = (rules) => {
  return [
    ...rules,
    handleValidationErrors
  ];
};

export default validate;