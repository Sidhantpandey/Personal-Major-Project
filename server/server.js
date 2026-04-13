import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { PORT } from './app/config/env.js';
import sequelize, { testConnection } from './app/config/database.js';
import authRoutes from './app/routes/auth.js';
import { errorHandler } from './app/middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Auth server is running' });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Auth API Server', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server with DB sync
const startServer = async () => {
  try {
    // Test DB connection
    await testConnection();

    // Sync database
    await sequelize.sync({ alter: true }); // Use { force: true } in dev to drop and recreate tables
    console.log('Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`Auth server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();