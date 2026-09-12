import { validationResult } from 'express-validator';
import User from '../models/user.js';
import { register as registerService, login as loginService, logout as logoutService, requestOtp as requestOtpService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 400);
    }

    const { phone, name } = req.body;
    const user = await registerService(phone, name);

    sendSuccess(res, 'User registered successfully', user.toPublicData(), 201);
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 400);
    }

    const { phone } = req.body;
    const result = await requestOtpService(phone);

    sendSuccess(res, result.message, { phone: result.phone });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 400);
    }

    const { phone, otp } = req.body;
    const result = await loginService(phone, otp);

    sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'User profile retrieved successfully', {
      user: user.toPublicData(),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const result = logoutService();
    sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
};
