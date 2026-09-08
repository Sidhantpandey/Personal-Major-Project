import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { generateToken } from '../utils/jwt.js';
import { BCRYPT_ROUNDS } from '../config/env.js';

export const register = async (email, password, name) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    email,
    password: hashedPassword,
    name
  });

  return user;
};

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ id: user._id, email: user.email });

  return { user: user.toPublicData(), token };
};

export const logout = (token) => {
  return { message: 'Logged out successfully' };
};