'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// Tipos del carrito
export interface CartItem {
  id: string; // productId o variantId
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  variant?: {
    id: string;
    name: string;
    values: string; // "Talla: M, Color: Rojo"
  };
  maxStock?: number | null;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
  generateWhatsAppMessage: (businessName: string) => string;
  getWhatsAppUrl: (phone: string, businessName: string) => string;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'catalog-cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingIndex];
        const newQuantity = existingItem.quantity + (action.payload.quantity || 1);

        // Respetar stock máximo si existe
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: existingItem.maxStock
            ? Math.min(newQuantity, existingItem.maxStock)
            : newQuantity,
        };

        return { ...state, items: updatedItems, isOpen: true };
      }

      // Agregar nuevo item
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
        isOpen: true,
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: item.maxStock
                  ? Math.min(action.payload.quantity, item.maxStock)
                  : action.payload.quantity,
              }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [], isOpen: false };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'LOAD_CART':
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const items = JSON.parse(savedCart) as CartItem[];
        dispatch({ type: 'LOAD_CART', payload: items });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      dispatch({ type: 'ADD_ITEM', payload: item as CartItem });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: 'OPEN_CART' });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const generateWhatsAppMessage = useCallback(
    (businessName: string) => {
      if (state.items.length === 0) return '';

      const itemsList = state.items
        .map((item) => {
          const variantInfo = item.variant ? ` (${item.variant.values})` : '';
          return `- ${item.name}${variantInfo} x${item.quantity} = S/ ${(item.price * item.quantity).toFixed(2)}`;
        })
        .join('\n');

      return `¡Hola ${businessName}! Me gustaría hacer el siguiente pedido:\n\n${itemsList}\n\n*Total: S/ ${totalPrice.toFixed(2)}*\n\n¡Gracias!`;
    },
    [state.items, totalPrice]
  );

  const getWhatsAppUrl = useCallback(
    (phone: string, businessName: string) => {
      const message = generateWhatsAppMessage(businessName);
      const cleanPhone = phone.replace(/\D/g, '');
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    },
    [generateWhatsAppMessage]
  );

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
        generateWhatsAppMessage,
        getWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
