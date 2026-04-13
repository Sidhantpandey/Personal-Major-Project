import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);

    if (response.success) {
      const { token, user: responseUser } = response.data || {};
      if (token && responseUser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(responseUser));
        setUser(responseUser);
      }
    }

    return response;
  };

  const register = async (payload) => {
    const response = await authAPI.register(payload);

    if (response.success) {
      const loginResponse = await login({ email: payload.email, password: payload.password });
      return loginResponse;
    }

    return response;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
