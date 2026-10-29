import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const THEME_STORAGE_KEY = 'skip_sj_theme_dark_mode';

export const useThemeStore = create<ThemeState>((set) => {
  // Cargar preferencia persistida de forma asíncrona (si existe)
  SecureStore.getItemAsync(THEME_STORAGE_KEY)
    .then((saved) => {
      if (saved !== null) {
        set({ isDarkMode: saved === 'true' });
      }
    })
    .catch(() => {});

  return {
    isDarkMode: true, // Modo Oscuro Obsidian POR DEFECTO
    toggleDarkMode: () =>
      set((state) => {
        const next = !state.isDarkMode;
        SecureStore.setItemAsync(THEME_STORAGE_KEY, String(next)).catch(() => {});
        return { isDarkMode: next };
      }),
    setDarkMode: (value: boolean) => {
      SecureStore.setItemAsync(THEME_STORAGE_KEY, String(value)).catch(() => {});
      set({ isDarkMode: value });
    }
  };
});


