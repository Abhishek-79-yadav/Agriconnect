import { createSlice } from "@reduxjs/toolkit";

import {
  fetchCart,
  addToCartThunk,
  updateCartThunk,
  removeCartThunk,
} from "../thunks/cartThunk";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart(state) {
      state.items = [];
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(
        addToCartThunk.fulfilled,
        (state, action) => {
          // Backend increments quantity server-side if the product is
          // already in the cart (same response `id`), rather than
          // creating a second row — mirror that here instead of always
          // pushing, or a re-add would show as a duplicate line item.
          const index = state.items.findIndex(
            (item) => item.id === action.payload.id
          );

          if (index >= 0) {
            state.items[index] = action.payload;
          } else {
            state.items.push(action.payload);
          }
        }
      )

      .addCase(updateCartThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);

        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })

      .addCase(removeCartThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.productId !== action.payload);
      });
  },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
