import { body } from 'express-validator';

const phoneValidator = body('phone')
  .trim()
  .matches(/^\d{10}$/)
  .withMessage('Phone number must be exactly 10 digits');

export const validateRegister = [
  phoneValidator,
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
];

export const validateSendOtp = [
  phoneValidator
];

export const validateLogin = [
  phoneValidator,
  body('otp')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('OTP must be 6 digits')
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