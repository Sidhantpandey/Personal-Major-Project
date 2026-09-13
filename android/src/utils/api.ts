import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Android Emulator, localhost is 10.0.2.2. On Web/iOS it is localhost.
const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultApiUrl();

const normalizeLanguageCode = (language: string = 'en'): string => {
  const normalized = String(language).trim().toLowerCase();
  if (normalized === 'hi' || normalized === 'hindi') return 'hi';
  return 'en';
};

// Token management
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// API request helper with auth
const apiRequest = async (
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    isFormData?: boolean;
    requiresAuth?: boolean;
  } = {}
) => {
  const {
    method = 'GET',
    body,
    isFormData = false,
    requiresAuth = true,
  } = options;

  const headers: Record<string, string> = {};

  // Add auth token if required
  if (requiresAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('No authentication token found');
    }
  }

  // Add content type header if not form data
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (isFormData) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed (${method} ${endpoint}):`, error);
    throw error;
  }
};

// Auth APIs (aligned with website Phone + OTP model)
export const authAPI = {
  sendOtp: async (phone: string) => {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: { phone },
      requiresAuth: false,
    });
  },

  register: async (phone: string, name: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: { phone, name },
      requiresAuth: false,
    });
    return response;
  },

  login: async (phone: string, otp: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { phone, otp },
      requiresAuth: false,
    });
    const token = response.data?.token || response.token;
    if (token) {
      await setToken(token);
    }
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        requiresAuth: true,
      });
    } finally {
      await removeToken();
    }
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
      requiresAuth: true,
    });
  },
};

// Prediction APIs
export const predictionAPI = {
  uploadPhoto: async (
    imageUri: string,
    cropType: string,
    language: string = 'en',
    latitude?: number,
    longitude?: number
  ) => {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, 'photo.jpg');
    } else {
      // React Native mobile upload format
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
    }

    formData.append('cropType', cropType.split(' ')[0]);
    formData.append('language', normalizeLanguageCode(language));

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
    }

    return apiRequest('/predict/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
      requiresAuth: true,
    });
  },

  getPrediction: async (predictionId: string) => {
    return apiRequest(`/predict/${predictionId}`, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  getPredictionHistory: async (limit: number = 10) => {
    return apiRequest(`/predict/history?limit=${limit}`, {
      method: 'GET',
      requiresAuth: true,
    });
  },

  deletePrediction: async (predictionId: string) => {
    return apiRequest(`/predict/${predictionId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  },
};

// Auth token management
export const tokenAPI = {
  getToken,
  setToken,
  removeToken,
  isTokenValid: async (): Promise<boolean> => {
    const token = await getToken();
    return !!token;
  },
};

export default apiRequest;
