import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface SavedCard {
  id: string;
  cardNumber: string; // Formato con máscara, ej. **** **** **** 4242
  cardLast4: string;
  cardName: string;
  expiry: string;
  brand: 'visa' | 'mastercard' | 'otra';
  isDefault: boolean;
  createdAt: string;
}

interface PaymentState {
  savedCards: SavedCard[];
  selectedPaymentMethod: 'bancoestado' | 'card' | 'mach';
  selectedCardId: string | null;
  isLoading: boolean;
  
  // Acciones
  loadPaymentData: () => Promise<void>;
  addCard: (card: Omit<SavedCard, 'id' | 'createdAt' | 'isDefault'>) => Promise<SavedCard>;
  removeCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<void>;
  setSelectedPaymentMethod: (method: 'bancoestado' | 'card' | 'mach', cardId?: string) => void;
}

const CARDS_STORAGE_KEY = 'skip_sj_saved_cards';

export const usePaymentStore = create<PaymentState>((set, get) => ({
  savedCards: [],
  selectedPaymentMethod: 'bancoestado',
  selectedCardId: null,
  isLoading: true,

  loadPaymentData: async () => {
    try {
      // 1. Cargar tarjetas guardadas
      const storedCards = await SecureStore.getItemAsync(CARDS_STORAGE_KEY);
      if (storedCards) {
        const parsed: SavedCard[] = JSON.parse(storedCards);
        set({ savedCards: parsed });
        const defaultCard = parsed.find(c => c.isDefault) || parsed[0];
        if (defaultCard) {
          set({ selectedCardId: defaultCard.id, selectedPaymentMethod: 'card' });
        }
      }
    } catch (e) {
      console.error('Error cargando datos de pago seguros:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addCard: async (newCardData) => {
    const brand: 'visa' | 'mastercard' | 'otra' = 
      newCardData.cardNumber.replace(/\s/g, '').startsWith('4') ? 'visa' :
      newCardData.cardNumber.replace(/\s/g, '').startsWith('5') ? 'mastercard' : 'otra';

    const cleanNumber = newCardData.cardNumber.replace(/\s/g, '');
    const cardLast4 = cleanNumber.slice(-4);
    const maskedNumber = `•••• •••• •••• ${cardLast4}`;

    const newCard: SavedCard = {
      id: `card_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      cardNumber: maskedNumber,
      cardLast4,
      cardName: newCardData.cardName.trim().toUpperCase(),
      expiry: newCardData.expiry,
      brand,
      isDefault: get().savedCards.length === 0,
      createdAt: new Date().toISOString(),
    };

    const updatedCards = [...get().savedCards, newCard];
    set({ savedCards: updatedCards, selectedCardId: newCard.id, selectedPaymentMethod: 'card' });
    await SecureStore.setItemAsync(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
    return newCard;
  },

  removeCard: async (id: string) => {
    const updatedCards = get().savedCards.filter(c => c.id !== id);
    set({ 
      savedCards: updatedCards,
      selectedCardId: updatedCards.length > 0 ? updatedCards[0].id : null
    });
    await SecureStore.setItemAsync(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  },

  setDefaultCard: async (id: string) => {
    const updatedCards = get().savedCards.map(c => ({
      ...c,
      isDefault: c.id === id,
    }));
    set({ savedCards: updatedCards, selectedCardId: id });
    await SecureStore.setItemAsync(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
  },

  setSelectedPaymentMethod: (method, cardId) => {
    set({ 
      selectedPaymentMethod: method,
      ...(cardId ? { selectedCardId: cardId } : {})
    });
  },
}));

// Auto-cargar en inicialización
usePaymentStore.getState().loadPaymentData();

