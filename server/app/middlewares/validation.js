import { body } from 'express-validator';

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validatePredictionUpload = [
  body('cropType')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Crop type is required and must be at least 2 characters long'),
  body('latitude')
    .notEmpty()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90'),
  body('longitude')
    .notEmpty()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180')
];