'use client'

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react'
import { getStoreStatus } from '@/lib/storeHours'
import type { StoreStatus } from '@/lib/storeHours'
import type { OpeningHours } from '@/types/sanity'

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface CartItem {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  prepTime?: number
  image?: string
  specialInstructions?: string
}

interface CartState {
  items:         CartItem[]
  isOpen:        boolean
  orderType:     'pickup' | 'dine-in'
  scheduledTime: string | null   // ISO datetime string or null
  tableNumber:   string
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'ADD_ITEM_WITH_QTY'; payload: CartItem & { initialQty: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'INCREMENT'; payload: { id: string } }
  | { type: 'DECREMENT'; payload: { id: string } }
  | { type: 'UPDATE_INSTRUCTIONS'; payload: { id: string; instructions: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'SET_ORDER_TYPE'; payload: 'pickup' | 'dine-in' }
  | { type: 'SET_SCHEDULED_TIME'; payload: string | null }
  | { type: 'SET_TABLE_NUMBER'; payload: string }
  | { type: 'HYDRATE'; payload: { items: CartItem[]; orderType?: 'pickup' | 'dine-in'; scheduledTime?: string | null; tableNumber?: string } }

// ═══════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════

const initialState: CartState = { items: [], isOpen: false, orderType: 'pickup', scheduledTime: null, tableNumber: '' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id)
      if (existing) {
        return { ...state, items: state.items.map((i) => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i) }
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] }
    }
    case 'ADD_ITEM_WITH_QTY': {
      const { initialQty, ...item } = action.payload
      const existing = state.items.find((i) => i.id === item.id)
      if (existing) {
        return { ...state, items: state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + initialQty } : i) }
      }
      return { ...state, items: [...state.items, { ...item, quantity: initialQty }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) }
    case 'INCREMENT':
      return { ...state, items: state.items.map((i) => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i) }
    case 'DECREMENT': {
      const item = state.items.find((i) => i.id === action.payload.id)
      if (item && item.quantity <= 1) return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) }
      return { ...state, items: state.items.map((i) => i.id === action.payload.id ? { ...i, quantity: i.quantity - 1 } : i) }
    }
    case 'UPDATE_INSTRUCTIONS':
      return { ...state, items: state.items.map((i) => i.id === action.payload.id ? { ...i, specialInstructions: action.payload.instructions } : i) }
    case 'CLEAR_CART':
      return { ...initialState }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.payload, scheduledTime: action.payload === 'dine-in' ? null : state.scheduledTime }
    case 'SET_SCHEDULED_TIME':
      return { ...state, scheduledTime: action.payload }
    case 'SET_TABLE_NUMBER':
      return { ...state, tableNumber: action.payload }
    case 'HYDRATE':
      return { 
        ...state, 
        items: action.payload.items, 
        orderType: action.payload.orderType || 'pickup',
        scheduledTime: action.payload.scheduledTime || null,
        tableNumber: action.payload.tableNumber || ''
      }
    default:
      return state
  }
}

// ═══════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════

interface CartContextValue {
  state: CartState
  dispatch: React.Dispatch<CartAction>
  itemCount: number
  subtotal: number
  tax: number
  total: number
  storeStatus: StoreStatus
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  addItemWithQty: (item: Omit<CartItem, 'quantity'>, qty: number) => void
  removeItem: (id: string) => void
  incrementItem: (id: string) => void
  decrementItem: (id: string) => void
  setOrderType: (type: 'pickup' | 'dine-in') => void
  setScheduledTime: (time: string | null) => void
  setTableNumber: (num: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  isInCart: (id: string) => boolean
  getItemQuantity: (id: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

interface CartProviderProps {
  children: React.ReactNode
  openingHours?: OpeningHours[]
}

export function CartProvider({ children, openingHours }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('qasr-cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.items?.length > 0) {
          dispatch({ 
            type: 'HYDRATE', 
            payload: {
              items: parsed.items,
              orderType: parsed.orderType,
              scheduledTime: parsed.scheduledTime,
              tableNumber: parsed.tableNumber
            }
          })
        }
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    sessionStorage.setItem('qasr-cart', JSON.stringify({ 
      items: state.items,
      orderType: state.orderType,
      scheduledTime: state.scheduledTime,
      tableNumber: state.tableNumber
    }))
  }, [state.items, state.orderType, state.scheduledTime, state.tableNumber])

  useEffect(() => {
    document.body.style.overflow = state.isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [state.isOpen])

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const storeStatus = useMemo(
    () => getStoreStatus(openingHours ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openingHours, tick]
  )

  const itemCount = useMemo(() => state.items.reduce((s, i) => s + i.quantity, 0), [state.items])
  const subtotal = useMemo(() => state.items.reduce((s, i) => s + i.price * i.quantity, 0), [state.items])
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } }), [])
  const addItemWithQty = useCallback((item: Omit<CartItem, 'quantity'>, qty: number) => dispatch({ type: 'ADD_ITEM_WITH_QTY', payload: { ...item, quantity: 1, initialQty: qty } }), [])
  const removeItem = useCallback((id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } }), [])
  const incrementItem = useCallback((id: string) => dispatch({ type: 'INCREMENT', payload: { id } }), [])
  const decrementItem = useCallback((id: string) => dispatch({ type: 'DECREMENT', payload: { id } }), [])
  const setOrderType = useCallback((type: 'pickup' | 'dine-in') => dispatch({ type: 'SET_ORDER_TYPE', payload: type }), [])
  const setScheduledTime = useCallback((time: string | null) => dispatch({ type: 'SET_SCHEDULED_TIME', payload: time }), [])
  const setTableNumber = useCallback((num: string) => dispatch({ type: 'SET_TABLE_NUMBER', payload: num }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), [])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), [])
  const isInCart = useCallback((id: string) => state.items.some((i) => i.id === id), [state.items])
  const getItemQuantity = useCallback((id: string) => state.items.find((i) => i.id === id)?.quantity ?? 0, [state.items])

  const value = useMemo(() => ({
    state, dispatch, itemCount, subtotal, tax, total, storeStatus,
    addItem, addItemWithQty, removeItem, incrementItem, decrementItem,
    setOrderType, setScheduledTime, setTableNumber,
    clearCart, openCart, closeCart, isInCart, getItemQuantity,
  }), [state, itemCount, subtotal, tax, total, storeStatus,
    addItem, addItemWithQty, removeItem, incrementItem, decrementItem,
    setOrderType, setScheduledTime, setTableNumber,
    clearCart, openCart, closeCart, isInCart, getItemQuantity])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
