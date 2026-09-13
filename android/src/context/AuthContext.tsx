import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, tokenAPI } from '../utils/api';
import { AppLanguage } from '../utils/language';

export interface User {
  id?: string;
  _id?: string;
  phone: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  sendOtp: (phone: string) => Promise<any>;
  login: (phone: string, otp: string) => Promise<void>;
  register: (phone: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<AppLanguage>('en');

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem('appLanguage', nextLanguage);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedLanguage = await AsyncStorage.getItem('appLanguage');
      if (storedLanguage === 'hi' || storedLanguage === 'en') {
        setLanguageState(storedLanguage as AppLanguage);
      }

      const storedToken = await tokenAPI.getToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const userResp = await authAPI.getCurrentUser();
          const userData = userResp?.data || userResp;
          setUser(userData?.user || userData);
        } catch (err) {
          console.warn('Failed to fetch current user, clearing token', err);
          await tokenAPI.removeToken();
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const sendOtp = useCallback(async (phone: string) => {
    return authAPI.sendOtp(phone);
  }, []);

  const login = useCallback(async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(phone, otp);
      const authToken = response.data?.token || response.token || null;
      if (authToken) {
        await tokenAPI.setToken(authToken);
        setToken(authToken);
      }

      const userFromResp = response.data?.user || response.user;
      if (userFromResp) {
        setUser(userFromResp);
      } else {
        try {
          const me = await authAPI.getCurrentUser();
          const userData = me?.data || me;
          setUser(userData?.user || userData || { phone, name: '' });
        } catch (err) {
          setUser({ phone, name: '' });
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (phone: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(phone, name);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error (continuing with local cleanup):', error);
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    language,
    setLanguage,
    sendOtp,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
