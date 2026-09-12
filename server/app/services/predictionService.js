import DiseaseReport from '../models/diseaseReport.js';
import { ML_SERVICE_URL } from '../config/env.js';
import cloudinary from '../config/cloudinary.js';
import { generateRecommendations, buildFallbackRecommendations } from './recommendationService.js';

const defaultRecommendations = [
  'Inspect the field closely for additional infection spots.',
  'Remove heavily affected leaves or plants to reduce spread.',
  'Follow crop-specific fungicide or treatment guidance from an agronomist.'
];

const recommendationMap = [
  {
    keywords: ['leaf spot', 'leaf_spot', 'spot'],
    items: [
      'Remove infected leaves and isolate affected plants.',
      'Apply an appropriate fungicide based on the crop stage.',
      'Avoid overhead watering to limit leaf wetness.'
    ],
  },
  {
    keywords: ['rust'],
    items: [
      'Remove rust-affected foliage and dispose of it safely.',
      'Use a rust-targeted treatment approved for your crop.',
      'Ensure proper air circulation and avoid excess moisture.'
    ],
  },
  {
    keywords: ['blight'],
    items: [
      'Prune and remove blighted tissue immediately.',
      'Avoid dense planting and improve spacing for airflow.',
      'Apply a recommended preventive spray where suitable.'
    ],
  },
  {
    keywords: ['mildew', 'powdery'],
    items: [
      'Reduce humidity around the crop canopy.',
      'Apply mildew-specific treatment and inspect adjacent plants.',
      'Remove severely infected growth to prevent spread.'
    ],
  },
  {
    keywords: ['healthy', 'normal'],
    items: [
      'Continue regular monitoring and crop care.',
      'Maintain balanced irrigation and nutrition.',
      'Keep a preventive field inspection schedule.'
    ],
  },
];

const normalizeDisease = (value = '') => String(value).trim();

export const buildRecommendations = (diseaseLabel = '', language = 'en') => {
  const normalized = normalizeDisease(diseaseLabel).toLowerCase();

  for (const item of recommendationMap) {
    const matches = item.keywords.some((keyword) => normalized.includes(keyword));
    if (matches) {
      const localized = item.items.map((entry) => entry);
      if (language === 'hi') {
        return [
          'संक्रमित पत्ते हटाएं और प्रभावित पौधों को अलग करें।',
          'फसल के सही चरण पर उपयुक्त फफूंदनाशक लगाएं।',
          'अतिरिक्त नमी और कम हवा से बचें।'
        ];
      }
      return localized;
    }
  }

  return buildFallbackRecommendations(diseaseLabel, language);
};

export const validateLocation = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error('Latitude and longitude must be valid numbers.');
  }

  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90.');
  }

  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180.');
  }

  return { latitude: lat, longitude: lng };
};

export const createReport = async ({ userId, cropType, latitude, longitude, language, imageUrl = '', imageName = '' }) => {
  const { latitude: lat, longitude: lng } = validateLocation(latitude, longitude);

  const report = await DiseaseReport.create({
    userId,
    cropType: String(cropType || '').trim(),
    diseaseLabel: 'pending',
    confidence: 0,
    recommendations: [],
    status: 'pending',
    imageUrl,
    location: {
      type: 'Point',
      coordinates: [lng, lat],
    },
  });

  return report;
};

export const uploadImageToCloudinary = async (buffer, originalName) => {
  const hasCloudinaryConfig = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

  if (!hasCloudinaryConfig) {
    return { secure_url: '' };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'crop-disease-detections',
        public_id: `${Date.now()}-${String(originalName || 'crop-image').replace(/\s+/g, '-').toLowerCase()}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          secure_url: result?.secure_url || '',
        });
      }
    );

    uploadStream.end(buffer);
  });
};

export const updateReportWithPrediction = async (reportId, predictionData) => {
  const diseaseLabel = normalizeDisease(predictionData?.predicted_class || predictionData?.diseaseLabel || 'Unknown');
  const confidence = Number(predictionData?.confidence ?? 0);
  const language = predictionData.language || 'en';
  const aiRecommendations = (predictionData?.recommendations && predictionData.recommendations.length)
    ? predictionData.recommendations
    : (predictionData?.all_probabilities ? await generateRecommendations({
        cropType: predictionData.cropType,
        diseaseLabel,
        confidence,
        allProbabilities: predictionData.all_probabilities,
        language,
      }) : buildFallbackRecommendations(diseaseLabel, language));

  const payload = {
    diseaseLabel,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(confidence, 100)) : 0,
    recommendations: aiRecommendations,
    status: 'completed',
    rawModelResponse: predictionData || {},
  };

  const updated = await DiseaseReport.findByIdAndUpdate(reportId, payload, { new: true }).populate('userId', 'name phone');

  return updated;
};

export const markReportFailed = async (reportId, errorMessage = 'Prediction failed') => {
  return DiseaseReport.findByIdAndUpdate(
    reportId,
    {
      status: 'failed',
      metadata: {
        failureReason: errorMessage,
      },
    },
    { new: true }
  );
};

export const getReportById = async (reportId, userId) => {
  const query = userId ? { _id: reportId, userId } : { _id: reportId };
  return DiseaseReport.findOne(query).populate('userId', 'name phone');
};

export const getUserHistory = async (userId, limit = 50) => {
  return DiseaseReport.find({ userId })
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 50)
    .lean();
};

export const getHeatmapPoints = async ({ diseaseLabel, bbox, radiusKm, latitude, longitude, limit = 500 }) => {
  const query = { status: 'completed' };

  if (diseaseLabel) {
    query.diseaseLabel = new RegExp(String(diseaseLabel), 'i');
  }

  if (bbox && Array.isArray(bbox) && bbox.length === 4) {
    const [minLng, minLat, maxLng, maxLat] = bbox.map(Number);
    query.location = {
      $geoWithin: {
        $box: [[minLng, minLat], [maxLng, maxLat]],
      },
    };
  } else if (latitude && longitude && radiusKm) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusInRadians = Number(radiusKm) / 6378.1;

    query.location = {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians],
      },
    };
  }

  const docs = await DiseaseReport.find(query)
    .select('location cropType diseaseLabel confidence recommendations createdAt userId')
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 500)
    .lean();

  return {
    type: 'FeatureCollection',
    features: docs.map((doc) => ({
      type: 'Feature',
      geometry: doc.location,
      properties: {
        id: doc._id.toString(),
        cropType: doc.cropType,
        diseaseLabel: doc.diseaseLabel,
        confidence: doc.confidence,
        recommendations: doc.recommendations,
        createdAt: doc.createdAt,
        userId: doc.userId?.toString?.() || doc.userId,
      },
    })),
  };
};

export const callMlService = async ({ fileBuffer, mimeType, fileName, tta = false }) => {
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimeType || 'image/jpeg' });
  formData.append('file', blob, fileName || 'crop-image.jpg');
  formData.append('tta', String(Boolean(tta)));

  const response = await fetch(ML_SERVICE_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ML service request failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  return payload?.data || payload;
};
