import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to Android emulator host. Override with `EXPO_PUBLIC_API_BASE_URL` env var for device or production.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:3000/api';

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

// Auth APIs
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: { email, password, name },
      requiresAuth: false,
    });
    if (response.data?.token) {
      await setToken(response.data.token);
    }
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false,
    });
    if (response.data?.token) {
      await setToken(response.data.token);
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
  uploadPhoto: async (imageUri: string, cropType: string, language: string = 'English') => {
    const formData = new FormData();

    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append('image', blob, 'photo.jpg');
    formData.append('cropType', cropType);
    formData.append('language', language);

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
