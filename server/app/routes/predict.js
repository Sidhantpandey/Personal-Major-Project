import express from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// POST /api/predict/upload - Upload photo and get prediction
router.post('/upload', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }

    const { cropType, language } = req.body;
    const userId = req.user.id;

    if (!cropType) {
      return sendError(res, 'Crop type is required', 400);
    }

    // TODO: Call ML model service to make prediction
    // For now, returning mock prediction
    const prediction = {
      id: `pred_${Date.now()}`,
      userId,
      cropType,
      disease: 'Leaf Spot',
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
      language: language || 'English',
      recommendations: [
        'Remove infected leaves and isolate affected plants',
        'Apply a suitable fungicide as per crop stage',
        'Maintain proper ventilation and avoid overwatering',
      ],
      timestamp: new Date(),
    };

    sendSuccess(res, 'Prediction completed successfully', prediction, 200);
  } catch (error) {
    next(error);
  }
});

// GET /api/predict/:predictionId - Get specific prediction
router.get('/:predictionId', authenticate, async (req, res, next) => {
  try {
    const { predictionId } = req.params;
    const userId = req.user.id;

    // TODO: Fetch from database
    // Verify prediction belongs to user
    const prediction = {
      id: predictionId,
      userId,
      cropType: 'Sugarcane',
      disease: 'Leaf Spot',
      confidence: 92,
      language: 'English',
      recommendations: [
        'Remove infected leaves and isolate affected plants',
        'Apply a suitable fungicide as per crop stage',
        'Maintain proper ventilation and avoid overwatering',
      ],
      timestamp: new Date(),
    };

    sendSuccess(res, 'Prediction retrieved successfully', prediction);
  } catch (error) {
    next(error);
  }
});

// GET /api/predict/history?limit=10 - Get user's prediction history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // TODO: Fetch from database with pagination
    const history = [
      {
        id: `pred_${Date.now()}`,
        userId,
        cropType: 'Sugarcane',
        disease: 'Leaf Spot',
        confidence: 92,
        timestamp: new Date(),
      },
      {
        id: `pred_${Date.now() - 1000}`,
        userId,
        cropType: 'Corn',
        disease: 'Rust',
        confidence: 85,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    sendSuccess(res, 'History retrieved successfully', {
      total: history.length,
      predictions: history.slice(0, limit),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/predict/:predictionId - Delete a prediction
router.delete('/:predictionId', authenticate, async (req, res, next) => {
  try {
    const { predictionId } = req.params;
    const userId = req.user.id;

    // TODO: Delete from database
    // Verify prediction belongs to user

    sendSuccess(res, 'Prediction deleted successfully', { id: predictionId });
  } catch (error) {
    next(error);
  }
});

export default router;
