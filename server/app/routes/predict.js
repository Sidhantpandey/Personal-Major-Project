import express from 'express';
import multer from 'multer';
import { validationResult } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { validatePredictionUpload } from '../middlewares/validation.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  callMlService,
  createReport,
  getHeatmapPoints,
  getReportById,
  getUserHistory,
  markReportFailed,
  updateReportWithPrediction,
  buildRecommendations,
  uploadImageToCloudinary,
} from '../services/predictionService.js';

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
      return;
    }

    cb(new Error('Only image files are allowed'), false);
  },
});

// POST /api/predict/upload - Upload photo and get prediction
router.post('/upload', authenticate, upload.single('image'), validatePredictionUpload, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 'Validation failed', 400);
    }

    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }

    const { cropType, latitude, longitude, language, tta } = req.body;

    let imageUrl = '';

    try {
      const cloudinaryResult = await uploadImageToCloudinary(req.file.buffer, req.file.originalname || 'crop-image.jpg');
      imageUrl = cloudinaryResult?.secure_url || '';
    } catch (uploadError) {
      console.error('Cloudinary upload failed:', uploadError);
    }

    const report = await createReport({
      userId: req.user._id,
      cropType,
      latitude,
      longitude,
      language,
      imageUrl,
    });

    try {
      const prediction = await callMlService({
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        fileName: req.file.originalname || 'crop-image.jpg',
        tta: Boolean(tta),
      });

      const diseaseLabel = prediction?.predicted_class || prediction?.diseaseLabel || 'Unknown';
      const recommendations = prediction?.recommendations || buildRecommendations(diseaseLabel, language || 'en');

      const completedReport = await updateReportWithPrediction(report._id, {
        ...prediction,
        cropType,
        language,
        diseaseLabel,
        recommendations,
      });

      return sendSuccess(res, 'Prediction completed successfully', completedReport, 200);
    } catch (mlError) {
      await markReportFailed(report._id, mlError.message || 'ML model request failed');
      return sendError(res, 'Prediction failed while running the ML model', 500);
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/predict/history?limit=10 - Get user's prediction history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user._id;
    const history = await getUserHistory(userId, limit);

    return sendSuccess(res, 'History retrieved successfully', {
      total: history.length,
      predictions: history,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/predict/heatmap - Get heatmap data
router.get('/heatmap', authenticate, async (req, res, next) => {
  try {
    const { diseaseLabel, latitude, longitude, radiusKm, bbox, limit = 500 } = req.query;

    const points = await getHeatmapPoints({
      diseaseLabel,
      latitude,
      longitude,
      radiusKm,
      bbox: typeof bbox === 'string' ? bbox.split(',').map(Number) : undefined,
      limit,
    });

    return sendSuccess(res, 'Heatmap data retrieved successfully', points);
  } catch (error) {
    next(error);
  }
});

// GET /api/predict/:predictionId - Get specific prediction
router.get('/:predictionId', authenticate, async (req, res, next) => {
  try {
    const { predictionId } = req.params;
    const prediction = await getReportById(predictionId, req.user._id);

    if (!prediction) {
      return sendError(res, 'Prediction not found', 404);
    }

    return sendSuccess(res, 'Prediction retrieved successfully', prediction);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/predict/:predictionId - Delete a prediction
router.delete('/:predictionId', authenticate, async (req, res, next) => {
  try {
    const { predictionId } = req.params;
    const prediction = await getReportById(predictionId, req.user._id);

    if (!prediction) {
      return sendError(res, 'Prediction not found', 404);
    }

    await prediction.deleteOne();
    return sendSuccess(res, 'Prediction deleted successfully', { id: predictionId });
  } catch (error) {
    next(error);
  }
});

export default router;
