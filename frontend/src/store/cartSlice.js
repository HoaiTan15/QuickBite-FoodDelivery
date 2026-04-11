import { createSlice } from '@reduxjs/toolkit';

const storedCart = localStorage.getItem('cart');

const initialState = {
  items: storedCart ? JSON.parse(storedCart) : [],
  restaurantId: null,
  restaurantName: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const { item, restaurantId, restaurantName } = action.payload;

      // Clear cart if adding from a different restaurant
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = [];
      }

      state.restaurantId = restaurantId;
      state.restaurantName = restaurantName;

      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = '';
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
          if (state.items.length === 0) {
            state.restaurantId = null;
            state.restaurantName = '';
          }
        } else {
          item.quantity = quantity;
        }
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = '';
      localStorage.removeItem('cart');
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export default cartSlice.reducer;
