import dns from 'dns';
// Force Node.js c-ares to use Google DNS — bypasses ISP DNS that blocks SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { PORT } from './app/config/env.js';
import { connectDB, testConnection } from './app/config/database.js';
import { syncUserIndexes } from './app/models/user.js';
import authRoutes from './app/routes/auth.js';
import predictRoutes from './app/routes/predict.js';
import { errorHandler } from './app/middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS
const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...configuredOrigins,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (defaultAllowedOrigins.includes('*') || defaultAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow local development ports and LAN/emulator IPs
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://10.0.2.2:') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.')
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/predict', predictRoutes);

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

const startServer = async () => {
  try {
    await connectDB();
    await testConnection();
    await syncUserIndexes();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('   → Check MONGO_URI and whitelist your IP in MongoDB Atlas Network Access.');
    process.exit(1);
  }
};

startServer();