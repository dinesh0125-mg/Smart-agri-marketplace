import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";

import {
  getCart,
  addToCart,
  removeCartItem,
} from "../api/cartService";

import { useAuth } from "./AuthContext";

const CartContext = createContext();

const cartReducer = (
  state,
  action
) => {
  switch (action.type) {
    case "SET_CART":
      return {
        ...state,
        cart: Array.isArray(action.payload.items)
          ? action.payload.items
          : [],
        cartSubtotal: action.payload.subtotal || 0,
      };

    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
        cartSubtotal: 0,
      };

    default:
      return state;
  }
};

/** Returns true if the user's role can access the cart endpoint */
const canAccessCart = (user) => {
  if (!user) return false;
  const role = user.role?.toUpperCase?.() ?? "";
  return role === "BUYER" || role === "ADMIN";
};

export const CartProvider = ({
  children,
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [state, dispatch] =
    useReducer(cartReducer, {
      cart: [],
      cartSubtotal: 0,
    });

  // Only load the cart after auth has finished initialising and the user
  // has a role that's allowed to call GET /buyer/cart (BUYER or ADMIN).
  useEffect(() => {
    if (authLoading) return;           // wait for AuthContext to restore session

    if (isAuthenticated && canAccessCart(user)) {
      loadCart();
    } else {
      // Clear local cart state when logged out or non-buyer role
      dispatch({ type: "CLEAR_CART" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, authLoading]);

  const loadCart = async () => {
    try {
      const response =
        await getCart();

      // Backend returns: { success, message, data: CartResponse }
      // CartResponse shape: { cartId, items: [...], subtotal, totalItems }
      const cartResponse =
        response?.data || response || {};

      dispatch({
        type: "SET_CART",
        payload: {
          items: cartResponse.items || [],
          subtotal: cartResponse.subtotal || 0,
        },
      });
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );

      dispatch({
        type: "SET_CART",
        payload: { items: [], subtotal: 0 },
      });
    }
  };

  const addItem = async (
    productId,
    quantity = 1
  ) => {
    try {
      await addToCart(
        productId,
        quantity
      );

      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem =
    async (itemId) => {
      try {
        await removeCartItem(
          itemId
        );

        await loadCart();
      } catch (error) {
        console.error(error);
      }
    };

  const clearCart = () => {
    dispatch({
      type: "CLEAR_CART",
    });
  };

  const cartCount =
    Array.isArray(
      state.cart
    )
      ? state.cart.reduce(
          (
            total,
            item
          ) =>
            total +
            (item.quantity ||
              0),
          0
        )
      : 0;

  const cartTotal = state.cartSubtotal || 0;

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        cartCount,
        cartTotal,
        addItem,
        removeItem,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () =>
  useContext(
    CartContext
  );