import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment variables.');
  }

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected successfully.');
};

export const testConnection = async () => {
  try {
    await mongoose.connection.asPromise();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export { connectDB };
export default mongoose;