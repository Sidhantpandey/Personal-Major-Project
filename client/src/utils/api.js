const API_BASE_URL = 'https://personal-major-project.onrender.com/api/auth';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Network response was not ok');
  }

  return data;
};

export const authAPI = {
  register: async (payload) => apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  loginRequest: async (payload) => apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: async (payload) => apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  logout: async () => apiRequest('/logout', {
    method: 'POST',
  }),
};

// ML Prediction API
const ML_API_URL = 'http://127.0.0.1:8000/api/v1/predict';

export const predictDisease = async (file, useTTA = false) => {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${ML_API_URL}${useTTA ? '?tta=true' : ''}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `ML API error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};

export default authAPI;
