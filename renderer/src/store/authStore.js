import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  register: async (username, password, roles) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/register', { username, password, roles });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  registerMerchant: async (merchantData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register-merchant', merchantData);
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      } else {
        set({ loading: false });
      }
      return { success: true, message: response.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Merchant registration failed.';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    set({ loading: true });
    try {
      const response = await api.get('/auth/me');
      set({
        user: response.data.user,
        isAuthenticated: true,
        loading: false
      });
    } catch (err) {
      localStorage.removeItem('token');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  }
}));
