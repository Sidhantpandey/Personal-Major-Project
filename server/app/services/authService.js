import User from '../models/user.js';
import { generateToken } from '../utils/jwt.js';

const DEMO_OTP = '123456';

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');

export const register = async (phone, name) => {
  const normalizedPhone = normalizePhone(phone);

  if (!/^\d{10}$/.test(normalizedPhone)) {
    throw new Error('Phone number must be exactly 10 digits');
  }

  const existingUser = await User.findOne({ phone: normalizedPhone });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    phone: normalizedPhone,
    name
  });

  return user;
};

export const requestOtp = async (phone) => {
  const normalizedPhone = normalizePhone(phone);

  if (!/^\d{10}$/.test(normalizedPhone)) {
    throw new Error('Phone number must be exactly 10 digits');
  }

  const user = await User.findOne({ phone: normalizedPhone });
  if (!user) {
    throw new Error('No account found for this phone number');
  }

  return {
    phone: normalizedPhone,
    message: 'OTP sent successfully'
  };
};

export const login = async (phone, otp) => {
  const normalizedPhone = normalizePhone(phone);

  if (!/^\d{10}$/.test(normalizedPhone)) {
    throw new Error('Phone number must be exactly 10 digits');
  }

  const user = await User.findOne({ phone: normalizedPhone });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (String(otp) !== DEMO_OTP) {
    throw new Error('Invalid OTP');
  }

  const token = generateToken({ id: user._id, phone: user.phone });

  return { user: user.toPublicData(), token };
};

export const logout = () => {
  return { message: 'Logged out successfully' };
};
