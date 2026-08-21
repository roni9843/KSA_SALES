import { create } from 'zustand';
import api from '../utils/api';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/settings');
      set({ settings: response.data.settings, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch settings', loading: false });
    }
  },

  updateSettings: async (updatedFields) => {
    set({ loading: true });
    try {
      const response = await api.put('/settings', updatedFields);
      set({ settings: response.data.settings, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update settings';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  }
}));
