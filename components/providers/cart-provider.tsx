"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

export const CART_STORAGE_KEY = "mini-ec/cart/v1";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  maxStock: number;
};

export type AddCartItem = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

export type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  addItem: (item: AddCartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: AddCartItem }
  | { type: "updateQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export const CartContext = createContext<CartContextValue | null>(null);

function normalizeQuantity(quantity: number, maxStock: number) {
  const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1;
  const safeMaxStock = Number.isFinite(maxStock) ? Math.max(0, Math.floor(maxStock)) : 0;
  return Math.min(Math.max(1, safeQuantity), safeMaxStock);
}

function normalizeItem(item: CartItem): CartItem | null {
  const maxStock = Number.isFinite(item.maxStock)
    ? Math.max(0, Math.floor(item.maxStock))
    : 0;

  if (maxStock <= 0) {
    return null;
  }

  return {
    ...item,
    price: Number.isFinite(item.price) ? Math.max(0, Math.floor(item.price)) : 0,
    maxStock,
    quantity: normalizeQuantity(item.quantity, maxStock),
  };
}

function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items
        .map((item) => normalizeItem(item))
        .filter((item): item is CartItem => item !== null);
    case "add": {
      if (!Number.isFinite(action.item.maxStock) || action.item.maxStock <= 0) {
        return items;
      }

      const incomingQuantity = action.item.quantity ?? 1;
      const existing = items.find((item) => item.productId === action.item.productId);

      if (!existing) {
        const newItem = normalizeItem({
          ...action.item,
          quantity: incomingQuantity,
        });

        return newItem ? [...items, newItem] : items;
      }

      return items.map((item) => {
        if (item.productId !== action.item.productId) {
          return item;
        }

        const maxStock = Number.isFinite(action.item.maxStock)
          ? Math.max(0, Math.floor(action.item.maxStock))
          : 0;
        return {
          ...item,
          name: action.item.name,
          price: Math.max(0, Math.floor(action.item.price)),
          imageUrl: action.item.imageUrl,
          maxStock,
          quantity: normalizeQuantity(item.quantity + incomingQuantity, maxStock),
        };
      });
    }
    case "updateQuantity":
      return items.map((item) =>
        item.productId === action.productId
          ? {
              ...item,
              quantity: normalizeQuantity(action.quantity, item.maxStock),
            }
          : item,
      );
    case "remove":
      return items.filter((item) => item.productId !== action.productId);
    case "clear":
      return items.length === 0 ? items : [];
    default:
      return items;
  }
}

function readStoredCart() {
  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as CartItem[]) : [];
  } catch {
    return [];
  }
}

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    dispatch({ type: "hydrate", items: readStoredCart() });

    const timerId = window.setTimeout(() => {
      hasHydratedRef.current = true;
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    return {
      items,
      totalQuantity,
      totalAmount,
      addItem: (item) => dispatch({ type: "add", item }),
      updateQuantity: (productId, quantity) =>
        dispatch({ type: "updateQuantity", productId, quantity }),
      removeItem: (productId) => dispatch({ type: "remove", productId }),
      clearCart: () => dispatch({ type: "clear" }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
