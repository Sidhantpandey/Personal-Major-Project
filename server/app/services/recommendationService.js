import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_MODEL } from '../config/env.js';

const fallbackRecommendations = {
  en: {
    leaf_spot: [
      'Remove infected leaves and isolate affected plants.',
      'Apply a crop-safe fungicide at the recommended stage.',
      'Avoid overhead irrigation and improve air circulation.'
    ],
    rust: [
      'Remove rust-affected foliage and prune crowded stems.',
      'Apply a disease-specific fungicide suitable for the crop.',
      'Improve spacing and reduce excess moisture in the canopy.'
    ],
    blight: [
      'Prune and discard blighted tissue immediately.',
      'Reduce leaf wetness and improve field ventilation.',
      'Follow a preventive spray schedule for the crop.'
    ],
    mildew: [
      'Reduce humidity near the canopy and avoid crowded planting.',
      'Use a mildew-appropriate treatment and inspect neighboring crops.',
      'Improve airflow and monitor for recurring spread.'
    ],
    healthy: [
      'Continue the current crop care routine.',
      'Keep monitoring the field for early signs of stress.',
      'Maintain proper irrigation, nutrition, and disease prevention.'
    ],
    default: [
      'Inspect the field for additional symptoms before treatment.',
      'Consult a local agronomist or extension officer for crop-specific advice.',
      'Maintain regular monitoring and preventive crop care.'
    ],
  },
  hi: {
    leaf_spot: [
      'संक्रमित पत्ते हटाएं और प्रभावित पौधों को अलग करें।',
      'फसल के सही चरण पर एक सुरक्षित फफूंदनाशक लगाएं।',
      'ओवरहेड सिंचाई से बचें और हवा का प्रवाह बेहतर बनाएं।'
    ],
    rust: [
      'जंग से प्रभावित पत्तियों को हटाएं और घने तनों को छंटनी करें।',
      'फसल के अनुरूप रोग-विशिष्ट फफूंदनाशक का उपयोग करें।',
      'स्थान बढ़ाएं और पत्तियों में अतिरिक्त नमी कम करें।'
    ],
    blight: [
      'अखिल प्रभावित हिस्से तुरंत काटें और हटाएं।',
      'पत्ती की नमी कम करें और खेत में हवा का प्रवाह बेहतर बनाएं।',
      'फसल के लिए रोकथाम स्प्रे की समय-सीमा का पालन करें।'
    ],
    mildew: [
      'पत्तियों के पास नमी कम करें और भीड़ वाली रोपाई से बचें।',
      'मिल्ड्यू-उपयुक्त उपचार का प्रयोग करें और पड़ोसी फसलों की जांच करें।',
      'हवा का प्रवाह बेहतर बनाएं और फिर से फैलने की स्थिति पर निगरानी रखें।'
    ],
    healthy: [
      'वर्तमान फसल की देखभाल का क्रम जारी रखें।',
      'खेत में तनाव के शुरुआती लक्षणों की निगरानी करें।',
      'सही सिंचाई, पोषण और रोग-रोकथाम बनाए रखें।'
    ],
    default: [
      'उपचार से पहले खेत में अन्य लक्षणों की जांच करें।',
      'फसल-विशिष्ट सलाह के लिए स्थानीय कृषि विशेषज्ञ से परामर्श करें।',
      'नियमित निगरानी और रोग-रोकथाम बनाए रखें।'
    ],
  },
};

const normalizeDisease = (value = '') => String(value).trim().toLowerCase();
const normalizeLanguage = (value = 'en') => {
  const language = String(value).trim().toLowerCase();
  return language === 'hi' || language === 'hindi' ? 'hi' : 'en';
};

export const buildFallbackRecommendations = (diseaseLabel = 'unknown', language = 'en') => {
  const normalized = normalizeDisease(diseaseLabel);
  const languageCode = normalizeLanguage(language);
  const collection = fallbackRecommendations[languageCode] || fallbackRecommendations.en;

  if (normalized.includes('leaf spot')) return collection.leaf_spot;
  if (normalized.includes('rust')) return collection.rust;
  if (normalized.includes('blight')) return collection.blight;
  if (normalized.includes('mildew') || normalized.includes('powdery')) return collection.mildew;
  if (normalized.includes('healthy') || normalized.includes('normal')) return collection.healthy;

  return collection.default;
};

export const generateRecommendations = async ({
  cropType,
  diseaseLabel,
  confidence,
  allProbabilities,
  language = 'en',
}) => {
  if (!OPENAI_API_KEY) {
    return buildFallbackRecommendations(diseaseLabel, language);
  }

  try {
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    const lang = normalizeLanguage(language);

    const probabilitySummary = allProbabilities && typeof allProbabilities === 'object'
      ? Object.entries(allProbabilities)
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .slice(0, 5)
          .map(([name, val]) => `${name}: ${Number(val).toFixed(2)}%`)
          .join(', ')
      : 'No probability breakdown available';

    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `You are an agricultural advisor. Respond only with a JSON array of 3 concise, practical recommendations in ${lang === 'hi' ? 'Hindi' : 'English'}. Keep them actionable and specific to the crop and disease. Do not mention being an AI.`
        },
        {
          role: 'user',
          content: `Crop: ${cropType || 'unknown'}\nDisease: ${diseaseLabel || 'unknown'}\nConfidence: ${confidence ?? 0}%\nTop probabilities: ${probabilitySummary}\nReturn JSON only like ["recommendation 1","recommendation 2","recommendation 3"]`
        }
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices?.[0]?.message?.content ?? '[]';
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3);
    }

    if (Array.isArray(parsed.recommendations)) {
      return parsed.recommendations.slice(0, 3);
    }

    return buildFallbackRecommendations(diseaseLabel, lang);
  } catch (error) {
    console.error('GPT recommendation generation failed:', error.message || error);
    return buildFallbackRecommendations(diseaseLabel, language);
  }
};
