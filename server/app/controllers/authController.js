import { validationResult } from 'express-validator';
import User from '../models/user.js';
import { register as registerService, login as loginService, logout as logoutService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 400);
    }

    const { email, password, name } = req.body;

    const user = await registerService(email, password, name);

    sendSuccess(res, 'User registered successfully', user.toPublicData(), 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 400);
    }

    const { email, password } = req.body;

    const result = loginService ? await loginService(email, password) : null;

    sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'User profile retrieved successfully', {
      user: user.toObject ? user.toObject() : user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a real app, get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    const result = logoutService(token);

    sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};