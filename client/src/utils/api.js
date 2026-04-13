const API_BASE_URL = 'http://localhost:4000/api/auth';

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

export default authAPI;
