'use client'

import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react'
import { CartItem, CartState } from '@/types/cart'

// Action types
type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; payload: CartItem[] }

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.items.find(
                item => item.productId === action.payload.productId
            )

            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.productId === action.payload.productId
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    ),
                    lastUpdated: new Date(),
                }
            }

            return {
                ...state,
                items: [...state.items, action.payload],
                lastUpdated: new Date(),
            }
        }

        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload),
                lastUpdated: new Date(),
            }

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ).filter(item => item.quantity > 0),
                lastUpdated: new Date(),
            }

        case 'CLEAR_CART':
            return {
                items: [],
                lastUpdated: new Date(),
            }

        case 'LOAD_CART':
            return {
                items: action.payload,
                lastUpdated: new Date(),
            }

        default:
            return state
    }
}

// Context
interface CartContextType {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'id'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    getItemQuantity: (productId: number) => number
    isInCart: (productId: number) => boolean
    itemCount: number
    subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'shopping-cart'

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [], lastUpdated: new Date() })

    // Load cart from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(CART_STORAGE_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                dispatch({ type: 'LOAD_CART', payload: parsed })
            } catch (e) {
                console.error('Failed to parse cart from localStorage')
            }
        }
    }, [])

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    }, [state.items])

    const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
        const newItem: CartItem = {
            ...item,
            id: `${item.productId}-${Date.now()}`,
        }
        dispatch({ type: 'ADD_ITEM', payload: newItem })
    }, [])

    const removeItem = useCallback((id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id })
    }, [])

    const updateQuantity = useCallback((id: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    }, [])

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' })
    }, [])

    const getItemQuantity = useCallback((productId: number) => {
        const item = state.items.find(i => i.productId === productId)
        return item?.quantity ?? 0
    }, [state.items])

    const isInCart = useCallback((productId: number) => {
        return state.items.some(i => i.productId === productId)
    }, [state.items])

    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <CartContext.Provider value={{
            items: state.items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            getItemQuantity,
            isInCart,
            itemCount,
            subtotal,
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within CartProvider')
    return context
}