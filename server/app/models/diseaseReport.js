import mongoose from 'mongoose';

const diseaseReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cropType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    diseaseLabel: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    recommendations: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

diseaseReportSchema.index({ location: '2dsphere' });
diseaseReportSchema.index({ userId: 1, createdAt: -1 });
diseaseReportSchema.index({ diseaseLabel: 1, createdAt: -1 });

diseaseReportSchema.pre('save', function (next) {
  if (!this.location || !this.location.coordinates || this.location.coordinates.length !== 2) {
    return next(new Error('Location must include [longitude, latitude] coordinates.'));
  }

  const [longitude, latitude] = this.location.coordinates;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    return next(new Error('Location coordinates are out of valid ranges.'));
  }

  return next();
});

const DiseaseReport = mongoose.models.DiseaseReport || mongoose.model('DiseaseReport', diseaseReportSchema);

export default DiseaseReport;
