"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { WishlistItem, WishlistState } from "@/types/wishlist";

// Action types
type WishlistAction =
  | { type: "ADD_ITEM"; payload: WishlistItem }
  | { type: "REMOVE_ITEM"; payload: number } // productId
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_WISHLIST"; payload: WishlistItem[] };

// Reducer
function wishlistReducer(
  state: WishlistState,
  action: WishlistAction
): WishlistState {
  switch (action.type) {
    case "ADD_ITEM": {
      // Check if item already exists
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existingItem) {
        // Item already in wishlist, don't add again
        return state;
      }

      return {
        ...state,
        items: [...state.items, action.payload],
        lastUpdated: new Date(),
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.payload),
        lastUpdated: new Date(),
      };

    case "CLEAR_WISHLIST":
      return {
        items: [],
        lastUpdated: new Date(),
      };

    case "LOAD_WISHLIST":
      return {
        items: action.payload,
        lastUpdated: new Date(),
      };

    default:
      return state;
  }
}

// Context
interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "id" | "addedAt">) => void;
  removeItem: (productId: number) => void;
  toggleItem: (item: Omit<WishlistItem, "id" | "addedAt">) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: number) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const WISHLIST_STORAGE_KEY = "product-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    lastUpdated: new Date(),
  });

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        dispatch({ type: "LOAD_WISHLIST", payload: parsed });
      } catch (e) {
        console.error("Failed to parse wishlist from localStorage");
      }
    }
  }, []);

  // Save wishlist to localStorage on change
  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const toggleItem = useCallback(
    (item: Omit<WishlistItem, "id" | "addedAt">) => {
      const exists = state.items.some((i) => i.productId === item.productId);

      if (exists) {
        dispatch({ type: "REMOVE_ITEM", payload: item.productId });
      } else {
        const newItem: WishlistItem = {
          ...item,
          id: `wishlist-${item.productId}-${Date.now()}`,
          addedAt: new Date(),
        };
        dispatch({ type: "ADD_ITEM", payload: newItem });
      }
    },
    [state.items]
  );

  const addItem = useCallback((item: Omit<WishlistItem, "id" | "addedAt">) => {
    const newItem: WishlistItem = {
      ...item,
      id: `wishlist-${item.productId}-${Date.now()}`,
      addedAt: new Date(),
    };
    dispatch({ type: "ADD_ITEM", payload: newItem });
  }, []);

  const removeItem = useCallback((productId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  }, []);

  const clearWishlist = useCallback(() => {
    dispatch({ type: "CLEAR_WISHLIST" });
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => {
      return state.items.some((item) => item.productId === productId);
    },
    [state.items]
  );

  const itemCount = state.items.length;

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        toggleItem,
        clearWishlist,
        isInWishlist,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
