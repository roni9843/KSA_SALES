import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('super_admin_token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('super_admin_token'),
  loading: false,

  login: async (username, password) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('super_admin_token', token);
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Invalid admin credentials.' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('super_admin_token');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('super_admin_token');
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
      localStorage.removeItem('super_admin_token');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  }
}));
