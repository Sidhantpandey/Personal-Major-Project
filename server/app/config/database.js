import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

export const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment variables.');
  }

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    family: 4, // Force IPv4 — avoids ISP IPv6 DNS blocking SRV records
  });

  console.log('✅ MongoDB connected successfully.');
};

export const testConnection = async () => {
  await mongoose.connection.asPromise();
  console.log('✅ Database connection established.');
};

export default mongoose;