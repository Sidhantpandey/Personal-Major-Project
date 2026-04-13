import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return sendError(res, messages.join(', '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  // Custom errors
  if (err.message) {
    return sendError(res, err.message, 400);
  }

  // Default server error
  sendError(res, 'Something went wrong', 500);
};