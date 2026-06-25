import api from "./axios";

export const getCart =
 async () => {
  const response =
    await api.get(
      "/buyer/cart"
    );

  return response.data;
};

export const addToCart =
 async (
   productId,
   quantity
 ) => {
  const response =
    await api.post(
      "/buyer/cart/add",
      {
        productId,
        quantity,
      }
    );

  return response.data;
};

export const removeCartItem =
 async (id) => {
  const response =
    await api.delete(
      `/buyer/cart/items/${id}`
    );

  return response.data;
};