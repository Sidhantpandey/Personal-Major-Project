import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateToken } from '../utils/jwt.js';
import { BCRYPT_ROUNDS } from '../config/env.js';

export const register = async (email, password, name) => {
  // Check if user exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    name
  });

  return user;
};

export const login = async (email, password) => {
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken({ id: user.id, email: user.email });

  return { user: user.toPublicData(), token };
};

export const logout = (token) => {
  // In a real app, you might blacklist the token
  // For now, just return success
  return { message: 'Logged out successfully' };
};