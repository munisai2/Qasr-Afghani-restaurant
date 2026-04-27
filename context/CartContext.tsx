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
  items:               CartItem[]
  isOpen:              boolean
  orderType:           'pickup' | 'pickup-scheduled' | 'dine-in' | 'reservation'
  isScheduled:         boolean
  scheduledTime:       string | null   // ISO datetime string or null
  guestCount:          number
  tableNumber:         string
  appliedPromoCode:    string | null
  promoDiscountAmount: number
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
  | { type: 'SET_ORDER_TYPE';      payload: CartState['orderType'] }
  | { type: 'SET_IS_SCHEDULED';    payload: boolean }
  | { type: 'SET_SCHEDULED_TIME';  payload: string | null }
  | { type: 'SET_GUEST_COUNT';     payload: number }
  | { type: 'SET_TABLE_NUMBER';    payload: string }
  | { type: 'APPLY_PROMO';         payload: { code: string; discount: number } }
  | { type: 'REMOVE_PROMO' }
  | { type: 'HYDRATE'; payload: Partial<CartState> }

// ═══════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════

const initialState: CartState = { 
  items: [], 
  isOpen: false, 
  orderType: 'pickup', 
  isScheduled: false,
  scheduledTime: null, 
  guestCount: 1,
  tableNumber: '',
  appliedPromoCode: null,
  promoDiscountAmount: 0
}

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
      return { ...state, orderType: action.payload }
    case 'SET_IS_SCHEDULED':
      return { ...state, isScheduled: action.payload }
    case 'SET_SCHEDULED_TIME':
      return { ...state, scheduledTime: action.payload }
    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.payload }
    case 'SET_TABLE_NUMBER':
      return { ...state, tableNumber: action.payload }
    case 'APPLY_PROMO':
      return { ...state, appliedPromoCode: action.payload.code, promoDiscountAmount: action.payload.discount }
    case 'REMOVE_PROMO':
      return { ...state, appliedPromoCode: null, promoDiscountAmount: 0 }
    case 'HYDRATE':
      return { 
        ...state, 
        ...action.payload,
        items: action.payload.items || [],
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
  orderType: CartState['orderType']
  isScheduled: boolean
  scheduledTime: string | null
  guestCount: number
  tableNumber: string
  appliedPromoCode: string | null
  promoDiscountAmount: number
  setOrderType: (type: CartState['orderType']) => void
  setIsScheduled: (val: boolean) => void
  setScheduledTime: (time: string | null) => void
  setGuestCount: (num: number) => void
  setTableNumber: (num: string) => void
  applyPromo: (code: string, discount: number) => void
  removePromo: () => void
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
              isScheduled: parsed.isScheduled,
              scheduledTime: parsed.scheduledTime,
              guestCount: parsed.guestCount ?? 1,
              tableNumber: parsed.tableNumber ?? '',
              appliedPromoCode: parsed.appliedPromoCode ?? null,
              promoDiscountAmount: parsed.promoDiscountAmount ?? 0
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
      isScheduled: state.isScheduled,
      scheduledTime: state.scheduledTime,
      guestCount: state.guestCount,
      tableNumber: state.tableNumber,
      appliedPromoCode: state.appliedPromoCode,
      promoDiscountAmount: state.promoDiscountAmount
    }))
  }, [state.items, state.orderType, state.isScheduled, state.scheduledTime, state.guestCount, state.tableNumber, state.appliedPromoCode, state.promoDiscountAmount])

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
  const discountedSubtotal = Math.max(0, subtotal - state.promoDiscountAmount)
  const tax = discountedSubtotal * 0.08
  const total = discountedSubtotal + tax

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } }), [])
  const addItemWithQty = useCallback((item: Omit<CartItem, 'quantity'>, qty: number) => dispatch({ type: 'ADD_ITEM_WITH_QTY', payload: { ...item, quantity: 1, initialQty: qty } }), [])
  const removeItem = useCallback((id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } }), [])
  const incrementItem = useCallback((id: string) => dispatch({ type: 'INCREMENT', payload: { id } }), [])
  const decrementItem = useCallback((id: string) => dispatch({ type: 'DECREMENT', payload: { id } }), [])
  const setOrderType = useCallback((type: CartState['orderType']) => dispatch({ type: 'SET_ORDER_TYPE', payload: type }), [])
  const setIsScheduled = useCallback((val: boolean) => dispatch({ type: 'SET_IS_SCHEDULED', payload: val }), [])
  const setScheduledTime = useCallback((time: string | null) => dispatch({ type: 'SET_SCHEDULED_TIME', payload: time }), [])
  const setGuestCount = useCallback((num: number) => dispatch({ type: 'SET_GUEST_COUNT', payload: num }), [])
  const setTableNumber = useCallback((num: string) => dispatch({ type: 'SET_TABLE_NUMBER', payload: num }), [])
  const applyPromo = useCallback((code: string, discount: number) => dispatch({ type: 'APPLY_PROMO', payload: { code, discount } }), [])
  const removePromo = useCallback(() => dispatch({ type: 'REMOVE_PROMO' }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), [])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), [])
  const isInCart = useCallback((id: string) => state.items.some((i) => i.id === id), [state.items])
  const getItemQuantity = useCallback((id: string) => state.items.find((i) => i.id === id)?.quantity ?? 0, [state.items])

  const value = useMemo(() => ({
    state, dispatch, itemCount, subtotal, tax, total, storeStatus,
    orderType: state.orderType, isScheduled: state.isScheduled,
    scheduledTime: state.scheduledTime, guestCount: state.guestCount,
    tableNumber: state.tableNumber, appliedPromoCode: state.appliedPromoCode,
    promoDiscountAmount: state.promoDiscountAmount,
    addItem, addItemWithQty, removeItem, incrementItem, decrementItem,
    setOrderType, setIsScheduled, setScheduledTime, setGuestCount, setTableNumber,
    applyPromo, removePromo, clearCart, openCart, closeCart, isInCart, getItemQuantity,
  }), [state, itemCount, subtotal, tax, total, storeStatus,
    addItem, addItemWithQty, removeItem, incrementItem, decrementItem,
    setOrderType, setIsScheduled, setScheduledTime, setGuestCount, setTableNumber,
    applyPromo, removePromo, clearCart, openCart, closeCart, isInCart, getItemQuantity])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
