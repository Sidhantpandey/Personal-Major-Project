import { verifyToken } from '../utils/jwt.js';
import User from '../models/user.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return sendError(res, 'Invalid token.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 'Invalid token.', 401);
  }
};