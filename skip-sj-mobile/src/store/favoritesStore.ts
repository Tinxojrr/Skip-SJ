import { create } from 'zustand';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  storeName: string;
  imageUrl?: string;
  emoji?: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  toggleFavorite: (item: FavoriteItem) => {
    const { favorites } = get();
    const exists = favorites.some((f) => f.id === item.id);

    if (exists) {
      set({ favorites: favorites.filter((f) => f.id !== item.id) });
    } else {
      set({ favorites: [item, ...favorites] });
    }
  },

  isFavorite: (id: string) => {
    return get().favorites.some((f) => f.id === id);
  }
}));

