# 🌿 Plant Disease Detection — FastAPI ML Server

> **For the Node.js developer:** This is the Python ML backend that your Express server calls to get plant disease predictions. You send an image, you get back a disease name + confidence score.

---

## Quick Start

### 1. Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Model weights** — `ml-weights/OmniCrops/best_omnicrops_swinv2.pth` (~337 MB) + `metadata.json` must be present (not committed to git — ask the ML team)

### 2. Setup

```bash
cd model

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and edit env file
cp .env.example .env
# Edit .env with your database credentials, JWT secret, etc.
```

### 3. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The ML model loads at startup (~10-30 seconds on first run — it downloads SwinV2-B backbone weights). After that, the server is ready.

### 4. Verify it's running

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Plant Disease Detection API",
  "version": "1.0.0",
  "ml_model_loaded": "True"
}
```

If `ml_model_loaded` is `"False"`, the model weights file is missing or corrupt.

---

## 🔌 API Reference — Prediction Endpoint

### `POST /api/v1/predict`

Upload a plant leaf image and get a disease prediction.

#### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `multipart/form-data` | ✅ Yes | Plant leaf image (JPEG, PNG, WebP, BMP, TIFF) — max 10 MB |
| `tta` | `query param` (bool) | ❌ No | Set `?tta=true` for 5× Test-Time Augmentation (slower but more accurate) |

#### Response — Success (200)

```json
{
  "status": "success",
  "message": "Prediction completed.",
  "data": {
    "predicted_class": "Tomato___Bacterial_Spot",
    "confidence": 97.32,
    "all_probabilities": {
      "Apple___Black_Rot": 0.01,
      "Apple___Cedar_Rust": 0.0,
      "Apple___Healthy": 0.02,
      "Tomato___Bacterial_Spot": 97.32,
      "...": "..."
    },
    "tta_views": null
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `predicted_class` | `string` | Top predicted class (format: `Crop___Disease`) |
| `confidence` | `number` | Confidence percentage (0–100) |
| `all_probabilities` | `object` | Probability (%) for all 48 classes |
| `tta_views` | `number\|null` | Number of TTA views used (null if TTA was off, `5` if on) |

#### Response — Errors

| Status | When |
|--------|------|
| `400` | Empty file uploaded |
| `413` | File exceeds 10 MB |
| `415` | Unsupported file type (not an image) |
| `500` | Model inference failed (corrupted image, etc.) |
| `503` | ML model not loaded yet |

---

## 🟢 Node.js Integration Code

### Using `node-fetch` + `form-data`

```bash
npm install node-fetch form-data
```

#### Create a service: `app/services/predictionService.js`

```javascript
import fetch from 'node-fetch';
import FormData from 'form-data';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

/**
 * Predict plant disease from image buffer.
 *
 * @param {Buffer} imageBuffer - Raw image file buffer
 * @param {string} filename    - Original filename (e.g. 'leaf.jpg')
 * @param {boolean} useTTA     - Enable Test-Time Augmentation (slower, more accurate)
 * @returns {Promise<object>}  - { predicted_class, confidence, all_probabilities }
 */
export async function predictDisease(imageBuffer, filename, useTTA = false) {
  const form = new FormData();
  form.append('file', imageBuffer, {
    filename: filename,
    contentType: 'image/jpeg',
  });

  const url = `${ML_API_URL}/api/v1/predict${useTTA ? '?tta=true' : ''}`;

  const response = await fetch(url, {
    method: 'POST',
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `ML API error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}
```

#### Use it in a controller: `app/controllers/predictionController.js`

```javascript
import { predictDisease } from '../services/predictionService.js';

export async function predict(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      });
    }

    const result = await predictDisease(
      req.file.buffer,
      req.file.originalname,
      req.query.tta === 'true'
    );

    return res.json({
      success: true,
      message: 'Prediction successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
```

#### Add route: `app/routes/prediction.js`

```javascript
import express from 'express';
import multer from 'multer';
import { predict } from '../controllers/predictionController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/predict — requires auth + image upload
router.post('/', authenticate, upload.single('file'), predict);

export default router;
```

#### Register in `server.js`

```javascript
import predictionRoutes from './app/routes/prediction.js';

// Add alongside your existing routes:
app.use('/api/predict', predictionRoutes);
```

#### Add to `.env`

```env
ML_API_URL=http://localhost:8000
```

---

## 🧪 Quick Test with cURL

```bash
# Standard prediction
curl -X POST http://localhost:8000/api/v1/predict \
  -F "file=@/path/to/leaf_image.jpg"

# With TTA (more accurate)
curl -X POST "http://localhost:8000/api/v1/predict?tta=true" \
  -F "file=@/path/to/leaf_image.jpg"
```

---

## 📋 All 48 Disease Classes

The model can detect diseases across **15 crop types**:

| Crop | Classes |
|------|---------|
| 🍎 Apple | Black Rot, Cedar Rust, Healthy, Scab |
| 🫑 Bell Pepper | Bacterial Spot, Healthy |
| 🫐 Blueberry | Healthy |
| 🍒 Cherry | Healthy, Powdery Mildew |
| 🌽 Corn | Common Rust, Gray Leaf Spot, Healthy, Northern Leaf Blight |
| 🍇 Grape | Black Rot, Esca Black Measles, Healthy, Leaf Blight |
| 🍊 Orange | Citrus Greening |
| 🍑 Peach | Bacterial Spot, Healthy |
| 🥔 Potato | Early Blight, Healthy, Late Blight |
| 🫐 Raspberry | Healthy |
| 🌾 Rice | Bacterial Leaf Blight, Brown Spot, Healthy, Hispa, Leaf Blast, Leaf Scald, Narrow Brown Leaf Spot, Neck Blast, Sheath Blight, Tungro |
| 🫘 Soybean | Healthy |
| 🎃 Squash | Powdery Mildew |
| 🍓 Strawberry | Healthy, Leaf Scorch |
| 🍅 Tomato | Bacterial Spot, Early Blight, Healthy, Late Blight, Leaf Mold, Mosaic Virus, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus |

---

## 🏗️ Architecture

```
Node.js (Express)          Python (FastAPI)
─────────────────          ────────────────
User uploads image    →    POST /api/v1/predict
  via /api/predict              │
                                ▼
                         Load & preprocess image
                                │
                                ▼
                         SwinV2-B + FPN inference
                         (48-class classification)
                                │
                                ▼
JSON response         ←    { predicted_class,
  to user                    confidence,
                             all_probabilities }
```

**Ports:**
- Node.js server: `PORT` from your `.env` (typically `3000` or `5000`)
- FastAPI ML server: `8000` (default)

Both servers must be running simultaneously.

---

## 📁 Project Structure

```
model/
├── ml-weights/OmniCrops/           # ← NOT in git (download separately)
│   ├── best_omnicrops_swinv2.pth   #    trained model weights (337 MB)
│   └── metadata.json               #    class names + dataset info
├── app/
│   ├── api/v1/
│   │   ├── auth.py                 # JWT auth endpoints
│   │   ├── predict.py              # POST /api/v1/predict ← YOU CALL THIS
│   │   └── users.py                # User management
│   ├── core/
│   │   ├── config.py               # Settings (ML_WEIGHTS_DIR, DB, JWT, etc.)
│   │   ├── dependencies.py         # Auth dependencies
│   │   └── security.py             # JWT + password hashing
│   ├── schemas/
│   │   ├── prediction.py           # Prediction response schema
│   │   └── user.py                 # User schemas
│   ├── services/
│   │   ├── ml_model.py             # SwinV2+FPN model class definition
│   │   ├── ml_service.py           # ML inference service
│   │   └── user_service.py         # User CRUD
│   └── main.py                     # App entry point (loads model at startup)
├── .env.example
├── requirements.txt
└── README.md                       # ← You are here
```

---

## ❓ FAQ

**Q: The server starts but `ml_model_loaded` is `False`?**
A: The `ml-weights/OmniCrops/` folder is missing or incomplete. You need both `best_omnicrops_swinv2.pth` and `metadata.json`.

**Q: First startup is very slow?**
A: Normal — PyTorch downloads SwinV2-B backbone weights (~350 MB) on first run. Subsequent starts are faster (~10-15s to load model into memory).

**Q: Can I run this without a GPU?**
A: Yes! CPU inference works. Single prediction takes ~500ms-2s on CPU vs ~50-100ms on GPU.

**Q: What's TTA and when should I use it?**
A: Test-Time Augmentation runs the image through 5 different views (original, flipped, cropped, rotated) and averages the results. Use `?tta=true` for critical predictions where accuracy matters more than speed. It's ~5× slower.

**Q: Do I need the database running to use `/predict`?**
A: The `/predict` endpoint itself doesn't require the database. However, if you've added auth middleware to protect it, the database must be running for JWT validation.
