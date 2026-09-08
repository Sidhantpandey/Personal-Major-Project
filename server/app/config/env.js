import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

// MongoDB
export const MONGO_URI = process.env.MONGO_URI || '';