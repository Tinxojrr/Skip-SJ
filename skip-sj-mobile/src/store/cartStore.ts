import { create } from 'zustand';

interface CartItem {
  id: string; // product_id
  name: string;
  price: number;
  quantity: number;
  storeName?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, action: 'increase' | 'decrease') => void;
  clearCart: () => void;
  getTotal: () => number;
}

// Datos de prueba iniciales para visualizar el carrito
const mockInitialItems: CartItem[] = [
  { id: '1', name: 'Promo Churrasco Italiano + Bebida', price: 6500, quantity: 1, storeName: 'Paradiso' },
  { id: '2', name: 'Porción de Choclo', price: 2200, quantity: 2, storeName: 'Achoclonado' },
];

export const useCartStore = create<CartState>((set, get) => ({
  items: mockInitialItems,
  
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(item => item.id === newItem.id);
    if (existingItem) {
      return {
        items: state.items.map(item => 
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      };
    }
    return { items: [...state.items, newItem] };
  }),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),

  updateQuantity: (id, action) => set((state) => {
    return {
      items: state.items.map(item => {
        if (item.id === id) {
          const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity: Math.max(1, newQuantity) }; // Evitar que baje de 1, para eso se usa removeItem
        }
        return item;
      })
    };
  }),
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
