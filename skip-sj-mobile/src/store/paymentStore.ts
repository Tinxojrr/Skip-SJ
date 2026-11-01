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
  baesBalance: number;
  selectedPaymentMethod: 'bancoestado' | 'junaeb' | 'card' | 'mach';
  selectedCardId: string | null;
  isLoading: boolean;
  
  // Acciones
  loadPaymentData: () => Promise<void>;
  addCard: (card: Omit<SavedCard, 'id' | 'createdAt' | 'isDefault'>) => Promise<SavedCard>;
  removeCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<void>;
  setSelectedPaymentMethod: (method: 'bancoestado' | 'junaeb' | 'card' | 'mach', cardId?: string) => void;
  deductBaesBalance: (amount: number) => Promise<boolean>;
  rechargeBaesBalance: (amount: number) => Promise<void>;
}

const CARDS_STORAGE_KEY = 'skip_sj_saved_cards';
const BAES_STORAGE_KEY = 'skip_sj_baes_balance';
const INITIAL_BAES_BALANCE = 42500; // Saldo de beneficio institucional Duoc UC

export const usePaymentStore = create<PaymentState>((set, get) => ({
  savedCards: [],
  baesBalance: INITIAL_BAES_BALANCE,
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
          set({ selectedCardId: defaultCard.id });
        }
      }

      // 2. Cargar saldo BAES
      const storedBalance = await SecureStore.getItemAsync(BAES_STORAGE_KEY);
      if (storedBalance !== null) {
        set({ baesBalance: parseInt(storedBalance, 10) });
      } else {
        await SecureStore.setItemAsync(BAES_STORAGE_KEY, String(INITIAL_BAES_BALANCE));
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
    set({ savedCards: updatedCards, selectedCardId: newCard.id });
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

  deductBaesBalance: async (amount: number) => {
    const current = get().baesBalance;
    if (current < amount) {
      return false; // Fondos insuficientes
    }
    const next = current - amount;
    set({ baesBalance: next });
    await SecureStore.setItemAsync(BAES_STORAGE_KEY, String(next));
    return true;
  },

  rechargeBaesBalance: async (amount: number) => {
    const next = get().baesBalance + amount;
    set({ baesBalance: next });
    await SecureStore.setItemAsync(BAES_STORAGE_KEY, String(next));
  }
}));

// Auto-cargar en inicialización
usePaymentStore.getState().loadPaymentData();
